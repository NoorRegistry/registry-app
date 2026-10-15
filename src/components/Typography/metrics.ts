import { isValidElement, ReactNode } from "react";

const arabicScript =
  /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;
function plainText(value: ReactNode): string | null {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (value == null || typeof value === "boolean") return "";
  if (Array.isArray(value)) {
    const parts = value.map(plainText);
    return parts.some((part) => part === null) ? null : parts.join("");
  }
  if (
    isValidElement<{ children?: ReactNode }>(value) &&
    value.props.children !== undefined
  )
    return plainText(value.props.children);
  return null;
}

export function textFontFamily(
  weight: string,
  language: string,
  children: ReactNode,
) {
  const text = plainText(children);
  const arabic = text === null ? language !== "en" : arabicScript.test(text);
  // Latin names, prices and standalone numbers retain the English font's metrics.
  return arabic
    ? `Tajawal${weight}`
    : `Poppins${weight === "extralight" ? "light" : weight}`;
}

const sizes: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
};
export function textLineHeight(
  size: string,
  className?: string,
  fontSize?: number,
) {
  if (/(?:^|\s)!?leading-/.test(className ?? "")) return undefined;
  const overrides = Array.from(
    (className ?? "").matchAll(
      /(?:^|\s)!?text-(xs|sm|base|lg|xl|2xl|3xl|4xl|\[\d+(?:px)?\])(?=\s|$)/g,
    ),
  );
  const named = overrides.at(-1)?.[1];
  const value =
    fontSize ??
    (named
      ? (sizes[named] ?? Number(named.replace(/[\[\]px]/g, "")))
      : sizes[size]);
  return Math.ceil((value ?? 14) * 1.4);
}
