import findFilesWithTranslations from "./findFilesWithTranslations.cjs";
import processFile from "./processFile.js";

console.log("Adding additional languages...");

// NOTE: Keep this list in sync with
// the languagesList in src/util/translations.
// Can't import directly because the node script
// doesn't understand @/util import paths.
// For non ISO 639-1 codes (e.g. regional language codes)
// see the standard used by Java
// https://www.oracle.com/java/technologies/javase7locales.html
export const ISO_639_1_LANGUAGES = [
  "ar",
  "bn",
  "da",
  "de",
  "el",
  "en",
  "es",
  "fa",
  "fil",
  "fr",
  "ha",
  "hi",
  "id",
  "it",
  "ja",
  "jv",
  "ko",
  "mr",
  "ms",
  "nb",
  "nl",
  "pa",
  "pl",
  "pt",
  "ro",
  "ru",
  "sv",
  "sw",
  "ta",
  "te",
  "th",
  "tr",
  "uk",
  "ur",
  "vi",
  "zh",
  "zh_TW",
];

if (!process.env?.GOOGLE_TRANSLATE_API_KEY) {
  throw new Error("No GOOGLE_TRANSLATE_API_KEY provided!");
}

const directoryPath = "..";
const filesWithTranslations = findFilesWithTranslations(directoryPath);

if (filesWithTranslations.length === 0) {
  console.log("No files with translations found.");
} else {
  console.log("Files with translations:");
  filesWithTranslations.forEach((filePath) => {
    console.log("Translating: ...", filePath);
    processFile(filePath);
  });
}
