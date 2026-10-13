import { getStorageItem } from "../storage";
import { formatPrice, getInitials, isAuthenticated } from "../helper";
jest.mock("../storage", () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
}));

describe("getInitials", () => {
  it("returns the first and last name initials", () => {
    expect(getInitials("Ashram", "Patwari", "ashram@example.com")).toBe("AP");
  });

  it("handles a customer with only one name", () => {
    expect(getInitials("  Ashram  ", null, "ashram@example.com")).toBe("A");
  });

  it("falls back to the email initial when names are unavailable", () => {
    expect(getInitials(null, null, " customer@example.com")).toBe("C");
  });

  it("returns a placeholder when no customer identity is available", () => {
    expect(getInitials()).toBe("?");
  });
});

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

describe("isAuthenticated", () => {
  const token = (offsetSeconds: number) =>
    `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + offsetSeconds }))}.signature`;

  it("keeps an expired access-token session available when refresh remains valid", () => {
    (getStorageItem as jest.Mock).mockReturnValue(
      JSON.stringify({ accessToken: token(-3600), refreshToken: token(3600) }),
    );
    expect(isAuthenticated()).toBe(true);
  });

  it("rejects a session when both tokens have expired", () => {
    (getStorageItem as jest.Mock).mockReturnValue(
      JSON.stringify({ accessToken: token(-3600), refreshToken: token(-3600) }),
    );
    expect(isAuthenticated()).toBe(false);
  });

  it("handles corrupt stored sessions without crashing startup", () => {
    (getStorageItem as jest.Mock).mockReturnValue("invalid-json");
    expect(isAuthenticated()).toBe(false);
  });
});
