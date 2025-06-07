import { LogPeriodForm } from "@/components/Experience/LogPeriodForm";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function DailyLogScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LogPeriodForm />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5D3A66",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
});
