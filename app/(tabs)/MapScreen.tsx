import { router } from 'expo-router';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { 
  Alert, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Linking,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';

interface CatchLocation {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  species: string;
  weight: string;
  date: string;
  lure?: string;
  technique?: string;
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

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [catches, setCatches] = useState<CatchLocation[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [showWebMap, setShowWebMap] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    loadCatches();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your current location.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location.');
    }
  };

  const loadCatches = async () => {
    try {
      const savedCatches = await Storage.getItem('catches');
      if (savedCatches) {
        const parsedCatches = JSON.parse(savedCatches);
        const catchesWithCoordinates = parsedCatches
          .filter((catch_: any) => catch_.coordinates)
          .map((catch_: any, index: number) => ({
            id: catch_.id || index.toString(),
            coordinate: {
              latitude: catch_.coordinates.latitude,
              longitude: catch_.coordinates.longitude,
            },
            title: `${catch_.species} - ${catch_.weight} lbs`,
            description: `Caught on ${new Date(catch_.timestamp).toLocaleDateString()}`,
            species: catch_.species,
            weight: catch_.weight,
            date: new Date(catch_.timestamp).toLocaleDateString(),
            lure: catch_.lure,
            technique: catch_.technique,
          }));
        setCatches(catchesWithCoordinates);
      } else {
        // Demo data if no catches exist
        setCatches([
          {
            id: '1',
            coordinate: {
              latitude: 37.78825,
              longitude: -122.4324
            },
            title: "Bass - 4.5 lbs",
            description: "Caught on May 23, 2025",
            species: "Bass",
            weight: "4.5",
            date: "2025-05-23"
          },
          {
            id: '2',
            coordinate: {
              latitude: 37.79825,
              longitude: -122.4424
            },
            title: "Trout - 2.1 lbs",
            description: "Caught on May 22, 2025",
            species: "Trout",
            weight: "2.1",
            date: "2025-05-22"
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load catches:', error);
    }
  };

  const filteredCatches = selectedSpecies === 'All' 
    ? catches 
    : catches.filter(catch_ => catch_.species === selectedSpecies);

  const uniqueSpecies = ['All', ...Array.from(new Set(catches.map(catch_ => catch_.species)))];

  const openInMaps = (latitude: number, longitude: number, title: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${title}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${title})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };

  const openWebMap = () => {
    setShowWebMap(true);
  };

  const generateMapHTML = () => {
    const markers = filteredCatches.map(catch_ => 
      `{lat: ${catch_.coordinate.latitude}, lng: ${catch_.coordinate.longitude}, title: "${catch_.title}", description: "${catch_.description}"}`
    ).join(',');

    const centerLat = location?.coords.latitude || 37.78825;
    const centerLng = location?.coords.longitude || -122.4324;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fishing Locations</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        #map { height: 100vh; width: 100%; }
        .info-window { min-width: 200px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        function initMap() {
          const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
            center: { lat: ${centerLat}, lng: ${centerLng} },
          });
          
          const markers = [${markers}];
          
          markers.forEach(marker => {
            const mapMarker = new google.maps.Marker({
              position: { lat: marker.lat, lng: marker.lng },
              map: map,
              title: marker.title,
            });
            
            const infoWindow = new google.maps.InfoWindow({
              content: '<div class="info-window"><h3>' + marker.title + '</h3><p>' + marker.description + '</p></div>'
            });
            
            mapMarker.addListener("click", () => {
              infoWindow.open(map, mapMarker);
            });
          });
          
          if (${location ? 'true' : 'false'}) {
            new google.maps.Marker({
              position: { lat: ${centerLat}, lng: ${centerLng} },
              map: map,
              title: "Your Location",
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            });
          }
        }
      </script>
      <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
    </body>
    </html>
    `;
  };

  if (showWebMap) {
    return (
      <View style={styles.container}>
        <View style={styles.webMapHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowWebMap(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.webMapTitle}>Interactive Map</Text>
        </View>
        <WebView
          source={{ html: generateMapHTML() }}
          style={styles.webMap}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Fishing Locations</Text>
        
        <View style={styles.card}>
          <Text style={styles.subtitle}>Map Features</Text>
          <Text style={styles.featureText}>
            🗺️ Interactive fishing location map{'\n'}
            📍 Your logged catch locations{'\n'}
            🎣 View catch details{'\n'}
            🧭 Current location tracking{'\n'}
            📊 Filter by species
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Your Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{catches.length}</Text>
              <Text style={styles.statLabel}>Locations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{uniqueSpecies.length - 1}</Text>
              <Text style={styles.statLabel}>Species</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {catches.reduce((sum, catch_) => sum + parseFloat(catch_.weight || '0'), 0).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Total lbs</Text>
            </View>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Filter by Species</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {uniqueSpecies.map((species) => (
              <TouchableOpacity
                key={species}
                style={[
                  styles.filterButton,
                  selectedSpecies === species && styles.filterButtonActive
                ]}
                onPress={() => setSelectedSpecies(species)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedSpecies === species && styles.filterButtonTextActive
                ]}>
                  {species}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Map Actions */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Map Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={openWebMap}>
            <Text style={styles.actionButtonText}>🗺️ Open Interactive Map</Text>
          </TouchableOpacity>
          
          {location && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openInMaps(location.coords.latitude, location.coords.longitude, 'My Location')}
            >
              <Text style={styles.actionButtonText}>📍 Open Current Location in Maps</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Catch Locations List */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Catch Locations ({filteredCatches.length})</Text>
          {filteredCatches.map((catch_) => (
            <TouchableOpacity
              key={catch_.id}
              style={styles.catchItem}
              onPress={() => openInMaps(
                catch_.coordinate.latitude,
                catch_.coordinate.longitude,
                catch_.title
              )}
            >
              <View style={styles.catchInfo}>
                <Text style={styles.catchTitle}>{catch_.title}</Text>
                <Text style={styles.catchDescription}>{catch_.description}</Text>
                <Text style={styles.catchCoords}>
                  📍 {catch_.coordinate.latitude.toFixed(4)}, {catch_.coordinate.longitude.toFixed(4)}
                </Text>
                {catch_.lure && (
                  <Text style={styles.catchDetail}>🎣 Lure: {catch_.lure}</Text>
                )}
                {catch_.technique && (
                  <Text style={styles.catchDetail}>⚙️ Technique: {catch_.technique}</Text>
                )}
              </View>
              <Text style={styles.mapIcon}>🗺️</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 16,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  catchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  catchInfo: {
    flex: 1,
  },
  catchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  catchDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  catchCoords: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  catchDetail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  mapIcon: {
    fontSize: 24,
    marginLeft: 8,
  },
  webMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  webMapTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  webMap: {
    flex: 1,
  },
});