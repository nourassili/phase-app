import { Lang } from "@/components/AuthLogIn/QuestionnaireForm";
import { translations } from "@/utils/translationQuestions/translations";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSessionStore } from "./store/useSessionStore";

export default function LandingPage() {
  const { t } = useTranslation();
  const session = useSessionStore();
  const router = useRouter();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const lang = useMemo(() => {
    return (session.session?.user.user_lang as Lang) || "en";
  }, [session.session?.user.user_lang]);

  const langQuestions = translations[lang].core;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}
      >
        <Text style={styles.icon}>🌀</Text>
      </Animated.View>
      <Text style={styles.title}>PHASE</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.signInButton]}
          onPress={() => router.push("/SignInScreen")}
        >
          <Text style={styles.buttonText}>{t(langQuestions["signIn"])}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signUpButton]}
          onPress={() => router.push("/SignUpScreen")}
        >
          <Text style={styles.buttonText}>{t(langQuestions["signUp"])}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const prune = "#5D3A66";
const pruneLight = "#7A559C";
const blue = "#4A90E2";
const white = "#fff";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: prune,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 80,
    color: white,
  },
  title: {
    fontSize: 64,
    fontWeight: "900",
    color: white,
    marginBottom: 40,
    letterSpacing: 8,
    fontFamily: "Arial Black",
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 32,
    marginVertical: 10,
    alignItems: "center",
  },
  signInButton: {
    backgroundColor: blue,
  },
  signUpButton: {
    backgroundColor: pruneLight,
  },
  buttonText: {
    color: white,
    fontSize: 20,
    fontWeight: "700",
  },
});
