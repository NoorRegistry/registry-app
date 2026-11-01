// Dates represent a local calendar day, never a device-timezone instant.
export function eventDateValue(value?: string | null): string | null {
  const day = value?.slice(0, 10);
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const parsed = new Date(`${day}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === day
    ? day
    : null;
}
export function formatEventDate(
  value: string | null | undefined,
  language: string,
  year = false,
) {
  const day = eventDateValue(value);
  return day
    ? new Date(`${day}T00:00:00.000Z`).toLocaleDateString(language, {
        day: "numeric",
        month: "long",
        ...(year ? { year: "numeric" } : {}),
        timeZone: "UTC",
      })
    : "";
}
