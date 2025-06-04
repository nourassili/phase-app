import { supabase } from "../supabase";

export async function updateUserLanguageInDB(
  userId: string,
  user_lang: string
): Promise<boolean> {
  const { error } = await supabase
    .from("users")
    .update({ user_lang })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user language:", error);
    return false;
  }

  return true;
}
