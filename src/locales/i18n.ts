import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translation from './locales'

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: translation['en-US'].global,
    home: translation['en-US'].index,
    console: translation['en-US'].console,
    signin: translation['en-US'].signin,
    files: translation['en-US'].files
  },
  'zh-CN': {
    translation: translation['zh-CN'].global,
    home: translation['zh-CN'].index,
    console: translation['zh-CN'].console,
    signin: translation['zh-CN'].signin,
    files: translation['zh-CN'].files
  },
}

const getLang = () => {
  const navLang =
  navigator.language === "zh-CN" || navigator.language === "en"
    ? navigator.language
    : false
  const localLang = window.localStorage.getItem("language")
  const lsLang = localLang === "zh-CN" || localLang === "en" ? localLang : false
  return lsLang || navLang || "en" // fallback to en
}

i18n.use(initReactI18next) // passes i18n down to react-i18next
  //   .use(LanguageDetector)
  .init({
    resources,
    lng: getLang(),
    fallbackLng: 'en',
    // debug: true,
    keySeparator: '.', // we can use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export const SwitchLang = () => {
  const lang = getLang()
  const newLang = lang === "zh-CN" ? 'en' : "zh-CN"
  i18n.changeLanguage(newLang)
  localStorage.setItem("language", newLang)
}

export default i18n
