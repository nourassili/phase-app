import { useSessionStore } from "@/app/store/useSessionStore";
import { router } from "expo-router";
import { privateAppRoutes } from "./privateRoutes";
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
  const profileCompleted = session.user.profile_completed;

  if (!questionnaireCompleted && currentRoute !== "questionScreen") {
    router.replace("/questionScreen");
    return;
  }
  if (
    questionnaireCompleted &&
    !profileCompleted &&
    currentRoute !== "ProfileCreationScreen"
  ) {
    router.replace("/ProfileCreationScreen");
    return;
  }

  if (
    questionnaireCompleted &&
    profileCompleted &&
    !privateAppRoutes.includes(currentRoute)
  ) {
    router.replace("/Home");
    return;
  }
};
