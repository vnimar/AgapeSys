import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // @ts-ignore
    return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="servo"
        options={{
            title: 'Servo',
            tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="person.2.fill" color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
            title: 'Calendario',
            tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="person.3.fill" color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="frequencia"
        options={{
            title: 'Frequencia',
            tabBarIcon: ({ color }) => (
                // @ts-expect-error - mudar icon
                <IconSymbol size={28} name="person.4.fill" color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
