import { useCycleStore } from "@/app/store/useCycleStore";
import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface Tips {
  nutrition_tip: string;
  workout_tip: string;
  wellness_tip: string;
}

export const DailyTipsCard = () => {
  const { session } = useSessionStore();
  const { phaseInfo } = useCycleStore();
  const [tips, setTips] = useState<Tips | null>(null);
  const [loading, setLoading] = useState(true);

  const isFetching = useRef(false);

  useEffect(() => {
    const getTips = async () => {
      if (isFetching.current) return;

      if (!session?.user?.id || !phaseInfo?.phase_name) {
        setLoading(false);
        return;
      }

      isFetching.current = true;
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const { data: existingTips, error: fetchError } = await supabase
        .from("daily_tips")
        .select("nutrition_tip, workout_tip, wellness_tip")
        .eq("user_id", session.user.id)
        .eq("tip_date", today)
        .limit(1);

      if (fetchError) {
        console.error("Error fetching cached tips:", fetchError);
      }

      if (existingTips && existingTips.length > 0) {
        setTips(existingTips[0]);
        setLoading(false);
        isFetching.current = false;
        return;
      }

      try {
        const { data: newTips, error: functionError } =
          await supabase.functions.invoke("generate-daily-tips", {
            body: { phaseName: phaseInfo.phase_name },
          });

        if (functionError) throw functionError;

        await supabase.from("daily_tips").insert({
          user_id: session.user.id,
          tip_date: today,
          phase_name: phaseInfo.phase_name,
          nutrition_tip: newTips.nutrition_tip,
          workout_tip: newTips.workout_tip,
          wellness_tip: newTips.wellness_tip,
        });

        setTips(newTips);
      } catch (error) {
        console.error("Error generating tips:", error);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    getTips();
  }, [phaseInfo, session]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.loadingText}>Generating your daily tips...</Text>
      </View>
    );
  }

  if (!tips) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Today&apos;s Tips for Your {phaseInfo?.phase_name}
      </Text>
      <View style={styles.tipRow}>
        <Text style={styles.tipEmoji}>🥗</Text>
        <Text style={styles.tipText}>{tips.nutrition_tip}</Text>
      </View>
      <View style={styles.tipRow}>
        <Text style={styles.tipEmoji}>🤸‍♀️</Text>
        <Text style={styles.tipText}>{tips.workout_tip}</Text>
      </View>
      <View style={styles.tipRow}>
        <Text style={styles.tipEmoji}>🧘</Text>
        <Text style={styles.tipText}>{tips.wellness_tip}</Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    color: "#eee",
    fontSize: 15,
    lineHeight: 22,
  },
  loadingText: {
    color: "#ddd",
    textAlign: "center",
  },
});
