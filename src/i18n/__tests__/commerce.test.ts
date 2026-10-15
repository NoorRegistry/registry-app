import { createInstance } from "i18next";
import ar from "../locales/ar/translations";
import en from "../locales/en/translations";

it("keeps Arabic cart counts and catalogue counts in Arabic for every plural form", async () => {
  const i18n = createInstance();
  await i18n.init({
    lng: "ar",
    fallbackLng: "en",
    resources: { ar: { translation: ar }, en: { translation: en } },
  });
  for (const count of [0, 1, 2, 3, 11, 100]) {
    expect(i18n.t("cart.itemCount", { count })).not.toMatch(/items?/);
    expect(i18n.t("store.productCount", { count })).not.toMatch(/products?/);
  }
  expect(i18n.t("cart.itemCount", { count: 3 })).toBe("3 منتجات");
  expect(i18n.t("cart.itemCount", { count: 2 })).toBe("منتجان");
});
