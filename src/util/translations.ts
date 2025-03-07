import { store } from "@/redux";
import { selectDeviceInfo } from "@/redux/device";
import { selectPreferences } from "@/redux/preferences";

export const translate = (translationObject): string => {
  // If language set in Selene Settings,
  // try to use that language
  const preferences = selectPreferences(store.getState());
  const preferencesLanguageCode = preferences.languageCode;

  if (preferencesLanguageCode && translationObject[preferencesLanguageCode]) {
    return translationObject[preferencesLanguageCode];
  }

  // If language unset, try to use device language
  const deviceInfo = selectDeviceInfo(store.getState());
  const deviceLanguageCode = deviceInfo.languageCode;

  if (translationObject[deviceLanguageCode]) {
    return translationObject[deviceLanguageCode];
  }

  // Default to English if no translation in those languages
  return translationObject.en;
};

// NOTE: Keep this list in sync with ISO_639_1_LANGUAGES
// for automated translation script in automation/addLanguages.js
export const languageList = [
  {
    code: "",
    name: "Same as device",
    flag: "",
  },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  {
    code: "bn",
    name: "বাংলা",
    flag: "🇧🇩",
  },
  {
    code: "da",
    name: "Dansk",
    flag: "🇩🇰️",
  },
  {
    code: "de",
    name: "Deutsch",
    flag: "🇩🇪",
  },
  {
    code: "el",
    name: "Ελληνικά",
    flag: "🇬🇷",
  },
  {
    code: "en",
    name: "English (US)",
    flag: "🇺🇸",
  },
  {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
  },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
  },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  {
    code: "hi",
    name: "हिन्दी",
    flag: "🇮🇳",
  },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  {
    code: "it",
    name: "Italiano",
    flag: "🇮🇹",
  },
  {
    code: "ja",
    name: "日本語",
    flag: "🇯🇵",
  },
  {
    code: "jv",
    name: "Basa Jawa",
    flag: "🇮🇩",
  },
  {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
  },
  {
    code: "mr",
    name: "मराठी",
    flag: "🇮🇳",
  },
  {
    code: "ms",
    name: "Bahasa Melayu",
    flag: "🇲🇾",
  },
  {
    code: "nb",
    name: "Norsk Bokmål",
    flag: "🇳🇴️",
  },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  {
    code: "pa",
    name: "ਪੰਜਾਬੀ",
    flag: "🇮🇳",
  },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  {
    code: "pt",
    name: "Português",
    flag: "🇵🇹",
  },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  {
    code: "ru",
    name: "Русский",
    flag: "🇷🇺",
  },
  {
    code: "sv",
    name: "Svenska",
    flag: "🇸🇪️",
  },
  { code: "sw", name: "Kiswahili", flag: "🇹🇿" },
  {
    code: "ta",
    name: "தமிழ்",
    flag: "🇮🇳",
  },
  {
    code: "te",
    name: "తెలుగు",
    flag: "🇮🇳",
  },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  {
    code: "tr",
    name: "Türkçe",
    flag: "🇹🇷",
  },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  {
    code: "ur",
    name: "اردو",
    flag: "🇵🇰",
  },
  {
    code: "vi",
    name: "Tiếng Việt",
    flag: "🇻🇳",
  },
  {
    code: "zh",
    name: "中文",
    flag: "🇨🇳",
  },
  {
    code: "zh_TW",
    name: "中文（台灣）",
    flag: "🇹🇼",
  },
];
