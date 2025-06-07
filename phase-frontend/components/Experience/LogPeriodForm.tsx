import { recalculateAverages } from "@/app/logic/calculateAverage";
import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PeriodLogForm {
  start_date: string; // MM-DD
  end_date: string; // MM-DD
}

export const LogPeriodForm = () => {
  const { session } = useSessionStore();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<PeriodLogForm>();

  const onSubmit = async (formData: PeriodLogForm) => {
    const userId = session?.user?.id;
    if (!userId) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-${formData.start_date}`;
    const endDate = `${currentYear}-${formData.end_date}`;

    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert(
        "Invalid Dates",
        "The end date cannot be before the start date."
      );
      return;
    }

    const { error: insertError } = await supabase.from("period_logs").insert({
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
    });

    if (insertError) {
      Alert.alert(
        "Error",
        "Could not save your period log. " + insertError.message
      );
      return;
    }

    const result = await recalculateAverages(userId);

    if (result.error) {
      Alert.alert(
        "Period Logged",
        "Your period was logged, but we couldn't update your averages. " +
          result.error.message
      );
    } else {
      Alert.alert(
        "Success!",
        "Your period has been logged and your averages have been updated."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log a Period</Text>

      <Text style={styles.label}>When did this period START?</Text>
      <Controller
        control={control}
        name="start_date"
        rules={{
          required: "Start date is required",
          pattern: {
            value: /^\d{2}-\d{2}$/,
            message: "Please use MM-DD format",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="MM-DD"
            onChangeText={onChange}
            value={value}
            maxLength={5}
          />
        )}
      />
      {errors.start_date && (
        <Text style={styles.errorText}>{errors.start_date.message}</Text>
      )}

      <Text style={styles.label}>When did this period END?</Text>
      <Controller
        control={control}
        name="end_date"
        rules={{
          required: "End date is required",
          pattern: {
            value: /^\d{2}-\d{2}$/,
            message: "Please use MM-DD format",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="MM-DD"
            onChangeText={onChange}
            value={value}
            maxLength={5}
          />
        )}
      />
      {errors.end_date && (
        <Text style={styles.errorText}>{errors.end_date.message}</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>Log This Period</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#eee",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#E9A0E3",
    padding: 16,
    borderRadius: 32,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#ffb347",
    marginTop: 4,
  },
});
