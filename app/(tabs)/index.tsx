import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>🎣 Fishing Checklist App</Text>
        
        <View style={styles.card}>
          <Text style={styles.subtitle}>Welcome Back!</Text>
          <Text style={styles.description}>
            Track your fishing adventures, log catches, and never forget your gear again.
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/LogCatchScreen')}
          >
            <Text style={styles.actionIcon}>🎣</Text>
            <Text style={styles.actionText}>Log Catch</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/ChecklistScreen')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Checklist</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/MapScreen')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionText}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/DashboardScreen')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Dashboard</Text>
          </TouchableOpacity>
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
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});