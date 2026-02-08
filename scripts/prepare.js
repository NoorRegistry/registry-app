#!/usr/bin/env node

const { execSync } = require("node:child_process");

const isCI = process.env.CI === "true";
const isEasBuild = process.env.EAS_BUILD === "true";

if (isCI || isEasBuild) {
  console.log("Skipping Husky setup in CI/EAS.");
  process.exit(0);
}

try {
  execSync("husky", { stdio: "inherit", shell: true });
} catch {
  console.log("Skipping Husky setup because Husky is not installed.");
}
