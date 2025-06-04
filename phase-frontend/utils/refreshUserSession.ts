import { useSessionStore } from "@/app/store/useSessionStore";
import { supabase } from "@/utils/supabase";

export const refreshSessionUser = async () => {
  const session = useSessionStore.getState().session;
  if (!session?.user?.id) return;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (data && !error) {
    useSessionStore.setState({ session: { ...session, user: data } });
  } else {
    console.error("Failed to refresh session user:", error);
  }
};
