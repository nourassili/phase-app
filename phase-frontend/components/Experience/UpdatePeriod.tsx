import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface UpdatePeriodForm {
  lastPeriodStart: string; // MM-DD
  averageCycleLength: number;
  averagePeriodDuration: number;
}

export const UpdatePeriod = () => {
  const session = useSessionStore((state) => state.session);
  const userId = session?.user.id;
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UpdatePeriodForm>();

  useEffect(() => {
    const fetchCurrentData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("lastPeriodStart, averageCycleLength, averagePeriodDuration")
        .eq("id", userId)
        .single();

      if (error) {
        Alert.alert("Error", "Could not load your current cycle data.");
      } else if (data) {
        // Format the YYYY-MM-DD date from DB to just MM-DD for the form
        const formattedDate = data.lastPeriodStart
          ? data.lastPeriodStart.substring(5)
          : "";

        reset({
          lastPeriodStart: formattedDate,
          averageCycleLength: data.averageCycleLength,
          averagePeriodDuration: data.averagePeriodDuration,
        });
      }
      setIsLoading(false);
    };

    fetchCurrentData();
  }, [userId, reset]);

  const onSubmit = async (formData: UpdatePeriodForm) => {
    if (!userId) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    // Combine the MM-DD input with the current year to create a full YYYY-MM-DD date
    const currentYear = new Date().getFullYear();
    const fullDate = `${currentYear}-${formData.lastPeriodStart}`;

    const { error } = await supabase
      .from("users")
      .update({
        lastPeriodStart: fullDate,
        averageCycleLength: Number(formData.averageCycleLength),
        averagePeriodDuration: Number(formData.averagePeriodDuration),
      })
      .eq("id", userId);

    if (error) {
      Alert.alert(
        "Error",
        "Failed to update your cycle data. " + error.message
      );
    } else {
      Alert.alert("Success", "Your cycle data has been updated.");
      router.replace("/Home");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Last Period Start Date (MM-DD)</Text>
      <Controller
        control={control}
        name="lastPeriodStart"
        rules={{
          required: "This field is required",
          pattern: {
            value: /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
            message: "Please use MM-DD format",
          },
        }}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="e.g., 06-07"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />

      <Text style={styles.label}>Average Cycle Length (days)</Text>
      <Controller
        control={control}
        name="averageCycleLength"
        rules={{ required: "This field is required" }}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="e.g., 28"
              onBlur={onBlur}
              onChangeText={onChange}
              value={String(value || "")}
              keyboardType="numeric"
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />

      <Text style={styles.label}>Average Period Duration (days)</Text>
      <Controller
        control={control}
        name="averagePeriodDuration"
        rules={{ required: "This field is required" }}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5"
              onBlur={onBlur}
              onChangeText={onChange}
              value={String(value || "")}
              keyboardType="numeric"
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>Update Cycle Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: "#eee",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#E9A0E3",
    padding: 16,
    borderRadius: 32,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#ffb347",
    marginBottom: 12,
  },
});
