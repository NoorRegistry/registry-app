import {
  normalizeProfileCode,
  parseProfileQr,
  profileQrValue,
} from "../profile-qr";
it("encodes a stable profile code without personal information", () => {
  const value = profileQrValue("ss1234abcd");
  expect(value).toBe("shiftgiftme:///friends/code/SS-1234-ABCD");
  expect(parseProfileQr(value)).toBe("SS-1234-ABCD");
  expect(normalizeProfileCode(" ss-1234-abcd ")).toBe("SS-1234-ABCD");
});
it.each([
  "https://evil.example/friends/code/SS-1234-ABCD",
  "javascript:alert(1)",
  "shiftgiftme:///orders/SS-1234-ABCD",
  "shiftgiftme:///friends/code/SS-1234-ABCD?send=true",
  "shiftgiftme://evil/friends/code/SS-1234-ABCD",
  "shiftgiftme:///friends/code/SS-1234-ABCD/../../admin",
  "SS-invalid",
  "x".repeat(200),
  null,
  {},
])("rejects unrelated or malformed scanned content %s", (value) => {
  expect(parseProfileQr(value)).toBeNull();
});
it("also accepts a manually entered code and never produces a link for invalid codes", () => {
  expect(parseProfileQr("SS-1234-ABCD")).toBe("SS-1234-ABCD");
  expect(() => profileQrValue("bad")).toThrow();
});
