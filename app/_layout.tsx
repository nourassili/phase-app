// _layout.tsx
import React from 'react';
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="symptoms" 
            options={{ 
              headerShown: true,
              headerTitle: 'Log Symptoms',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#FF6B9D',
              headerTitleStyle: { fontWeight: '600' },
            }} 
          />
          <Stack.Screen 
            name="calendar" 
            options={{ 
              headerShown: true,
              headerTitle: 'Cycle Calendar',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#8B5CF6',
              headerTitleStyle: { fontWeight: '600' },
            }} 
          />
          <Stack.Screen 
            name="chat" 
            options={{ 
              headerShown: true,
              headerTitle: 'Health Assistant',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#06B6D4',
              headerTitleStyle: { fontWeight: '600' },
            }} 
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
