// app/(public)/welcome.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext"; // ← ADDED

const MESSAGES = [
  "Improve your skin",
  "Boost sleep quality",
  "Enhance your diet",
  "Strengthen bones",
  "Protect your heart",
  "Support metabolism",
  "Pelvic floor care",
  "Lower stress load",
];

/**
 * A seamless, auto-scrolling marquee of short boxed lines.
 * It measures the row width, duplicates it, and translates left continuously.
 */
function TopMarquee({
  items,
  bgColor,
  textColor,
  boxBg,
  boxBorder,
}: {
  items: string[];
  bgColor: string;
  textColor: string;
  boxBg: string;
  boxBorder: string;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [rowWidth, setRowWidth] = useState(0);

  // Tweak this for speed (pixels per second)
  const SPEED_PX_PER_SEC = 35;

  // Start/loop animation once we know total row width
  useEffect(() => {
    if (!rowWidth) return;
    translateX.setValue(0);
    const durationMs = (rowWidth / SPEED_PX_PER_SEC) * 1000;

    const loopAnim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -rowWidth, // move one full row to the left
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loopAnim.start();

    return () => {
      translateX.stopAnimation();
    };
  }, [rowWidth, translateX]);

  const onRowLayout = (e: LayoutChangeEvent) => {
    const w = Math.ceil(e.nativeEvent.layout.width);
    if (w && w !== rowWidth) setRowWidth(w);
  };

  // Single row (measured); duplicated for seamless loop
  const Row = () => (
    <View style={styles.marqueeRow} onLayout={onRowLayout}>
      {items.map((label, idx) => (
        <View
          key={`${label}-${idx}`}
          style={[
            styles.badge,
            { backgroundColor: boxBg, borderColor: boxBorder },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={[styles.badgeText, { color: textColor }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View
      style={[styles.marqueeBar, { backgroundColor: bgColor }]}
      accessibilityRole="header"
      accessibilityLabel="Highlights"
    >
      {/* Render the measured row once (visible immediately). Once measured, the Animated twin kicks in. */}
      {!rowWidth ? (
        <Row />
      ) : (
        <Animated.View
          style={{
            flexDirection: "row",
            transform: [{ translateX }],
          }}
        >
          <Row />
          {/* duplicate right after for seamless wrap-around */}
          <Row />
        </Animated.View>
      )}
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { devResetLocalFlags } = useAuth(); // ← ADDED

  const colors = useMemo(
    () => ({
      bg: isDark ? "#0B0B0C" : "#FAFAFB",
      text: isDark ? "#FFFFFF" : "#0B0B0C",
      sub: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
      buttonBg: isDark ? "#FFFFFF" : "#111827",
      buttonFg: isDark ? "#111827" : "#FFFFFF",

      // Marquee theme
      marqueeBg: isDark ? "rgba(255,255,255,0.06)" : "#EEEAF4", // soft, premium strip
      badgeBg: isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
      badgeBorder: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
      badgeText: isDark ? "#FFFFFF" : "#111827",
    }),
    [isDark]
  );

  // Page fade-in
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [fade]);

  // CTA press micro-interaction
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* === TOP CONTINUOUS MARQUEE === */}
      <TopMarquee
        items={MESSAGES}
        bgColor={colors.marqueeBg}
        textColor={colors.badgeText}
        boxBg={colors.badgeBg}
        boxBorder={colors.badgeBorder}
      />
      {/* === /MARQUEE === */}

      <Animated.View style={[styles.wrap, { opacity: fade }]}>
        {/* Logo */}
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
            Wellness that fits your life.
          </Text>
          <Text style={[styles.subtitle, { color: colors.sub }]}>
            Calm, focused wellness for{`\n`}mothers with busy lives.
          </Text>
        </View>

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => router.push("/onboarding/name")}
            style={[styles.button, { backgroundColor: colors.buttonBg }]}
          >
            <Text style={[styles.buttonText, { color: colors.buttonFg }]}>Get Started</Text>
          </Pressable>
        </Animated.View>

        {/* Footnotes */}
        <View style={styles.footnotes}>
          <Text style={[styles.footnote, { color: colors.sub }]}>
            By continuing, you agree to Terms & Privacy
          </Text>
          <Text style={[styles.footnote, { color: colors.sub }]}>
            Built with care 🪷
          </Text>
        </View>

        {/* === DEV ONLY: reset local flags (onboardingDone / entitled) === */}
        {__DEV__ && (
          <Pressable onPress={devResetLocalFlags} style={styles.devBtn}>
            <Text style={styles.devBtnText}>DEV: Reset local flags</Text>
          </Pressable>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Body wrapper
  wrap: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  // Top marquee bar
  marqueeBar: {
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 10,
  },
  marqueeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 10,
    // subtle shadow (iOS) / elevation (Android)
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Logo
  logoWrap: { alignItems: "center", marginTop: 8 },
  logo: { width: 300, height: 300, marginBottom: 8 },

  // Headline / sub
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

  // CTA
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

  // Footnotes
  footnotes: { alignItems: "center", gap: 2, marginTop: 14 },
  footnote: { fontSize: 12, textAlign: "center" },

  // DEV button
  devBtn: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(127,127,127,0.3)",
  },
  devBtnText: { fontSize: 12, opacity: 0.8 },
});
