// https://docs.expo.dev/guides/using-eslint/
/* eslint-env node */
module.exports = {
  extends: ["expo", "prettier", "plugin:@tanstack/query/recommended"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
};
