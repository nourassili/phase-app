import { calculateCurrentPhase, CycleInput } from "@/app/logic/cycleCalculator";
import { useCycleStore } from "@/app/store/useCycleStore";
import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export const CyclePhaseCard = () => {
  const { phaseInfo, setPhaseInfo } = useCycleStore();

  const [loading, setLoading] = useState(true);
  const [currentDayInCycle, setCurrentDayInCycle] = useState(0);
  const [cycleLength, setCycleLength] = useState(28);

  useEffect(() => {
    const loadAndCalculate = async () => {
      setLoading(true);

      const { session } = useSessionStore.getState();
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("lastPeriodStart, averageCycleLength, averagePeriodDuration")
        .eq("id", session.user.id)
        .single();

      const input: CycleInput = {
        last_period_start_date: userData?.lastPeriodStart || "2025-05-15",
        average_cycle_length: userData?.averageCycleLength || 28,
        average_period_duration: userData?.averagePeriodDuration || 5,
      };

      const result = calculateCurrentPhase(input);
      setPhaseInfo(result);

      const startDate = new Date(input.last_period_start_date + "T00:00:00");
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setCurrentDayInCycle(diffDays % input.average_cycle_length);
      setCycleLength(input.average_cycle_length);

      setLoading(false);
    };

    loadAndCalculate();
  }, [setPhaseInfo]);

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingContainer]}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.loadingText}>Analyzing your cycle...</Text>
      </View>
    );
  }

  if (!phaseInfo) {
    return (
      <View style={styles.card}>
        <Text style={styles.phaseName}>Could not load cycle data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.vizContainer}>{/* ... SVG Code ... */}</View>
      <View style={styles.infoContainer}>
        <Text style={styles.phaseName}>{phaseInfo.phase_name}</Text>
        <Text style={styles.dateRange}>
          {phaseInfo.phase_start_date} to {phaseInfo.phase_end_date}
        </Text>
        <Text style={styles.message}>{phaseInfo.message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  vizContainer: {
    alignItems: "center",
  },
  infoContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  phaseName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  dateRange: {
    fontSize: 14,
    color: "#ddd",
    fontStyle: "italic",
    marginVertical: 4,
  },
  message: {
    fontSize: 16,
    color: "#eee",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
});
