import { IStoreDetails } from "@/types";
import {
  selectStoreProducts,
  storeSections,
  storeCatalogRows,
} from "../products";
const products: IStoreDetails["products"] = [
  {
    id: "a",
    nameEn: "Baby bottle",
    nameAr: "رضّاعة",
    price: 6,
    qty: 2,
    currencyCode: "KWD",
    images: [],
    productCategories: [
      { category: { id: "feeding", nameEn: "Feeding", nameAr: "التغذية" } },
    ],
  },
  {
    id: "b",
    nameEn: "Bouncer",
    nameAr: "كرسي هزاز",
    price: 24,
    qty: 2,
    currencyCode: "KWD",
    images: [],
    productCategories: [
      { category: { id: "nursery", nameEn: "Nursery", nameAr: "الحضانة" } },
      { category: { id: "feeding", nameEn: "Feeding", nameAr: "التغذية" } },
    ],
  },
];
it("combines category filtering with search in either language", () => {
  expect(
    selectStoreProducts(products, " رضّاعة ", "feeding", "featured", "ar").map(
      (p) => p.id,
    ),
  ).toEqual(["a"]);
  expect(
    selectStoreProducts(products, "BOTTLE", "nursery", "featured", "en"),
  ).toEqual([]);
  expect(
    selectStoreProducts(products, "", "feeding", "featured", "en"),
  ).toHaveLength(2);
});
it("sorts filtered products without reordering the shared cache", () => {
  expect(
    selectStoreProducts(products, "", "", "priceDesc", "en").map((p) => p.id),
  ).toEqual(["b", "a"]);
  expect(products.map((p) => p.id)).toEqual(["a", "b"]);
  expect(
    selectStoreProducts(products, "", "", "priceAsc", "ar").map((p) => p.id),
  ).toEqual(["a", "b"]);
});

it("places each product once in a stable category section and keeps the category rail sticky", () => {
  const sections = storeSections(products, "", "featured", "en");
  expect(sections.map((section) => section.id)).toEqual(["feeding", "nursery"]);
  expect(
    sections.flatMap((section) =>
      section.products.map((product) => product.id),
    ),
  ).toEqual(["a", "b"]);
  const rows = storeCatalogRows(sections);
  expect(rows[2]).toEqual({ kind: "chrome", key: "categories" });
  expect(
    rows.slice(4).map((row) => row.kind === "products" && row.sectionId),
  ).toEqual(["feeding", "nursery"]);
  expect(
    storeSections(products, "كرسي", "featured", "ar").map(
      (section) => section.id,
    ),
  ).toEqual(["nursery"]);
});
