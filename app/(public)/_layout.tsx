// app/(public)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function PublicLayout() {
  const isDark = useColorScheme() === "dark";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: isDark ? "#0B0B0C" : "#FAFAFB" },
        headerStyle: { backgroundColor: isDark ? "#0B0B0C" : "#FAFAFB" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
        headerShadowVisible: false,
      }}
    />
  );
}
