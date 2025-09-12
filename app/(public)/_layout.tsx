import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        gestureEnabled: true,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          title: "Log in",
          headerShadowVisible: false,
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
