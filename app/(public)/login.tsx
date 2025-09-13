// app/(public)/login.tsx
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
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
      danger: "#DC2626",
    }),
    [isDark]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState<"in" | "up" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
  const validatePassword = (v: string) => v.length >= 6;

  const handleError = (err: any) => {
    // Surface friendly errors. If using Firebase, you can map by err.code.
    const msg =
      (err?.message as string) ||
      (typeof err === "string" ? err : "Something went wrong. Please try again.");
    setError(msg);
    Alert.alert("Error", msg);
  };

  const doSignIn = async () => {
    setError(null);
    if (!validateEmail(email)) return setError("Please enter a valid email address.");
    if (!validatePassword(password)) return setError("Password must be at least 6 characters.");
    try {
      setSubmitting("in");
      await signIn(email.trim(), password);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(null);
    }
  };

  const doSignUp = async () => {
    setError(null);
    if (!validateEmail(email)) return setError("Please enter a valid email address.");
    if (!validatePassword(password)) return setError("Password must be at least 6 characters.");
    try {
      setSubmitting("up");
      await signUp(email.trim(), password);
      // Optionally: show confirmation or auto-login depending on your AuthContext behavior
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(null);
    }
  };

  const doReset = async () => {
    if (!validateEmail(email)) {
      return setError("Enter your email above, then tap Reset.");
    }
    try {
      await resetPassword?.(email.trim());
      Alert.alert("Check your email", "We’ve sent password reset instructions.");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.sub }]}>
              Log in or create your account to personalize fitness, nutrition, and wellness
              for every stage of motherhood.
            </Text>

            {/* Email */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: colors.sub }]}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.sub}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.fieldBg,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>

            {/* Password */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: colors.sub }]}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.sub}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.fieldBg,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>

            {/* Inline error */}
            {error ? (
              <Text style={[styles.errorText, { color: colors.danger }]} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}

            {/* Primary: Create Account */}
            <Pressable
              onPress={doSignUp}
              disabled={!!submitting}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.primaryBg,
                  opacity: pressed || submitting ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              {submitting === "up" ? (
                <ActivityIndicator />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.primaryFg }]}>Create Account</Text>
              )}
            </Pressable>

            {/* Secondary: Log In */}
            <Pressable
              onPress={doSignIn}
              disabled={!!submitting}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: colors.border, opacity: pressed || submitting ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Log in"
            >
              {submitting === "in" ? (
                <ActivityIndicator />
              ) : (
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Log In</Text>
              )}
            </Pressable>

            {/* Sub actions */}
            <View style={styles.rowBetween}>
              <Pressable onPress={doReset} accessibilityRole="button">
                <Text style={[styles.link, { color: colors.sub }]}>Forgot password?</Text>
              </Pressable>
              {/* Placeholder for SSO (later): Google / Apple */}
              <Text style={[styles.link, { color: colors.sub }]}>Use single sign-on</Text>
            </View>

            <Text style={[styles.disclaimer, { color: colors.sub }]}>
              By continuing, you agree to our Terms & Privacy. Phase supports—never replaces—
              professional medical advice.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: "center" },
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
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: -4,
  },
  fieldBlock: { marginTop: 6 },
  label: { fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  errorText: { marginTop: 4, fontSize: 13 },
  primaryBtn: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "700" },
  rowBetween: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: { fontSize: 13, textDecorationLine: "underline" },
  disclaimer: { marginTop: 6, fontSize: 11, textAlign: "center" },
});
