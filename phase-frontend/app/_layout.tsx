import i18n, { initI18n } from "@/utils/internationalize/i18n";
import { updateUserLanguageInDB } from "@/utils/utilApi/updateUserLanguageInDB";
import * as Localization from "expo-localization";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { ensureOnboardHandler } from "./lib/auth/ensureOnboardHandle";
import { useSessionStore } from "./store/useSessionStore";

export default function RootLayout() {
  const { session } = useSessionStore();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initializeI18nAndLanguage() {
      await initI18n(session?.user.user_lang);
      const deviceLang = Localization.getLocales()[0]?.languageCode;
      if (deviceLang && session?.user && i18n.language !== deviceLang) {
        await i18n.changeLanguage(deviceLang);
        await updateUserLanguageInDB(session.user.id, deviceLang);
      }

      setReady(true);
    }

    initializeI18nAndLanguage();
  }, [session]);

  useEffect(() => {
    if (!ready || !session) return;
    ensureOnboardHandler(segments);
  }, [ready, segments, session]);

  if (!ready) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <Slot />
    </I18nextProvider>
  );
}
