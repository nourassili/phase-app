// app/_layout.tsx
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

/**
 * Routing rules:
 * - Signed OUT → allow public routes: /, /welcome, /login, /onboarding, /paywall
 * - Signed IN & !onboardingDone → /onboarding
 * - Signed IN & onboardingDone & !entitled → /paywall
 * - Signed IN & onboardingDone & entitled → /(protected)/(tabs)/home
 *
 * Notes:
 * - We wait for auth "hydration" before redirecting to avoid flicker/races.
 * - We match on pathname (stable) instead of brittle segment names.
 */
function Guard() {
  const router = useRouter();
  const pathname = usePathname();

  // Expect these from AuthContext (see "Other required edits" below)
  const { user, loading, hydrated, onboardingDone, entitled } = useAuth();

  useEffect(() => {
    // Do not redirect until auth + local state are hydrated.
    if (loading || !hydrated) return;

    const PUBLIC_PATHS = new Set<string>([
      "/",
      "/welcome",
      "/login",
      "/onboarding",
      "/paywall",
    ]);
    const isPublicPath = PUBLIC_PATHS.has(pathname);
    const inProtected = pathname.startsWith("/(protected)");

    // 1) Not signed in (anonymous not created yet or signed-out) → stay in public
    if (!user) {
      if (!isPublicPath) router.replace("/welcome");
      return;
    }

    // 2) Signed in but not onboarded → force onboarding
    if (!onboardingDone) {
      if (pathname !== "/onboarding") router.replace("/onboarding");
      return;
    }

    // 3) Onboarded but not entitled → force paywall
    if (!entitled) {
      if (pathname !== "/paywall") router.replace("/paywall");
      return;
    }

    // 4) All set → protected tabs home
    if (!inProtected) {
      router.replace("/(protected)/(tabs)/home");
    }
  }, [loading, hydrated, user, onboardingDone, entitled, pathname, router]);

  // We render nothing; Stack below will render the route content.
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
