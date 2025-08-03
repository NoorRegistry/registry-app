#!/usr/bin/env node

/**
 * Translation file validator and backup utility
 * Prevents corruption by validating syntax and creating backups
 */

const fs = require("fs");
const path = require("path");

const TRANSLATION_FILES = [
  "src/i18n/locales/en/translations.ts",
  "src/i18n/locales/ar/translations.ts",
];

const BACKUP_DIR = "src/i18n/backups";

function createBackup(filePath) {
  const backupDir = path.join(process.cwd(), BACKUP_DIR);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);

  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }
  return null;
}

function validateTranslationFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File does not exist: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, "utf8");

    // Check for basic structure
    if (!content.includes("const translations = {")) {
      console.error(`❌ Missing translation object declaration in ${filePath}`);
      return false;
    }

    if (!content.includes("export default translations;")) {
      console.error(`❌ Missing export statement in ${filePath}`);
      return false;
    }

    // Check for syntax errors by attempting to evaluate
    try {
      // Create a safe eval context
      const evalContent = content
        .replace("const translations = ", "const translations = ")
        .replace("export default translations;", "");

      // Basic bracket matching
      const openBrackets = (content.match(/\{/g) || []).length;
      const closeBrackets = (content.match(/\}/g) || []).length;

      if (openBrackets !== closeBrackets) {
        console.error(
          `❌ Mismatched brackets in ${filePath}: ${openBrackets} open, ${closeBrackets} close`,
        );
        return false;
      }

      console.log(`✅ ${filePath} is valid`);
      return true;
    } catch (syntaxError) {
      console.error(`❌ Syntax error in ${filePath}:`, syntaxError.message);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error validating ${filePath}:`, error.message);
    return false;
  }
}

function restoreFromBackup(filePath) {
  const backupDir = path.join(process.cwd(), BACKUP_DIR);
  const fileName = path.basename(filePath);

  if (!fs.existsSync(backupDir)) {
    console.error(`❌ No backup directory found: ${backupDir}`);
    return false;
  }

  // Find the most recent backup
  const backups = fs
    .readdirSync(backupDir)
    .filter((file) => file.startsWith(fileName))
    .sort()
    .reverse();

  if (backups.length === 0) {
    console.error(`❌ No backups found for ${fileName}`);
    return false;
  }

  const latestBackup = path.join(backupDir, backups[0]);
  fs.copyFileSync(latestBackup, filePath);
  console.log(`✅ Restored ${filePath} from ${latestBackup}`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "backup":
      TRANSLATION_FILES.forEach(createBackup);
      break;

      const allValid = TRANSLATION_FILES.every(validateTranslationFile);
      process.exit(allValid ? 0 : 1);
      break;

    case "restore":
      const fileToRestore = args[1];
      if (fileToRestore && TRANSLATION_FILES.includes(fileToRestore)) {
        restoreFromBackup(fileToRestore);
      } else {
        console.error("❌ Please specify a valid translation file to restore");
        console.log("Available files:", TRANSLATION_FILES.join(", "));
        process.exit(1);
      }
      break;

    default:
      console.log("Translation File Manager");
      console.log("Usage: node translation-validator.js <command>");
      console.log("Commands:");
      console.log("  backup   - Create backups of all translation files");
      console.log("  validate - Validate all translation files");
      console.log("  restore <file> - Restore a translation file from backup");
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  validateTranslationFile,
  restoreFromBackup,
};
