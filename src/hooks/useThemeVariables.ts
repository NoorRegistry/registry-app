/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { vars } from "nativewind";
import { useColorScheme } from "react-native";

export const themes = {
  light: vars({
    "--color-white": "#ffffff",
    "--color-black": "#111827",
    "--color-dark-bg": "#121223",
    "--color-background": "#FEFDFD",
    "--color-background-dark": "#F5F5F5",
    "--color-neutral-50": "#f9fafb",
    "--color-neutral-100": "#f3f4f6",
    "--color-neutral-200": "#e5e7eb",
    "--color-neutral-300": "#d1d5db",
    "--color-neutral-400": "#9ca3af",
    "--color-neutral-500": "#6b7280",
    "--color-neutral-600": "#4b5563",
    "--color-neutral-700": "#374151",
    "--color-neutral-800": "#1f2937",
    "--color-neutral-900": "#111827",
    "--color-primary-50": "#e0f2f0",
    "--color-primary-100": "#b2ded9",
    "--color-primary-200": "#7fcac1",
    "--color-primary-300": "#4db4a7",
    "--color-primary-400": "#26a495",
    "--color-primary-500": "#009483",
    "--color-primary-600": "#008776",
    "--color-primary-700": "#007766",
    "--color-primary-800": "#006758",
    "--color-primary-900": "#004b3c",
    "--color-danger": "#e11d48",
    "--color-success": "#047857",
    "--color-warning": "#e9971e",
    "--color-complementary": "#b8450b",
  }),
  dark: vars({
    "--color-white": "#ffffff",
    "--color-black": "#111827",
    "--color-dark-bg": "#121223",
    "--color-background": "#FEFDFD",
    "--color-background-dark": "#F5F5F5",
    "--color-neutral-50": "#f9fafb",
    "--color-neutral-100": "#f3f4f6",
    "--color-neutral-200": "#e5e7eb",
    "--color-neutral-300": "#d1d5db",
    "--color-neutral-400": "#9ca3af",
    "--color-neutral-500": "#6b7280",
    "--color-neutral-600": "#4b5563",
    "--color-neutral-700": "#374151",
    "--color-neutral-800": "#1f2937",
    "--color-neutral-900": "#111827",
    "--color-primary-50": "#e0f2f0",
    "--color-primary-100": "#b2ded9",
    "--color-primary-200": "#7fcac1",
    "--color-primary-300": "#4db4a7",
    "--color-primary-400": "#26a495",
    "--color-primary-500": "#009483",
    "--color-primary-600": "#008776",
    "--color-primary-700": "#007766",
    "--color-primary-800": "#006758",
    "--color-primary-900": "#004b3c",
    "--color-danger": "#e11d48",
    "--color-success": "#047857",
    "--color-warning": "#e9971e",
    "--color-complementary": "#b8450b",
  }),
};

export function useThemeVariables() {
  const colorScheme = useColorScheme() ?? "light";

  const themeVariables = themes[colorScheme];

  return themeVariables;
}
