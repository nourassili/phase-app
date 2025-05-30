import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LandingPage() {
  const router = useRouter();
  const spinAnim = useRef(new Animated.Value(0)).current;

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
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signUpButton]}
          onPress={() => router.push("/SignUpScreen")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
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
