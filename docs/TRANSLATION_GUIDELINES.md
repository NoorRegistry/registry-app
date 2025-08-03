/\*\*

- Translation File Management Best Practices
-
- NEVER AGAIN: Avoiding Translation File Corruption
-
- 1.  ALWAYS use unique context boundaries with at least 3-5 lines before/after
- 2.  NEVER use partial string matches
- 3.  ALWAYS validate file structure after edits
- 4.  CREATE backups before making changes
- 5.  USE atomic operations (single large replacement vs multiple small ones)
      \*/

// ❌ WRONG WAY - These patterns cause corruption:
/_
oldString: 'login: "Login",' // Too generic, matches multiple locations
oldString: 'emailSentTo: "Enter' // Partial match, causes truncation
oldString: ' resend: "Resend",' // Whitespace sensitive, fragile
_/

// ✅ CORRECT WAY - Use unique boundaries:
/\*
oldString: `  login: {
    loginToAccount: "Login to Your Account",
    orLoginWith: "Or login with",
    login: "Login",
    confirmationCode: "Verification code",
    emailSentTo:
      "Enter the verification code we sent to <Important>{{email}}</Important>",
    didNotGetCode: "Didn't receive the code?",`

newString: `  login: {
    loginToAccount: "Login to Your Account", 
    orLoginWith: "Or login with",
    login: "Login",
    confirmationCode: "Verification code",
    emailSentTo:
      "Enter the verification code we sent to <bold>{{email}}</bold>",
    didNotGetCode: "Didn't receive the code?",`
\*/

// 🔧 PREVENTION STRATEGY:
// 1. Always read the entire file first to understand structure
// 2. Use grep_search to verify unique match before replacing
// 3. Create backups before making changes
// 4. Validate syntax after edits

export const TRANSLATION_BEST_PRACTICES = {
// Use this helper to ensure unique context
validateUniqueMatch: (content: string, searchString: string): boolean => {
const matches = content.split(searchString).length - 1;
return matches === 1;
},

// Create backup before editing
createBackup: (filePath: string): string => {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
return `${filePath}.${timestamp}.backup`;
},

// Validate translation file structure
validateStructure: (content: string): boolean => {
return (
content.includes('const translations = {') &&
content.includes('export default translations;') &&
content.split('{').length === content.split('}').length
);
}
};

// 🚨 CORRUPTION INDICATORS:
// - Duplicate const declarations
// - Mismatched brackets
// - Partial object structures
// - Missing export statements
// - Syntax errors in IDE
