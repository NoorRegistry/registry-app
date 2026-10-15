import { textFontFamily, textLineHeight } from "../metrics";

it("uses Latin font metrics for quantities and prices inside an Arabic interface", () => {
  expect(textFontFamily("medium", "ar", 3)).toBe("Poppinsmedium");
  expect(textFontFamily("regular", "ar", [2, " × ", "KWD 13.00"])).toBe(
    "Poppinsregular",
  );
  expect(textFontFamily("regular", "ar", "3 منتجات")).toBe("Tajawalregular");
  expect(textFontFamily("regular", "en", "منتجات")).toBe("Tajawalregular");
});
it("respects custom text sizes and explicit leading utilities", () => {
  expect(textLineHeight("sm")).toBe(20);
  expect(textLineHeight("sm", "!text-2xl")).toBe(34);
  expect(textLineHeight("sm", "text-base", 10)).toBe(14);
  expect(textLineHeight("sm", "leading-6")).toBeUndefined();
});
