import { Slot, useSegments } from "expo-router";
import { useEffect } from "react";
import { ensureOnboardHandler } from "./lib/auth/ensureOnboardHandle";

export default function RootLayout() {
  const segments = useSegments();

  useEffect(() => {
    ensureOnboardHandler(segments);
  }, [segments]);

  return <Slot />;
}
