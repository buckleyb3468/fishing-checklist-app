import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';

// Simple HapticTab using built-in Pressable
export function HapticTab({ children, onPress, ...props }: any) {
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(event);
      }}
    >
      {children}
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
          },
          default: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'house.fill' : 'house'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="DashboardScreen"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'chart.bar.fill' : 'chart.bar'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ChecklistScreen"
        options={{
          title: 'Checklist',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={'list.bullet'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="LogCatchScreen"
        options={{
          title: 'Log Catch',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'plus.circle.fill' : 'plus.circle'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="MapScreen"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'map.fill' : 'map'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'paperplane.fill' : 'paperplane'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}