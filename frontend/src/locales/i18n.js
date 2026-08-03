// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

import es from "./es.json"; // Español - España
import en from "./en.json"; // English - United States
import zh from "./zh.json"; // Chinese - China
import jp from "./jp.json"; // Japanese - Japan

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      zh: { translation: zh },
      jp: { translation: jp },
    },
    fallbackLng: "es",
    detection: { order: ["localStorage", "navigator"] },
  });

export default i18n;