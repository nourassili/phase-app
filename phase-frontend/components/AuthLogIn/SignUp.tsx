import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);

    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      setLoading(false);
      return;
    }

    try {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          Alert.alert(
            "User Exists",
            "An account with this email already exists. Please sign in instead."
          );
        } else if (
          signUpError.message.includes(
            "Password should be at least 6 characters"
          )
        ) {
          Alert.alert(
            "Weak Password",
            "Your password must be at least 6 characters long."
          );
        } else {
          Alert.alert("Sign Up Error", signUpError.message);
        }
        setLoading(false);
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        Alert.alert("Sign Up Error", "User ID not found after sign up.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email,
        questionnaire_completed: false,
        profile_completed: false,
      });

      if (insertError) {
        console.error("Error inserting user profile:", insertError);
        Alert.alert(
          "Sign Up Error",
          "Failed to create your user profile. Please try again."
        );
        setLoading(false);
        return;
      }

      Alert.alert("Account Created");
    } catch (error) {
      Alert.alert("Unexpected Error", String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your Phase account</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t("Email")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("Email")}
          placeholderTextColor="#AAA"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t("Password")}</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#AAA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        onPress={handleSignUp}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t("signUp")}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/LandingPage")}
        disabled={loading}
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: "#AAA" }}>Back to Landing Page</Text>
      </TouchableOpacity>
    </View>
  );
}

const prune = "#5D3A66";
const pruneLight = "#7A559C";
const white = "#fff";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: prune,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    color: white,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: white,
    marginBottom: 6,
  },
  input: {
    backgroundColor: pruneLight,
    color: white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  button: {
    backgroundColor: pruneLight,
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: white,
    fontWeight: "700",
    fontSize: 18,
  },
});
