// app/(protected)/onboarding/index.tsx
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";

export default function OnboardingScreen() {
  const { setOnboarded } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={{ marginBottom: 20 }}>Here you could show intro steps.</Text>
      <Button title="Finish Onboarding" onPress={() => setOnboarded(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
