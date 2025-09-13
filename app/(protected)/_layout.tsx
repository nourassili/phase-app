// app/(protected)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function ProtectedTabsLayout() {
  const isDark = useColorScheme() === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: isDark ? "#FFFFFF" : "#111827",
        tabBarStyle: { backgroundColor: isDark ? "#0B0B0C" : "#FAFAFB" },
        headerStyle: { backgroundColor: isDark ? "#0B0B0C" : "#FAFAFB" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
      }}
    >
      {/* Ensure you have app/(protected)/(tabs)/home.tsx */}
      <Tabs.Screen name="home" options={{ title: "Home" }} />
    </Tabs>
  );
}
