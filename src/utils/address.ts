export function kuwaitPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("965")
    ? digits.slice(3)
    : digits;
}
