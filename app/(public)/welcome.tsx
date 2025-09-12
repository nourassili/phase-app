// app/(public)/welcome.tsx
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

type Styles = {
  safe: ViewStyle;
  wrap: ViewStyle;
  brand: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  card: ViewStyle;
  cardLine: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  footnote: TextStyle;
};

export default function WelcomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const isDark = scheme === "dark";
  const bg = isDark ? "#0B0B0C" : "#FAFAFB";
  const card = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const text = isDark ? "#FFFFFF" : "#0B0B0C";
  const sub = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";
  const accent = isDark ? "#D0D3FF" : "#111827";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.wrap}>
        <Text style={[styles.brand, { color: accent }]}>Phase</Text>

        <Text style={[styles.title, { color: text }]}>
          Health that fits your life.
        </Text>
        <Text style={[styles.subtitle, { color: sub }]}>
          A calm, focused start—one small habit at a time.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: card,
              borderColor: isDark ? "#1F2937" : "#E5E7EB",
            },
          ]}
        >
          <Text style={[styles.cardLine, { color: sub }]}>
            Personalized guidance • Gentle reminders • Real results
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log in"
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: isDark ? "#FFFFFF" : "#111827",
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: isDark ? "#111827" : "#FFFFFF" },
              ]}
            >
              Log in
            </Text>
          </Pressable>
        </Animated.View>

        <Text style={[styles.footnote, { color: sub }]}>
          By continuing, you agree to our Terms & Privacy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<Styles>({
  safe: { flex: 1 },
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 24,
    paddingBottom: 28,
  },
  brand: {
    fontSize: 18,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "600",
    alignSelf: "center",
    marginTop: 8,
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  card: {
    marginTop: 28,
    alignSelf: "center",
    width: "100%",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardLine: {
    textAlign: "center",
    fontSize: 14,
  },
  button: {
    marginTop: 32,
    alignSelf: "center",
    width: "100%",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  footnote: { fontSize: 12, textAlign: "center", marginTop: 16 },
});
