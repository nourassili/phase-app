import { CyclePhaseCard } from "@/components/Dashboard/CyclePhaseCard";
import { DailyTipsCard } from "@/components/Dashboard/DailyTipsCard";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
        Welcome, {session?.user?.first_name || "User"}
      </Text>
      <Text style={styles.tagline}>
        Here is your current phase at a glance.
      </Text>
      <DailyTipsCard />

      {/* The main cycle visualization card */}
      <CyclePhaseCard />

      {/* The single, primary action for the user */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Check-in</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/DailyLogScreen")}
        >
          <Text style={styles.actionButtonText}>Log a New Period</Text>
          <Text style={styles.actionButtonSubtext}>
            Logging each period makes your predictions more accurate over time.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/UpdateCycleDataScreen")}
        >
          <Text style={styles.actionButtonText}>Update Full Questionnaire</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          color="#E9A0E3"
          title="Log out"
          onPress={() => handleSignOut()}
        />
      </View>
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
  },
  tagline: {
    fontSize: 16,
    color: "#ddd",
    marginBottom: 24,
  },
  actionsContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  actionButtonSubtext: {
    color: "#ddd",
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
});
