import i18n, { initI18n } from "@/utils/internationalize/i18n";
import { supabase } from "@/utils/supabase";
import { updateUserLanguageInDB } from "@/utils/utilApi/updateUserLanguageInDB";
import * as Localization from "expo-localization";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { ensureOnboardHandler } from "./lib/auth/ensureOnboardHandle";
import { syncUserProfile } from "./store/syncUserProfile";
import { useSessionStore } from "./store/useSessionStore";

export default function RootLayout() {
  const { session } = useSessionStore();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserProfile(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserProfile(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function initializeI18nAndLanguage() {
      await initI18n(session?.user?.user_lang);
      const deviceLang = Localization.getLocales()[0]?.languageCode;

      if (session?.user && deviceLang && i18n.language !== deviceLang) {
        await i18n.changeLanguage(deviceLang);
        await updateUserLanguageInDB(session.user.id, deviceLang);
      }
      setReady(true);
    }

    initializeI18nAndLanguage();
  }, [session]);

  useEffect(() => {
    if (ready) {
      ensureOnboardHandler(segments);
    }
  }, [ready, session, segments, router]);

  if (!ready) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <Slot />
    </I18nextProvider>
  );
}
