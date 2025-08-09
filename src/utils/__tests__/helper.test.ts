import { formatPrice } from "../helper";

describe("formatPrice", () => {
  it("formats using default currency (KWD)", () => {
    expect(formatPrice(10)).toBe("KWD\u00A010.00");
  });

  it("formats using a specified currency (USD)", () => {
    expect(formatPrice(10, "USD")).toBe("$10.00");
  });

  it("falls back to a plain string when the currency code is invalid", () => {
    expect(formatPrice(10, "INVALID")).toBe("INVALID 10.00");
  });
});
