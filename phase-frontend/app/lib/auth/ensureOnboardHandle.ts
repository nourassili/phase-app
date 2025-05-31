import { useSessionStore } from "@/app/store/useSessionStore";
import { router } from "expo-router";
import { publicRoutes } from "./publicRoutes";

export const ensureOnboardHandler = (segments: string[]) => {
  const currentRoute = segments[segments.length - 1] || "";
  const { session } = useSessionStore.getState();

  if (!session) {
    if (!publicRoutes.includes(currentRoute)) {
      router.replace("/LandingPage");
    }
    return;
  }

  const questionnaireCompleted = session.user.questionnaire_completed;

  if (!questionnaireCompleted && currentRoute !== "questionScreen") {
    router.replace("/questionScreen");
    return;
  }

  if (questionnaireCompleted && currentRoute === "questionScreen") {
    router.replace("/Home");
    return;
  }
};
