import { useProfileStore } from "@/app/store/useProfileStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const Welcome = () => {
  const { profile } = useProfileStore();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Welcome back, {profile.first_name || "User"}!
      </Text>
      <Text style={styles.subtitle}>
        Here&apos;s your space to reflect and grow. Your current timezone is set
        to {profile.timezone}.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#7A559C",
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#eee",
    marginTop: 8,
  },
});
