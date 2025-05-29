import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Share,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FishData {
  id: string;
  name: string;
  category: 'Freshwater' | 'Saltwater' | 'Rare';
  caught: boolean;
  catchDate?: string;
  typicalSize: string;
  location: string;
  bestSeason: string;
  description: string;
}

const initialFishData: FishData[] = [
  // Freshwater Fish
  {
    id: '1',
    name: 'Largemouth Bass',
    category: 'Freshwater',
    caught: false,
    typicalSize: '2-10 lbs',
    location: 'Lakes, ponds, slow rivers',
    bestSeason: 'Spring, Summer',
    description: 'Popular gamefish known for aggressive strikes'
  },
  {
    id: '2',
    name: 'Smallmouth Bass',
    category: 'Freshwater',
    caught: false,
    typicalSize: '1-5 lbs',
    location: 'Rocky lakes, clear rivers',
    bestSeason: 'Spring, Fall',
    description: 'Fight harder than their size suggests'
  },
  {
    id: '3',
    name: 'Rainbow Trout',
    category: 'Freshwater',
    caught: false,
    typicalSize: '1-8 lbs',
    location: 'Cold streams, lakes',
    bestSeason: 'Spring, Fall',
    description: 'Beautiful fish with pink stripe'
  },
  {
    id: '4',
    name: 'Brown Trout',
    category: 'Freshwater',
    caught: false,
    typicalSize: '1-10 lbs',
    location: 'Cool streams, lakes',
    bestSeason: 'Fall, Winter',
    description: 'Wary and challenging to catch'
  },
  {
    id: '5',
    name: 'Northern Pike',
    category: 'Freshwater',
    caught: false,
    typicalSize: '2-15 lbs',
    location: 'Weedy lakes, slow rivers',
    bestSeason: 'Spring, Fall',
    description: 'Aggressive predator with sharp teeth'
  },
  // Saltwater Fish
  {
    id: '6',
    name: 'Red Snapper',
    category: 'Saltwater',
    caught: false,
    typicalSize: '2-20 lbs',
    location: 'Gulf reefs, offshore',
    bestSeason: 'Summer, Fall',
    description: 'Prized table fare from deep waters'
  },
  {
    id: '7',
    name: 'Mahi Mahi',
    category: 'Saltwater',
    caught: false,
    typicalSize: '5-30 lbs',
    location: 'Open ocean, blue water',
    bestSeason: 'Spring, Summer',
    description: 'Fast-growing, acrobatic fighter'
  },
  {
    id: '8',
    name: 'Striped Bass',
    category: 'Saltwater',
    caught: false,
    typicalSize: '3-30 lbs',
    location: 'Coastal waters, bays',
    bestSeason: 'Spring, Fall',
    description: 'Popular surf and boat target'
  },
  // Rare Fish
  {
    id: '9',
    name: 'Muskie',
    category: 'Rare',
    caught: false,
    typicalSize: '10-50 lbs',
    location: 'Large northern lakes',
    bestSeason: 'Fall',
    description: 'The fish of 10,000 casts'
  },
  {
    id: '10',
    name: 'Steelhead',
    category: 'Rare',
    caught: false,
    typicalSize: '6-20 lbs',
    location: 'Pacific tributaries',
    bestSeason: 'Winter, Spring',
    description: 'Sea-run rainbow trout'
  }
];

interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  category: 'Essential' | 'Optional' | 'Safety';
}

const initialItems: ChecklistItem[] = [
  { id: '1', name: 'Fishing Rod', checked: false, category: 'Essential' },
  { id: '2', name: 'Reel', checked: false, category: 'Essential' },
  { id: '3', name: 'Tackle Box', checked: false, category: 'Essential' },
  { id: '4', name: 'Bait/Lures', checked: false, category: 'Essential' },
  { id: '5', name: 'Fishing License', checked: false, category: 'Essential' },
  { id: '6', name: 'Net', checked: false, category: 'Optional' },
  { id: '7', name: 'Cooler', checked: false, category: 'Optional' },
  { id: '8', name: 'Chair', checked: false, category: 'Optional' },
  { id: '9', name: 'First Aid Kit', checked: false, category: 'Safety' },
  { id: '10', name: 'Sunscreen', checked: false, category: 'Safety' },
  { id: '11', name: 'Hat', checked: false, category: 'Safety' },
];

