import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect } from "react";

interface Props {
  userId: string;
}

export default function OnboardHandler({ userId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const checkQuestionnaireCompletion = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("questionnaire_completed")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error checking questionnaire completion:", error);
        return;
      }

      if (data?.questionnaire_completed) {
        router.replace("/Home");
      } else {
        router.replace("/questionScreen");
      }
    };

    checkQuestionnaireCompletion();
  }, [userId, router]);

  return null;
}
