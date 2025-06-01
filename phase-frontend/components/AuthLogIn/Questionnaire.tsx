import { useSessionStore } from "@/app/store/useSessionStore";
import { Condition, questionnaire } from "@/utils/questionnaire";
import { supabase } from "@/utils/supabase";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FormData = Record<string, any>;

const isConditionMet = (
  condition: Condition | undefined,
  formData: FormData
) => {
  if (!condition) return true;
  return Object.entries(condition).every(([qid, val]) => {
    const answer = formData[qid];
    if (Array.isArray(val)) {
      if (Array.isArray(answer)) return val.some((v) => answer.includes(v));
      return val.includes(answer);
    }
    if (Array.isArray(answer)) return answer.includes(val);
    return answer === val;
  });
};

const MultiSelectCheckbox = ({
  options,
  value = [],
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
}) => (
  <View>
    {options.map((option) => (
      <TouchableOpacity
        key={option}
        onPress={() =>
          onChange(
            value.includes(option)
              ? value.filter((v) => v !== option)
              : [...value, option]
          )
        }
        style={styles.checkboxContainer}
      >
        <View
          style={[styles.checkbox, value.includes(option) && styles.checkedBox]}
        />
        <Text style={styles.checkboxLabel}>{option}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const SelectOptions = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) => (
  <View style={styles.pickerContainer}>
    {options.map((option) => (
      <TouchableOpacity
        key={option}
        style={[styles.optionButton, value === option && styles.optionSelected]}
        onPress={() => onChange(option)}
      >
        <Text
          style={[
            styles.optionText,
            value === option && styles.optionTextSelected,
          ]}
        >
          {option}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const QuestionInput = ({
  question,
  control,
  formData,
  setValue,
  getValues,
}: {
  question: any;
  control: any;
  formData: FormData;
  setValue: (id: string, val: any) => void;
  getValues: (id: string) => any;
}) => {
  if (question.condition && !isConditionMet(question.condition, formData)) {
    if (getValues(question.id)) setValue(question.id, undefined);
    return null;
  }

  const rules = { required: !question.options };

  if (question.type === "select" && question.options) {
    return (
      <Controller
        control={control}
        name={question.id}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <SelectOptions
            options={question.options}
            value={value}
            onChange={onChange}
          />
        )}
      />
    );
  }

  if (question.type === "multi-select" && question.options) {
    return (
      <Controller
        control={control}
        name={question.id}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <MultiSelectCheckbox
            options={question.options}
            value={value || []}
            onChange={onChange}
          />
        )}
      />
    );
  }

  if (question.type === "date") {
    return (
      <Controller
        control={control}
        name={question.id}
        rules={{ required: true, pattern: /^\d{4}$/ }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) =>
              onChange(text.replace(/[^0-9]/g, "").slice(0, 4))
            }
            placeholder="YYYY"
            keyboardType="numeric"
          />
        )}
      />
    );
  }

  return (
    <Controller
      control={control}
      name={question.id}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <TextInput style={styles.input} value={value} onChangeText={onChange} />
      )}
    />
  );
};

export const Questionnaire = () => {
  const setSession = useSessionStore((state) => state.setSession);
  const { control, handleSubmit, watch, setValue, getValues } =
    useForm<FormData>({
      defaultValues: {},
    });

  const formData = watch();

  const onSubmit = async (data: FormData) => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) return Alert.alert("Error", sessionError.message);
      if (!session?.user?.id) return Alert.alert("Error", "User not logged in");

      const userId = session.user.id;

      const insertData = Object.entries(data)
        .map(([question_id, answer]) => {
          const question = Object.values(questionnaire)
            .flat()
            .find((q) => q.id === question_id);
          if (!question) return null;

          let response_date: string | null = null;
          let responseArray: string[] | null = null;

          if (question.type === "date") {
            const year = parseInt(answer, 10);
            response_date =
              !isNaN(year) && year > 1900 && year < 2100
                ? `${year}-01-01`
                : null;
            responseArray = null;
          } else if (question.type === "multi-select") {
            responseArray = Array.isArray(answer) ? answer : [];
          } else {
            responseArray = answer ? [String(answer)] : [];
          }

          return {
            user_id: userId,
            question_id,
            response: responseArray,
            response_date,
          };
        })
        .filter(Boolean);

      const { error: insertError } = await supabase
        .from("user_questionnaire_responses")
        .upsert(insertData as any, { onConflict: "user_id,question_id" });

      if (insertError)
        return Alert.alert("Error saving responses", insertError.message);

      const { error: updateError } = await supabase
        .from("users")
        .update({ questionnaire_completed: true })
        .eq("id", userId);

      if (updateError)
        return Alert.alert("Error updating user profile", updateError.message);

      setSession({
        ...session!,
        user: {
          ...session!.user,
          email: session!.user.email || "",
          questionnaire_completed: true,
          profile_completed: false,
        },
      });

      Alert.alert("Success", "Questionnaire responses saved!");
    } catch (error) {
      Alert.alert("Unexpected error", String(error));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(questionnaire).map(([sectionName, questions]) => (
        <View key={sectionName} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {sectionName.replace(/_/g, " ")}
          </Text>
          {questions.map((q) => (
            <View key={q.id} style={styles.questionContainer}>
              <Text style={styles.label}>
                {q.question}
                {q.options ? " (Optional)" : ""}
              </Text>
              <QuestionInput
                question={q}
                control={control}
                formData={formData}
                setValue={setValue}
                getValues={getValues}
              />
            </View>
          ))}
        </View>
      ))}
      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, marginTop: 10 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 20,
    marginBottom: 12,
    textTransform: "capitalize",
  },
  questionContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  pickerContainer: { flexDirection: "row", flexWrap: "wrap" },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 20,
  },
  optionSelected: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  optionText: { color: "#333" },
  optionTextSelected: { color: "#fff" },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#444",
    marginRight: 10,
    borderRadius: 4,
  },
  checkedBox: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  checkboxLabel: { fontSize: 16 },
});
