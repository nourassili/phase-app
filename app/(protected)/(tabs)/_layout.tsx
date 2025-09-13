// app/(protected)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function ProtectedTabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#FFFFFF" : "#111827",
        tabBarStyle: { backgroundColor: isDark ? "#0B0B0C" : "#FAFAFB" },
        headerStyle: { backgroundColor: isDark ? "#0B0B0C" : "#FAFAFB" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
