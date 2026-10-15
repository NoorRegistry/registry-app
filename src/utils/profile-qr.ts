// A public profile code only: no phone, email, login token or private registry data.
export function normalizeProfileCode(value: string): string | null {
  const compact = value.trim().toUpperCase().replace(/[\s-]/g, "");
  return /^SS[0-9A-F]{8}$/.test(compact)
    ? `SS-${compact.slice(2, 6)}-${compact.slice(6)}`
    : null;
}
export function profileQrValue(code: string) {
  const normalized = normalizeProfileCode(code);
  if (!normalized) throw new Error("Invalid profile code");
  return `shiftgiftme:///friends/code/${normalized}`;
}
export function parseProfileQr(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 160) return null;
  const direct = normalizeProfileCode(value);
  if (direct) return direct;
  // Accept only our exact app route. Never execute or open arbitrary scanned URLs.
  const match =
    /^shiftgiftme:\/\/\/friends\/code\/(SS-[0-9a-f]{4}-[0-9a-f]{4})\/?$/i.exec(
      value.trim(),
    );
  return match ? normalizeProfileCode(match[1]) : null;
}
