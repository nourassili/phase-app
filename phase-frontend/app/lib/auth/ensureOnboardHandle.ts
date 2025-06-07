import { useSessionStore } from "@/app/store/useSessionStore";
import { router } from "expo-router";
import { publicRoutes } from "./publicRoutes";

export const ensureOnboardHandler = (segments: string[]) => {
  const currentRoute = segments.filter(Boolean).pop() ?? "";
  const { session } = useSessionStore.getState();

  console.log("Current route:", currentRoute);
  console.log("Session user:", session?.user);

  if (!session) {
    if (!publicRoutes.includes(currentRoute)) {
      router.replace("/LandingPage");
    }
    return;
  }

  const questionnaireCompleted = session.user.questionnaire_completed;
  const profileCompleted = session.user.profile_completed ?? false;

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

  const onboardingOrAuthRoutes = [
    "LandingPage",
    "SignInScreen",
    "SignUpScreen",
    "questionScreen",
    "ProfileCreationScreen",
    "",
  ];

  if (
    questionnaireCompleted &&
    profileCompleted &&
    onboardingOrAuthRoutes.includes(currentRoute)
  ) {
    router.replace("/Home");
    return;
  }
};
