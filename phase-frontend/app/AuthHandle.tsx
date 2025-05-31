import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import OnboardHandler from "./OnboardHandle";

export default function AuthHandle() {
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      }
      setSession(data?.session ?? null);
      setInitializing(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (initializing) return;

    if (!session) {
      router.replace("/LandingPage");
    }
  }, [initializing, session, router]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7A559C" />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  return <OnboardHandler userId={session.user.id} />;
}
