# Translation File Corruption Prevention

## ❌ NEVER DO THIS (Causes Corruption):

```typescript
// DON'T: Multiple small replacements
replace_string_in_file({
  oldString: 'login: "Login"', // Too generic
  newString: 'login: "Sign In"',
});

// DON'T: Partial matches
replace_string_in_file({
  oldString: 'emailSentTo: "Enter the verification', // Incomplete
  newString: 'emailSentTo: "Please enter the verification',
});
```

## ✅ ALWAYS DO THIS (Prevents Corruption):

```typescript
// DO: Single atomic replacement with unique context
replace_string_in_file({
  oldString: `const translations = {
  login: {
    loginToAccount: "Login to Your Account",
    orLoginWith: "Or login with", 
    login: "Login",
    confirmationCode: "Verification code",
    emailSentTo:
      "Enter the verification code we sent to <Important>{{email}}</Important>",
    didNotGetCode: "Didn't receive the code?",
    resend: "Resend",`,

  newString: `const translations = {
  login: {
    loginToAccount: "Login to Your Account",
    orLoginWith: "Or login with",
    login: "Login", 
    confirmationCode: "Verification code",
    emailSentTo:
      "Enter the verification code we sent to <bold>{{email}}</bold>",
    didNotGetCode: "Didn't receive the code?",
    resend: "Resend",`,
});
```

## 🛡️ Safety Checklist:

1. **Before editing**: Create backup
2. **Before replacing**: Use `grep_search` to verify unique match
3. **Use unique context**: Include 5+ lines before/after target
4. **After editing**: Validate syntax with TypeScript compiler
5. **Test immediately**: Verify app still works

## 🔧 Recovery Commands:

```bash
# Create backup
cp src/i18n/locales/en/translations.ts src/i18n/locales/en/translations.ts.backup

# Validate syntax
npx tsc --noEmit src/i18n/locales/en/translations.ts

# Restore from backup if corrupted
cp src/i18n/locales/en/translations.ts.backup src/i18n/locales/en/translations.ts
```
