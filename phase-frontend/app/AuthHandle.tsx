import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import OnboardHandler from "./OnboardHandle";

export default function AuthHandle() {
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);
  const { session, setSession } = useSessionStore();

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        setInitializing(false);
        return;
      }

      if (data?.session) {
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (userProfile && !profileError) {
          setSession({
            ...data.session,
            user: { ...userProfile },
          });
        } else {
          console.error("Error fetching user profile:", profileError);
        }
      }

      setInitializing(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (newSession?.user?.id) {
          const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", newSession.user.id)
            .single();

          if (userProfile && !profileError) {
            setSession({
              ...newSession,
              user: userProfile,
            });
          } else {
            console.error("Error refreshing user session:", profileError);
          }
        } else {
          setSession(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setSession]);

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

  if (!session) return null;

  return <OnboardHandler userId={session.user.id} />;
}
