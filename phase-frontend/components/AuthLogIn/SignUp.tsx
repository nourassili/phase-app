import { supabase } from "@/utils/supabase";
import { NavigationProp, useNavigation } from "@react-navigation/native";
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

export default function SignUp() {
  const navigation =
    useNavigation<NavigationProp<{ Questionnaire: undefined }>>();
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

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
      }
    );

    setLoading(false);

    if (signUpError) {
      Alert.alert("Sign Up Error", signUpError.message);
      return;
    }

    if (signUpData && !signUpError) {
      const userId = signUpData.user?.id;
      if (!userId) {
        Alert.alert("Sign Up Error", "User ID is not available.");
        return;
      }
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email,
      });
      if (insertError) {
        console.error("Error inserting user profile:", insertError);
      }
      Alert.alert("Account created successfully");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your Phase account</Text>

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
        style={[styles.signUpButton, loading && styles.disabledButton]}
        onPress={handleSignUp}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0FF",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5A3E99",
    marginBottom: 40,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: "#4A397B",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderColor: "#7A559C",
    borderWidth: 1,
    color: "#222",
    shadowColor: "#7A559C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  signUpButton: {
    backgroundColor: "#7A559C",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#5A3E99",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
