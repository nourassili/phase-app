import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useSessionStore } from "./useSessionStore";

export const syncUserProfile = async (user: User | null) => {
  if (!user) {
    useSessionStore.getState().setSession(null);
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("questionnaire_completed, profile_completed, user_lang")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile for sync:", error);
  }

  const sessionData = {
    user: {
      id: user.id,
      email: user.email,
      questionnaire_completed: data?.questionnaire_completed ?? false,
      profile_completed: data?.profile_completed ?? false,
      user_lang: data?.user_lang ?? "en",
    },
  };

  useSessionStore.getState().setSession(sessionData as any);
};
