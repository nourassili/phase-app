import { CyclePhaseCard } from "@/components/Dashboard/CyclePhaseCard";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { Button, ScrollView, StyleSheet, Text } from "react-native";
import { useSessionStore } from "./store/useSessionStore";

export default function Home() {
  const { session } = useSessionStore();
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.welcomeText}>
        Welcome, {session?.user?.email.split("@")[0] || "User"}
      </Text>

      <CyclePhaseCard />

      <Button color="#E9A0E3" title="Log out" onPress={() => handleSignOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5D3A66",
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
  },
});
