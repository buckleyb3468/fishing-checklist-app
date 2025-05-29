import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Catch {
  id: number;
  species: string;
  weight: string;
  location: string;
  date: string;
}

export default function DashboardScreen() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [recentCatches, setRecentCatches] = useState<Catch[]>([
    { id: 1, species: 'Bass', weight: '4.5 lbs', location: 'Lake Powell', date: '2025-05-23' },
    { id: 2, species: 'Trout', weight: '2.1 lbs', location: 'Colorado River', date: '2025-05-22' }
  ]);

  useEffect(() => {
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>
          
          <View style={styles.card}>
            <ThemedText type="subtitle">Current Session</ThemedText>
            <Text style={styles.timeText}>
              Current Date and Time (UTC):{'\n'}
              {currentTime}{'\n\n'}
              User: buckleyb3468
            </Text>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle">Recent Catches</ThemedText>
            {recentCatches.map((catchItem) => (
              <View key={catchItem.id} style={styles.catchItem}>
                <Text style={styles.catchText}>
                  {catchItem.species} - {catchItem.weight}{'\n'}
                  Location: {catchItem.location}{'\n'}
                  Date: {catchItem.date}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle">Weather Conditions</ThemedText>
            <Text style={styles.weatherText}>
              Temperature: 72°F{'\n'}
              Wind: 5 mph SE{'\n'}
              Pressure: Rising
            </Text>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  catchItem: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  timeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  catchText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#333',
  },
  weatherText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});