// Better AsyncStorage implementation for Expo
const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem(key);
    } catch (error) {
      console.warn('Storage not available, using memory storage');
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
      console.warn('Storage not available, data will not persist');
    }
  }
};

export default function ChecklistScreen() {
  const [fishList, setFishList] = useState<FishData[]>(initialFishData);
  const [isLoading, setIsLoading] = useState(true);
  const [fishSearchQuery, setFishSearchQuery] = useState('');
  const [gearSearchQuery, setGearSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFish, setExpandedFish] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    saveFishData();
  }, [fishList]);

  useEffect(() => {
    saveGearData();
  }, [items]);

  const loadSavedData = async () => {
    try {
      setIsLoading(true);
      const savedFishData = await Storage.getItem('fishChecklist');
      const savedGearData = await Storage.getItem('gearChecklist');
      
      if (savedFishData) {
        setFishList(JSON.parse(savedFishData));
      }
      if (savedGearData) {
        setItems(JSON.parse(savedGearData));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFishData = async () => {
    try {
      await Storage.setItem('fishChecklist', JSON.stringify(fishList));
    } catch (error) {
      console.error('Error saving fish data:', error);
    }
  };

  const saveGearData = async () => {
    try {
      await Storage.setItem('gearChecklist', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving gear data:', error);
    }
  };

  const toggleCatch = (id: string) => {
    setFishList((prevList) =>
      prevList.map(fish => {
        if (fish.id === id) {
          return {
            ...fish,
            caught: !fish.caught,
            catchDate: !fish.caught ? new Date().toISOString() : undefined
          };
        }
        return fish;
      })
    );
  };

  const toggleItem = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleShare = async () => {
    try {
      const caughtFish = fishList.filter(fish => fish.caught);
      const checkedGear = items.filter(item => item.checked);
      
      const shareMessage = `
My Fishing Progress (as of ${new Date().toLocaleDateString()}):

Fish Caught: ${caughtFish.length} of ${fishList.length} species
Recent Catches:
${caughtFish.map((fish: FishData) => `- ${fish.name}${fish.catchDate ? ` (${new Date(fish.catchDate).toLocaleDateString()})` : ''}`).join('\n')}

Gear Ready: ${checkedGear.length} of ${items.length} items
${checkedGear.map(item => `- ${item.name}`).join('\n')}

Current User: buckleyb3468
Timestamp: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}
`;
      
      await Share.share({
        message: shareMessage,
        title: 'My Fishing Progress'
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share progress');
    }
  };

  const toggleSort = (newSortBy: 'name' | 'date' | 'category') => {
    if (sortBy === newSortBy) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(newSortBy);
      setSortAsc(true);
    }
  };

  const sortedAndFilteredFish = fishList
    .filter((fish) => {
      const matchesSearch = fish.name.toLowerCase().includes(fishSearchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || fish.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: FishData, b: FishData) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          if (!a.catchDate && !b.catchDate) return 0;
          if (!a.catchDate) return 1;
          if (!b.catchDate) return -1;
          comparison = new Date(a.catchDate ?? 0).getTime() - new Date(b.catchDate ?? 0).getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(gearSearchQuery.toLowerCase())
  );

  const categories = ['All', 'Freshwater', 'Saltwater', 'Rare'];
  const caughtCount = fishList.filter(fish => fish.caught).length;
  const checkedCount = items.filter(item => item.checked).length;

  const renderGearItem = ({ item }: { item: ChecklistItem }) => (
    <TouchableOpacity
      style={styles.gearItem}
      onPress={() => toggleItem(item.id)}
      activeOpacity={0.7} // Better touch feedback
    >
      <Text style={styles.checkbox}>
        {item.checked ? '☑️' : '⬜'}
      </Text>
      <Text style={[styles.gearItemText, item.checked && styles.checkedText]}>
        {item.name}
      </Text>
      <Text style={styles.gearCategory}>
        {item.category}
      </Text>
    </TouchableOpacity>
  );

  const ErrorFallback = ({ error }: { error: Error }) => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your fishing data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Fish Species Checklist */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fish Species Checklist</Text>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search fish species..."
            value={fishSearchQuery}
            onChangeText={setFishSearchQuery}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoryContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sortingContainer}>
            <TouchableOpacity 
              style={styles.sortButton} 
              onPress={() => toggleSort('name')}
            >
              <Text style={styles.sortButtonText}>
                Name {sortBy === 'name' ? (sortAsc ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sortButton} 
              onPress={() => toggleSort('date')}
            >
              <Text style={styles.sortButtonText}>
                Date {sortBy === 'date' ? (sortAsc ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sortButton} 
              onPress={() => toggleSort('category')}
            >
              <Text style={styles.sortButtonText}>
                Category {sortBy === 'category' ? (sortAsc ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.progressText}>
            {caughtCount} of {fishList.length} species caught
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(caughtCount / fishList.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Fish List */}
        {sortedAndFilteredFish.map(fish => (
          <View key={fish.id} style={styles.card}>
            <TouchableOpacity
              style={styles.checklistItem}
              onPress={() => toggleCatch(fish.id)}
            >
              <Text style={styles.itemText}>
                {fish.caught ? '🎣' : '🐟'} {fish.name}
              </Text>
              <Text style={styles.checkbox}>
                {fish.caught ? '☑️' : '⬜'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => setExpandedFish(expandedFish === fish.id ? null : fish.id)}
            >
              <Text style={styles.detailsButtonText}>
                {expandedFish === fish.id ? 'Hide Details' : 'Show Details'}
              </Text>
            </TouchableOpacity>
        
            {expandedFish === fish.id && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>Category: {fish.category}</Text>
                <Text style={styles.detailText}>Typical Size: {fish.typicalSize}</Text>
                <Text style={styles.detailText}>Location: {fish.location}</Text>
                <Text style={styles.detailText}>Best Season: {fish.bestSeason}</Text>
                <Text style={styles.detailText}>Description: {fish.description}</Text>
                {fish.caught && fish.catchDate && (
                  <Text style={styles.catchDate}>
                    Caught on: {new Date(fish.catchDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Fishing Gear Checklist */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fishing Gear Checklist</Text>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search gear items..."
            value={gearSearchQuery}
            onChangeText={setGearSearchQuery}
          />

          <Text style={styles.progressText}>
            {checkedCount} of {items.length} items checked
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(checkedCount / items.length) * 100}%` }
              ]} 
            />
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderGearItem}
            scrollEnabled={false}
            style={styles.gearList}
            removeClippedSubviews={true} // Performance optimization
            maxToRenderPerBatch={10} // Performance optimization
            windowSize={10} // Performance optimization
          />
        </View>

        {/* Share Progress */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Text style={styles.shareButtonText}>Share Progress</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#0066cc',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  sortingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 16,
  },
  sortButton: {
    padding: 8,
  },
  sortButtonText: {
    color: '#0066cc',
    fontSize: 14,
  },
  progressText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    fontSize: 20,
  },
  detailsButton: {
    marginTop: 8,
    padding: 8,
  },
  detailsButtonText: {
    color: '#0066cc',
    fontSize: 14,
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  catchDate: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 8,
    fontStyle: 'italic',
  },
  gearList: {
    maxHeight: 300,
  },
  gearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  gearItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  gearCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  shareButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});