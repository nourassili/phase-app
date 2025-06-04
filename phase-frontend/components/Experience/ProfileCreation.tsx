import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileData {
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  timezone: string;
  is_pregnant: boolean;
  profile_completed?: boolean;
}

export default function BasicProfileSetup() {
  const session = useSessionStore((state) => state.session);
  const userId = session?.user?.id;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProfileData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      is_pregnant: false,
      profile_completed: false,
    },
  });

  const dateOfBirth = watch("date_of_birth");
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const onSubmit = async (data: ProfileData) => {
    if (!userId) {
      alert("User session not found. Please log in again.");
      return;
    }
    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth.toISOString().split("T")[0],
          timezone: data.timezone,
          is_pregnant: data.is_pregnant,
          profile_completed: true,
        })
        .eq("id", userId);

      if (error) {
        alert("Failed to update profile: " + error.message);
        return;
      }

      alert("Profile updated successfully!");
      session.user.profile_completed = true;
    } catch (err) {
      alert("An unexpected error occurred.");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Your Profile</Text>

      <Text style={styles.label}>First Name *</Text>
      <Controller
        control={control}
        name="first_name"
        rules={{ required: "First name is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.first_name && styles.errorInput]}
            placeholder="First Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="words"
            placeholderTextColor="#333"
            selectionColor="#000"
          />
        )}
      />
      {errors.first_name && (
        <Text style={styles.errorText}>{errors.first_name.message}</Text>
      )}

      <Text style={styles.label}>Last Name *</Text>
      <Controller
        control={control}
        name="last_name"
        rules={{ required: "Last name is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.last_name && styles.errorInput]}
            placeholder="Last Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="words"
            placeholderTextColor="#333"
            selectionColor="#000"
          />
        )}
      />
      {errors.last_name && (
        <Text style={styles.errorText}>{errors.last_name.message}</Text>
      )}

      {/* DATE TIME PICKER BUG1*/}
      <Text style={styles.label}>Date of Birth *</Text>
      <Controller
        control={control}
        name="date_of_birth"
        rules={{ required: "Date of birth is required" }}
        render={({ field: { value } }) => (
          <>
            <Text
              style={styles.dateText}
              onPress={() => setShowDatePicker(true)}
            >
              {value.toDateString()}
            </Text>

            {showDatePicker && (
              <>
                <DateTimePicker
                  style={styles.datePicker}
                  value={value}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "spinner"}
                  textColor="black"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === "android") {
                      setShowDatePicker(false);
                    }
                    if (selectedDate) {
                      setValue("date_of_birth", selectedDate, {
                        shouldValidate: true,
                      });
                    }
                  }}
                />

                {Platform.OS === "ios" && (
                  <View style={styles.doneButtonWrapper}>
                    <Button
                      title="Done"
                      onPress={() => setShowDatePicker(false)}
                      color="#007AFF"
                    />
                  </View>
                )}
              </>
            )}
          </>
        )}
      />
      {errors.date_of_birth && (
        <Text style={styles.errorText}>{errors.date_of_birth.message}</Text>
      )}

      <Text style={styles.label}>Timezone *</Text>
      <Controller
        control={control}
        name="timezone"
        rules={{ required: "Timezone is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.timezone && styles.errorInput]}
            placeholder="Timezone (e.g. America/New_York)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            placeholderTextColor="#333"
            selectionColor="#000"
          />
        )}
      />
      {errors.timezone && (
        <Text style={styles.errorText}>{errors.timezone.message}</Text>
      )}

      <Text style={styles.label}>Are you pregnant? *</Text>
      <Controller
        control={control}
        name="is_pregnant"
        rules={{ required: "Pregnancy status is required" }}
        render={({ field: { onChange, value } }) => (
          <Switch onValueChange={onChange} value={value} />
        )}
      />
      {errors.is_pregnant && (
        <Text style={styles.errorText}>{errors.is_pregnant.message}</Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={styles.submitButton}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
    color: "black",
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 6,
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "black",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 4,
  },
  dateText: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 6,
    color: "black",
  },
  datePicker: {
    backgroundColor: "#fff",
  },
  doneButtonWrapper: {
    marginTop: 8,
    marginBottom: 12,
    alignSelf: "flex-end",
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
  submitButtonText: {
    color: "black",
    textAlign: "center",
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    borderColor: "black",
  },
});
