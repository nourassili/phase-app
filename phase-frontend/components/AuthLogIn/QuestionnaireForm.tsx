import prettifySectionName from "@/utils/prettyWord";
import { getQuestionnaire } from "@/utils/questionnaire";
import { supabase } from "@/utils/supabase";
import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, TextInput, View } from "react-native";
import styled from "styled-components/native";

import { useSessionStore } from "@/app/store/useSessionStore";
import { translations } from "@/utils/translationQuestions/translations";
import { t } from "i18next";

export type Lang = "en" | "es" | "fr";

export type Question = {
  id: string;
  question: string;
  options?: string[];
  condition?: {
    [questionId: string]: string | string[];
  };
  optional?: boolean;
  type?: string;
};

const Container = styled.View`
  flex: 1;
  background-color: rgb(248, 248, 248);
  padding: 20px;
  margin: 0;
`;

const QuestionContainer = styled.View`
  margin-bottom: 24px;
`;

const SectionHeader = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #4b2e39;
  margin-top: 40px;
  text-align: center;
`;

const QuestionText = styled.Text`
  font-size: 18px;
  font-weight: 600;
  margin-top: 10px;
  margin-bottom: 8px;
  color: black;
`;

const AnswerText = styled.Text`
  font-size: 16px;
  color: #555;
  margin-top: 4px;
  margin-left: 8px;
  font-style: italic;
`;

const OptionButton = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${(props) => (props.selected ? "#ffb347" : "#e0d4c5")};
  padding: 10px 16px;
  border-radius: 12px;
  margin-vertical: 4px;
`;

const OptionText = styled.Text`
  font-size: 16px;
  color: #2c2c2c;
`;

const SubmitButton = styled.TouchableOpacity`
  background-color: #73c2fb;
  padding: 14px;
  border-radius: 10px;
  align-items: center;
  margin-top: 30px;
`;

const SubmitText = styled.Text`
  color: white;
  font-size: 16px;
`;

const reorderQuestions = (questions: Question[]): Question[] => {
  const map = new Map<string, Question>();
  const visited = new Set<string>();
  const result: Question[] = [];

  for (const q of questions) {
    map.set(q.id, q);
  }

  const dfs = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);

    const q = map.get(id);
    if (!q) return;

    if (q.condition) {
      Object.keys(q.condition).forEach((depId) => dfs(depId));
    }

    result.push(q);
  };

  for (const q of questions) {
    dfs(q.id);
  }

  return result;
};

const QuestionBlock = ({
  q,
  control,
  userLang,
}: {
  q: Question;
  control: any;
  userLang: string;
}) => {
  const lang = userLang as Lang;
  const langQuestions = translations[lang]?.questions;

  const localizedQuestion =
    langQuestions?.[q.id as keyof typeof langQuestions] ?? q.question;

  const localizedOptions =
    q.options?.map(
      (opt) => langQuestions?.[opt as keyof typeof langQuestions] ?? opt
    ) ?? [];

  return (
    <QuestionContainer key={q.id}>
      <QuestionText>{localizedQuestion}</QuestionText>
      <Controller
        control={control}
        name={q.id}
        render={({ field: { onChange, value } }) => {
          if (q.type === "multi-select" && Array.isArray(q.options)) {
            const selectedValues: string[] = Array.isArray(value) ? value : [];

            const toggleOption = (opt: string) => {
              if (selectedValues.includes(opt)) {
                onChange(selectedValues.filter((v) => v !== opt));
              } else {
                onChange([...selectedValues, opt]);
              }
            };

            return (
              <>
                {q.options.map((opt, idx) => (
                  <OptionButton
                    key={opt}
                    onPress={() => toggleOption(opt)}
                    selected={selectedValues.includes(opt)}
                  >
                    <OptionText>
                      {prettifySectionName(t(localizedOptions[idx]))}
                    </OptionText>
                  </OptionButton>
                ))}
              </>
            );
          }

          if (q.options && Array.isArray(q.options)) {
            return (
              <>
                {q.options.map((opt, idx) => (
                  <OptionButton
                    key={opt}
                    onPress={() => onChange(opt)}
                    selected={value === opt}
                  >
                    <OptionText>
                      {prettifySectionName(t(localizedOptions[idx]))}
                    </OptionText>
                  </OptionButton>
                ))}
              </>
            );
          }

          return (
            <>
              <TextInput
                value={value || ""}
                onChangeText={onChange}
                placeholder=""
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 12,
                }}
              />
              {value ? <AnswerText>{value}</AnswerText> : null}
            </>
          );
        }}
      />
    </QuestionContainer>
  );
};

const QuestionnaireForm = () => {
  const { t } = useTranslation();
  const { control, handleSubmit, watch } = useForm();
  const { session, setSession } = useSessionStore();
  const scrollViewRef = useRef<ScrollView>(null);

  const userLang = session?.user.user_lang || "en";
  const userId = session?.user.id;

  const questionnaireRaw = getQuestionnaire(t);

  const sections = Object.entries(questionnaireRaw).map(([section, qs]) => ({
    name: section,
    questions: reorderQuestions(qs as Question[]),
  }));
  const lang = userLang as Lang;
  const localizedCore = translations[lang]?.core;
  const submit = "submit";

  const shouldShow = (q: Question) => {
    if (!q.condition) return true;
    return Object.entries(q.condition).every(([key, val]) => {
      const watched = watch(key);
      return Array.isArray(val) ? val.includes(watched) : watched === val;
    });
  };

  const onSubmit = async (data: Record<string, any>) => {
    if (!userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const rows = Object.entries(data).map(([question_id, response]) => {
      let responseArr: string[] = [];
      if (Array.isArray(response)) {
        responseArr = response.map(String);
      } else if (response !== null && response !== undefined) {
        responseArr = [String(response)];
      }
      return {
        user_id: userId,
        question_id,
        response: responseArr,
        response_date: today,
      };
    });

    try {
      const { error: responseError } = await supabase
        .from("user_questionnaire_responses")
        .upsert(rows, { onConflict: "user_id,question_id" });

      if (responseError) throw responseError;

      const userProfileData = {
        questionnaire_completed: true,
        lastPeriodStart: data.lastPeriodStart,
        averageCycleLength: data.averageCycleLength,
        averagePeriodDuration: data.averagePeriodDuration,
      };

      const { error: userError } = await supabase
        .from("users")
        .update(userProfileData)
        .eq("id", userId);

      if (userError) throw userError;

      setSession({
        ...session,
        user: {
          ...session.user,
          questionnaire_completed: true,
        },
      });

      Alert.alert("Success", "Submitted successfully!");
    } catch (e: any) {
      console.error("Submission error:", e);
      Alert.alert("Submission failed", e.message || "Please try again later.");
    }
  };

  return (
    <Container>
      <ScrollView ref={scrollViewRef}>
        {sections.map((section, idx) => (
          <View
            key={idx}
            style={{ padding: 10, paddingTop: 10, rowGap: 4, margin: 0 }}
          >
            <SectionHeader>
              {prettifySectionName(t(section.name))}
            </SectionHeader>
            {section.questions.map((q) =>
              shouldShow(q) ? (
                <QuestionBlock
                  key={q.id}
                  q={q}
                  control={control}
                  userLang={userLang}
                />
              ) : null
            )}
          </View>
        ))}

        <SubmitButton onPress={handleSubmit(onSubmit)}>
          <SubmitText>
            {prettifySectionName(t(localizedCore[submit]))}
          </SubmitText>
        </SubmitButton>
      </ScrollView>
    </Container>
  );
};

export default QuestionnaireForm;
