// app/(protected)/_layout.tsx
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedLayout() {
  const { user, loading, onboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/welcome");
    } else if (user && !onboarded) {
      router.replace("/onboarding");
    }
  }, [user, loading, onboarded, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
