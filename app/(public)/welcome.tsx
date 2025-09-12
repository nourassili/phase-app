//  app/(public)/welcome.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Subtle fade-in for the whole screen
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [fade]);

  // Tiny press feedback for the CTA
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.98, speed: 20, bounciness: 6, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 6, useNativeDriver: true }).start();

  const colors = {
    bg: isDark ? "#0B0B0C" : "#FAFAFB",
    text: isDark ? "#FFFFFF" : "#0B0B0C",
    sub: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
    buttonBg: isDark ? "#FFFFFF" : "#111827",
    buttonFg: isDark ? "#111827" : "#FFFFFF",
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Animated.View style={[styles.wrap, { opacity: fade }]}>
        {/* [ Phase Logo ] */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../../assets/images/phaselogo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="Phase logo"
          />
        </View>

        {/* Headline + Subheadline */}
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text }]}>
            Health that fits your life.
          </Text>
          <Text style={[styles.subtitle, { color: colors.sub }]}>
            Calm, focused wellness for{`\n`}mothers with busy lives.
          </Text>
        </View>

        {/* [   Get Started   ] */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => router.push("/login")}
            style={[styles.button, { backgroundColor: colors.buttonBg }]}
          >
            <Text style={[styles.buttonText, { color: colors.buttonFg }]}>Get Started</Text>
          </Pressable>
        </Animated.View>

        {/* tiny: Terms & Privacy  /  Built with care <3 */}
        <View style={styles.footnotes}>
          <Text style={[styles.footnote, { color: colors.sub }]}>Terms & Privacy</Text>
          <Text style={[styles.footnote, { color: colors.sub }]}>Built with care &lt;3</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrap: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  logoWrap: { alignItems: "center", marginTop: 8 },
  logo: { width: 120, height: 120, marginBottom: 8 },
  center: { alignItems: "center", paddingHorizontal: 8 },
  title: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    alignSelf: "center",
    width: "100%",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  buttonText: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  footnotes: { alignItems: "center", gap: 2, marginTop: 14 },
  footnote: { fontSize: 12, textAlign: "center" },
});
