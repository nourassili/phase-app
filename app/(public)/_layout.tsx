// app/(public)/_layout.tsx
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function PublicLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        gestureEnabled: true,
        contentStyle: { backgroundColor: isDark ? "#0B0B0C" : "#FAFAFB" },
        headerStyle: { backgroundColor: isDark ? "#0B0B0C" : "#FAFAFB" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          title: "Log in",
        }}
      />
    </Stack>
  );
}
