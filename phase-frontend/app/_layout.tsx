import { supabase } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(currentSession);
        setIsLoading(false);

        if (currentSession) {
          if (
            segments[0] === undefined ||
            segments[0] === "LandingPage" ||
            segments[0] === "SignInScreen" ||
            segments[0] === "SignUpScreen"
          ) {
            router.replace("/Home");
          }
        } else {
          if (
            segments[0] !== undefined &&
            segments[0] !== "LandingPage" &&
            segments[0] !== "SignInScreen" &&
            segments[0] !== "SignUpScreen"
          ) {
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("Session fetch error:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        if (session) {
          if (
            segments[0] === undefined ||
            segments[0] === "LandingPage" ||
            segments[0] === "SignInScreen" ||
            segments[0] === "SignUpScreen"
          ) {
            router.replace("/Home");
          }
        } else {
          if (
            segments[0] !== undefined &&
            segments[0] !== "LandingPage" &&
            segments[0] !== "SignInScreen" &&
            segments[0] !== "SignUpScreen"
          ) {
            router.replace("/");
          }
        }
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7A559C" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
