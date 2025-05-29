import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';
import { Text, View } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Girassol: require('../assets/fonts/Girassol-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="+not-found"
          options={{
            title: 'Oops!',
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
