import { useSessionStore } from "@/app/store/useSessionStore";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ensureOnboardHandler } from "./lib/auth/ensureOnboardHandle";

export default function RootLayout() {
  const { session } = useSessionStore();
  const segments = useSegments();
  const router = useRouter();
  console.log("RootLayout session:", session);
  console.log("Current segments:", segments);

  useEffect(() => {

    ensureOnboardHandler(segments);
  }, [session, segments, router]);

  return <Slot />;
}
