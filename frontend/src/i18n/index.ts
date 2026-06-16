import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';

/**
 * i18n initialisation.
 * To add a new language:
 *   1. Create src/i18n/locales/<lang>/translation.json
 *   2. Import it here and add it to `resources`
 *   3. No component changes needed.
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
    },
    // Use the browser's preferred language, fall back to English.
    lng: navigator.language.split('-')[0],
    fallbackLng: 'en',
    interpolation: {
      // React already escapes values — no need for i18next to do it too.
      escapeValue: false,
    },
  });

export default i18n;
