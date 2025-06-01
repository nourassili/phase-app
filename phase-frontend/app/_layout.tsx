import { useSessionStore } from "@/app/store/useSessionStore";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { publicRoutes } from "./lib/auth/publicRoutes";

export default function RootLayout() {
  const { session } = useSessionStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const currentRoute = segments[segments.length - 1] || "";

    if (!session) {
      if (!publicRoutes.includes(currentRoute)) {
        router.replace("/LandingPage");
      }
      return;
    }

    const questionnaireCompleted = session.user.questionnaire_completed;

    if (!questionnaireCompleted && currentRoute !== "questionScreen") {
      router.replace("/questionScreen");
    }

    if (questionnaireCompleted && currentRoute === "questionScreen") {
      router.replace("/Home");
    }
  }, [session, segments, router]);

  return <Slot />;
}
