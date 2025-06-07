import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

interface PhaseInfo {
  phase_name: string;
  phase_start_date: string;
  phase_end_date: string;
  message: string;
}

interface CycleInput {
  last_period_start_date: string;
  average_cycle_length: number;
  average_period_duration: number;
}

export const CyclePhaseCard = () => {
  const [loading, setLoading] = useState(true);
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(null);
  const [cycleInput, setCycleInput] = useState<CycleInput | null>(null);
  const [currentDayInCycle, setCurrentDayInCycle] = useState(0);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      const { session } = useSessionStore.getState();
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("lastPeriodStart, averageCycleLength, averagePeriodDuration")
        .eq("id", session.user.id)
        .single();

      const input: CycleInput = {
        last_period_start_date: userData?.lastPeriodStart || "2025-05-15",
        average_cycle_length: userData?.averageCycleLength || 28,
        average_period_duration: userData?.averagePeriodDuration || 5,
      };
      setCycleInput(input);

      const startDate = new Date(input.last_period_start_date + "T00:00:00");
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setCurrentDayInCycle(diffDays % input.average_cycle_length);

      const { data, error } = await supabase.functions.invoke(
        "cycle-calculator",
        {
          body: input,
        }
      );

      if (error) {
        Alert.alert("Error", "Could not calculate phase: " + error.message);
      } else {
        setPhaseInfo(data);
      }
      setLoading(false);
    };

    fetchAndCalculate();
  }, []);

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingContainer]}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.loadingText}>Analyzing your cycle...</Text>
      </View>
    );
  }

  if (!phaseInfo || !cycleInput) {
    return (
      <View style={styles.card}>
        <Text style={styles.phaseName}>Could not load cycle data.</Text>
      </View>
    );
  }

  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const angle = (currentDayInCycle / cycleInput.average_cycle_length) * 360;
  const a = ((angle - 90) * Math.PI) / 180;
  const x = center + radius * Math.cos(a);
  const y = center + radius * Math.sin(a);

  return (
    <View style={styles.card}>
      <View style={styles.vizContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#7A559C"
            strokeWidth={strokeWidth}
          />

          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E9A0E3"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={
              circumference -
              (circumference * currentDayInCycle) /
                cycleInput.average_cycle_length
            }
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
          {/* Current Day Indicator */}
          <Circle cx={x} cy={y} r={strokeWidth / 2 + 2} fill="#fff" />
          {/* Text inside the circle */}
          <SvgText
            x={center}
            y={center - 10}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="48"
            fontWeight="bold"
            fill="#fff"
          >
            {currentDayInCycle}
          </SvgText>
          <SvgText
            x={center}
            y={center + 25}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="16"
            fill="#E9A0E3"
          >
            Day
          </SvgText>
        </Svg>
      </View>
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
