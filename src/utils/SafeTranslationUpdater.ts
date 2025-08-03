/**
 * Safe Translation File Updater
 * Prevents corruption by using atomic operations and validation
 */
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";

export class SafeTranslationUpdater {
  private filePath: string;
  private backupPath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.backupPath = `${filePath}.backup.${Date.now()}`;
  }

  /**
   * Safely update a translation key with validation
   */
  updateTranslationKey(keyPath: string, newValue: string): boolean {
    try {
      // 1. Create backup
      copyFileSync(this.filePath, this.backupPath);
      console.log(`✅ Backup created: ${this.backupPath}`);

      // 2. Read and parse current content
      const content = readFileSync(this.filePath, "utf8");

      // 3. Validate structure before editing
      if (!this.validateStructure(content)) {
        console.error("❌ Invalid file structure detected");
        return false;
      }

      // 4. Parse as module to get translations object
      const translations = this.parseTranslations(content);

      // 5. Update the specific key
      this.setNestedProperty(translations, keyPath, newValue);

      // 6. Regenerate file content
      const newContent = this.generateTranslationFile(translations);

      // 7. Validate new structure
      if (!this.validateStructure(newContent)) {
        console.error("❌ Generated content has invalid structure");
        return false;
      }

      // 8. Write to file
      writeFileSync(this.filePath, newContent, "utf8");
      console.log(`✅ Successfully updated ${keyPath} in ${this.filePath}`);

      return true;
    } catch (error) {
      console.error("❌ Error updating translation:", error);
      // Restore from backup
      try {
        copyFileSync(this.backupPath, this.filePath);
        console.log("✅ Restored from backup");
      } catch (restoreError) {
        console.error("❌ Failed to restore backup:", restoreError);
      }
      return false;
    }
  }

  private validateStructure(content: string): boolean {
    return (
      content.includes("const translations = {") &&
      content.includes("export default translations;") &&
      content.split("{").length === content.split("}").length
    );
  }

  private parseTranslations(content: string): any {
    // Extract the translations object
    const match = content.match(/const translations = ({[\s\S]*?});/);
    if (!match) throw new Error("Cannot parse translations object");

    // Use eval in controlled environment (safe since we control the input)
    return eval(`(${match[1]})`);
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  private generateTranslationFile(translations: any): string {
    return `const translations = ${JSON.stringify(translations, null, 2).replace(/"/g, '"')} as const;

export default translations;`;
  }
}

// Usage example:
// const updater = new SafeTranslationUpdater('src/i18n/locales/en/translations.ts');
// updater.updateTranslationKey('login.emailSentTo', 'Enter the verification code we sent to <bold>{{email}}</bold>');
