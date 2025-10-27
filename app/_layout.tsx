// _layout.tsx

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#F8F9FA" },
        headerTintColor: "#1F2937",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
  );
}
