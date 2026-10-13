import { kuwaitPhoneDigits } from "../address";
it("normalizes pasted Kuwait country codes without truncating a local number", () => {
  expect(kuwaitPhoneDigits("+965 5000 0000")).toBe("50000000");
  expect(kuwaitPhoneDigits("96512345")).toBe("96512345");
  expect(kuwaitPhoneDigits("5000 0000")).toBe("50000000");
});
