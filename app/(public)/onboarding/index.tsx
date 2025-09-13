// app/(public)/onboarding/index.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";

const GOALS = [
  "Sleep quality",
  "Bone strength",
  "Heart health",
  "Skin & hair",
  "Metabolism",
  "Pelvic floor",
];

export default function OnboardingIndex() {
  const router = useRouter();
  const { setOnboardingDone } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = useMemo(
    () => ({
      bg: isDark ? "#0B0B0C" : "#FAFAFB",
      card: isDark ? "#131316" : "#FFFFFF",
      text: isDark ? "#FFFFFF" : "#0B0B0C",
      sub: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
      border: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)",
      fieldBg: isDark ? "#18181B" : "#F4F4F5",
      primaryBg: isDark ? "#FFFFFF" : "#111827",
      primaryFg: isDark ? "#111827" : "#FFFFFF",
      chipBg: isDark ? "rgba(255,255,255,0.08)" : "#F4F4F5",
    }),
    [isDark]
  );

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const yearValid =
    /^\d{4}$/.test(year) &&
    +year >= 1940 &&
    +year <= new Date().getFullYear();

  const next = () => {
    if (step === 0) return setStep(1);
    if (step === 1) {
      if (!yearValid) return; // simple validation
      return setStep(2);
    }
    // step 2 → finish
    finish();
  };

  const finish = () => {
    // TODO: persist onboarding answers if you want
    setOnboardingDone(true);
    router.replace("/paywall");
  };

  const skip = () => {
    setOnboardingDone(true);
    router.replace("/paywall");
  };

  const toggleGoal = (g: string) => {
    setSelected((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.progress, { color: colors.sub }]}>
              Step {step + 1} of 3
            </Text>

            {step === 0 && (
              <>
                <Text style={[styles.title, { color: colors.text }]}>Let’s personalize your plan</Text>
                <Text style={[styles.subtitle, { color: colors.sub }]}>What’s your name?</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.sub}
                  autoCapitalize="words"
                  style={[
                    styles.input,
                    { color: colors.text, backgroundColor: colors.fieldBg, borderColor: colors.border },
                  ]}
                />
              </>
            )}

            {step === 1 && (
              <>
                <Text style={[styles.title, { color: colors.text }]}>
                  {name ? `Welcome, ${name}.` : "Welcome."}
                </Text>
                <Text style={[styles.subtitle, { color: colors.sub }]}>
                  What year were you born?
                </Text>
                <TextInput
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="e.g., 1978"
                  placeholderTextColor={colors.sub}
                  style={[
                    styles.input,
                    { color: colors.text, backgroundColor: colors.fieldBg, borderColor: colors.border, textAlign: "center" },
                  ]}
                />
                {!yearValid && year.length > 0 ? (
                  <Text style={[styles.hint, { color: colors.sub }]}>
                    Enter a 4-digit year.
                  </Text>
                ) : null}
              </>
            )}

            {step === 2 && (
              <>
                <Text style={[styles.title, { color: colors.text }]}>What would you like to focus on?</Text>
                <Text style={[styles.subtitle, { color: colors.sub }]}>
                  Choose as many as you like.
                </Text>
                <View style={styles.chips}>
                  {GOALS.map((g) => {
                    const active = selected.includes(g);
                    return (
                      <Pressable
                        key={g}
                        onPress={() => toggleGoal(g)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: colors.chipBg,
                            borderColor: active ? colors.primaryBg : colors.border,
                            borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
                          },
                        ]}
                      >
                        <Text style={{ color: colors.text }}>{g}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* Primary button */}
            <Pressable
              onPress={next}
              style={[styles.primary, { backgroundColor: colors.primaryBg }]}
              accessibilityRole="button"
            >
              <Text style={[styles.primaryText, { color: colors.primaryFg }]}>
                {step < 2 ? "Continue" : "Finish"}
              </Text>
            </Pressable>

            {/* Skip */}
            <Pressable onPress={skip} hitSlop={12}>
              <Text style={[styles.skip, { color: colors.sub }]}>Skip for now</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 14,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  progress: { fontSize: 12, textAlign: "center", marginBottom: 2 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center" },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  hint: { fontSize: 12, textAlign: "center", marginTop: -2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999 },
  primary: { marginTop: 8, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  primaryText: { fontSize: 16, fontWeight: "700" },
  skip: { fontSize: 13, textDecorationLine: "underline", textAlign: "center" },
});
