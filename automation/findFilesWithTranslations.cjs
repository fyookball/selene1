const fs = require("fs");
const path = require("path");

function findFilesWithTranslations(directoryPath) {
  const filesWithTranslations = [];

  function checkFile(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.startsWith("const translations =")) {
      filesWithTranslations.push(filePath);
    }
  }

  function checkDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        checkDirectory(fullPath);
      } else if (
        stat.isFile() &&
        (file.endsWith(".js") || file.endsWith(".jsx"))
      ) {
        checkFile(fullPath);
      }
    }
  }

  checkDirectory(directoryPath);

  // Hack to only check one file
  // return [
  //   "./src/components/views/explore/chronology/translations.js"
  // ]

  return filesWithTranslations;
}

module.exports = findFilesWithTranslations;
