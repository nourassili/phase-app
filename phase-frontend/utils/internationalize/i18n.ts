/* eslint-disable import/no-named-as-default-member */
import { translations } from "@/utils/translationQuestions/translations";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export async function initI18n(defaultLang: string = "en") {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: translations,
      lng: defaultLang,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
  } else {
    await i18n.changeLanguage(defaultLang);
  }
  return i18n;
}

export default i18n;
