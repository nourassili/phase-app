import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);

    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      setLoading(false);
      return;
    }

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        Alert.alert("Sign In Error", signInError.message);
        setLoading(false);
        return;
      }

      const userId = signInData.user?.id;
      if (!userId) {
        Alert.alert("Sign In Error", "User ID not found after sign in.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("questionnaire_completed")
        .eq("id", userId)
        .single();

      if (error) {
        Alert.alert("Database Error", error.message);
        setLoading(false);
        return;
      }

      const questionnaireCompleted = data?.questionnaire_completed ?? false;

      setSession({
        user: {
          id: userId,
          email,
          questionnaire_completed: questionnaireCompleted,
        },
      });
    } catch (error) {
      Alert.alert("Unexpected Error", String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back to Phase</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#AAA"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
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
        onPress={handleSignIn}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/Home")}
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
