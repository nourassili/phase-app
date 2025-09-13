// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

/**
 * Central guard:
 * - Signed OUT  → keep in public (welcome/login/onboarding/paywall)
 * - Signed IN & !onboardingDone → /onboarding
 * - Signed IN & onboardingDone & !entitled → /paywall
 * - All good → /(protected)/(tabs)/home
 */
function Guard() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading, onboardingDone, entitled } = useAuth();

  useEffect(() => {
    if (loading) return;

    const first = segments[0] ?? ""; // e.g. "welcome", "(public)", "(protected)", "onboarding"
    const isPublic =
      first === "" ||
      first === "welcome" ||
      first === "login" ||
      first === "onboarding" ||
      first === "paywall" ||
      first.startsWith("(public)");
    const isProtected = first.startsWith("(protected)") || first === "(tabs)";

    // 1) Not signed in → stay in public
    if (!user) {
      if (!isPublic) router.replace("/welcome");
      return;
    }

    // 2) Signed in but not onboarded
    if (!onboardingDone) {
      if (first !== "onboarding") router.replace("/onboarding");
      return;
    }

    // 3) Onboarded but not entitled
    if (!entitled) {
      if (first !== "paywall") router.replace("/paywall");
      return;
    }

    // 4) All set → protected tabs
    if (!isProtected) {
      router.replace("/(protected)/(tabs)/home");
    }
  }, [loading, user, onboardingDone, entitled, segments, router]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Guard />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
