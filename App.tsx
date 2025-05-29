import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { Slot } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Girassol': require('./assets/fonts/Girassol-Regular.ttf'),
    'SpaceMono': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <>
      <Slot />
      <StatusBar style="auto" />
    </>
  );
}