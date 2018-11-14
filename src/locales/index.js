import Vue from "vue";
import VueI18n from "vue-i18n";
import locales from "./locales";
import zhLocale from "iview/src/locale/lang/zh-CN";
import enLocale from "iview/src/locale/lang/en-US";

Vue.use(VueI18n);
// auto set language
const navLang =
  navigator.language === "zh" || navigator.language === "en"
    ? navigator.language
    : false;
const localLang = window.localStorage.getItem("language");
const lsLang = localLang === "zh" || localLang === "en" ? localLang : false;
const lang = lsLang || navLang || "zh";

const messages = {
  zh: Object.assign(zhLocale, locales["zh-CN"]),
  en: Object.assign(enLocale, locales["en-US"])
};

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: lang, // set locales
  messages
});

export default i18n;
