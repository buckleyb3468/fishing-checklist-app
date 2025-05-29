import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';

const FISH_SPECIES = [
  'Bass', 'Trout', 'Salmon', 'Pike', 'Catfish', 'Walleye', 'Perch',
  'Bluegill', 'Crappie', 'Carp', 'Other'
];

const TECHNIQUES = [
  'Fly Fishing', 'Baitcasting', 'Spinning', 'Trolling', 'Ice Fishing', 'Other'
];

const LURES = [
  'Worms', 'Minnows', 'Spinners', 'Jigs', 'Crankbaits', 'Topwater', 'Other'
];

interface CatchData {
  species: string;
  weight: string;
  length: string;
  location: string;
  notes: string;
  image: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  timestamp: string;
  lure: string;
  technique: string;
}

// Simple storage utility for Expo
const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem(key);
    } catch (error) {
      console.warn('Storage not available');
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem(key, value);
    } catch (error) {
      console.warn('Storage not available');
    }
  }
};

export default function LogCatchScreen() {
  const [catchData, setCatchData] = useState<CatchData>({
    species: '',
    weight: '',
    length: '',
    location: '',
    notes: '',
    image: null,
    coordinates: null,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    lure: '',
    technique: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [showLureModal, setShowLureModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [currentTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19));

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: imageStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (imageStatus !== 'granted' || locationStatus !== 'granted') {
        Alert.alert('Permissions Required', 'Please enable camera and location permissions to use all features.');
      }
    } catch (error) {
      console.warn('Permission request failed:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!catchData.species) newErrors.species = 'Species is required';
    if (!catchData.weight) newErrors.weight = 'Weight is required';
    if (!catchData.location) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      setUploadingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCatchData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setUploadingImage(false);
    }
  };

  const takePhoto = async () => {
    try {
      setUploadingImage(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCatchData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setCatchData(prev => ({
        ...prev,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        location: `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please enter manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newCatch = {
        ...catchData,
        id: Date.now().toString(),
        user: 'buckleyb3468',
      };
      
      const existingCatches = await Storage.getItem('catches');
      const catches = existingCatches ? JSON.parse(existingCatches) : [];
      catches.push(newCatch);
      
      await Storage.setItem('catches', JSON.stringify(catches));
      
      Alert.alert(
        'Success',
        'Catch logged successfully!',
        [
          {
            text: 'View Dashboard',
            onPress: () => router.push('/DashboardScreen')
          },
          {
            text: 'Log Another',
            onPress: () => {
              setCatchData({
                species: '',
                weight: '',
                length: '',
                location: '',
                notes: '',
                image: null,
                coordinates: null,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                lure: '',
                technique: ''
              });
              setErrors({});
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save catch. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderModal = (
    visible: boolean, 
    onClose: () => void, 
    title: string, 
    data: string[], 
    onSelect: (item: string) => void
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Log Your Catch</Text>
        
        <View style={styles.card}>
          <Text style={styles.timeText}>
            Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):{'\n'}
            {currentTime}{'\n\n'}
            Current User's Login: buckleyb3468
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Fish Species *</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectButton]}
            onPress={() => setShowSpeciesModal(true)}
          >
            <Text style={[styles.selectButtonText, !catchData.species && styles.placeholderText]}>
              {catchData.species || 'Select Species'}
            </Text>
          </TouchableOpacity>
          {errors.species && <Text style={styles.errorText}>{errors.species}</Text>}

          <Text style={styles.label}>Weight (lbs) *</Text>
          <TextInput
            style={[styles.input, errors.weight && styles.inputError]}
            placeholder="e.g., 4.5"
            value={catchData.weight}
            onChangeText={text => setCatchData(prev => ({ ...prev, weight: text }))}
            keyboardType="decimal-pad"
          />
          {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}

          <Text style={styles.label}>Length (inches)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 18"
            value={catchData.length}
            onChangeText={text => setCatchData(prev => ({ ...prev, length: text }))}
            keyboardType="decimal-pad"
          />

          <View style={styles.locationContainer}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, styles.locationInput, errors.location && styles.inputError]}
                placeholder="e.g., Lake Powell, Colorado River"
                value={catchData.location}
                onChangeText={text => setCatchData(prev => ({ ...prev, location: text }))}
              />
              <TouchableOpacity
                style={[styles.locationButton, gettingLocation && styles.buttonDisabled]}
                onPress={getCurrentLocation}
                disabled={gettingLocation}
              >
                <Text style={styles.locationButtonText}>
                  {gettingLocation ? '...' : '📍'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <Text style={styles.label}>Lure/Bait Used</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectButton]}
            onPress={() => setShowLureModal(true)}
          >
            <Text style={[styles.selectButtonText, !catchData.lure && styles.placeholderText]}>
              {catchData.lure || 'Select Lure/Bait'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Fishing Technique</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectButton]}
            onPress={() => setShowTechniqueModal(true)}
          >
            <Text style={[styles.selectButtonText, !catchData.technique && styles.placeholderText]}>
              {catchData.technique || 'Select Technique'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Additional notes about the catch..."
            value={catchData.notes}
            onChangeText={text => setCatchData(prev => ({ ...prev, notes: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {catchData.image && (
            <Image source={{ uri: catchData.image }} style={styles.imagePreview} />
          )}

          <TouchableOpacity 
            style={[styles.button, styles.imageButton, uploadingImage && styles.buttonDisabled]}
            onPress={showImageOptions}
            disabled={uploadingImage}
          >
            <Text style={styles.buttonText}>
              {uploadingImage ? 'Loading...' : catchData.image ? '📷 Change Photo' : '📷 Add Photo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>✅ Save Catch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderModal(
        showSpeciesModal,
        () => setShowSpeciesModal(false),
        'Select Fish Species',
        FISH_SPECIES,
        (species) => setCatchData(prev => ({ ...prev, species }))
      )}

      {renderModal(
        showLureModal,
        () => setShowLureModal(false),
        'Select Lure/Bait',
        LURES,
        (lure) => setCatchData(prev => ({ ...prev, lure }))
      )}

      {renderModal(
        showTechniqueModal,
        () => setShowTechniqueModal(false),
        'Select Technique',
        TECHNIQUES,
        (technique) => setCatchData(prev => ({ ...prev, technique }))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  selectButton: {
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 8,
    marginTop: -8,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  locationButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  imageButton: {
    backgroundColor: '#2196F3',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
});