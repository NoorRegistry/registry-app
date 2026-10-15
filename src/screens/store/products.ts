import { IStoreDetails } from "@/types";
export type StoreSort = "featured" | "priceAsc" | "priceDesc" | "name";
export function selectStoreProducts(
  products: IStoreDetails["products"],
  query: string,
  categoryId: string,
  sort: StoreSort,
  language: string,
) {
  const search = query.trim().toLocaleLowerCase().normalize("NFKC");
  const matches = products.filter(
    (product) =>
      (!categoryId ||
        product.productCategories?.some(
          ({ category }) => category.id === categoryId,
        )) &&
      (!search ||
        `${product.nameEn} ${product.nameAr}`
          .toLocaleLowerCase()
          .normalize("NFKC")
          .includes(search)),
  );
  if (sort === "priceAsc") matches.sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") matches.sort((a, b) => b.price - a.price);
  if (sort === "name")
    matches.sort((a, b) =>
      (language === "ar" ? a.nameAr : a.nameEn).localeCompare(
        language === "ar" ? b.nameAr : b.nameEn,
        language,
      ),
    );
  return matches;
}

export type StoreSection = {
  id: string;
  nameEn: string;
  nameAr: string;
  products: IStoreDetails["products"];
};
export type StoreCatalogRow =
  | { kind: "chrome"; key: "identity" | "search" | "categories" | "results" }
  | {
      kind: "products";
      key: string;
      sectionId: string;
      products: IStoreDetails["products"];
    }
  | { kind: "empty"; key: string };

export function storeSections(
  products: IStoreDetails["products"],
  search: string,
  sort: StoreSort,
  language: string,
): StoreSection[] {
  const groups = new Map<string, StoreSection>();
  for (const product of products) {
    // A product has one catalogue position, even when assigned to multiple categories.
    const category = product.productCategories?.[0]?.category ?? {
      id: "other",
      nameEn: "Other",
      nameAr: "أخرى",
    };
    if (!groups.has(category.id))
      groups.set(category.id, { ...category, products: [] });
    groups.get(category.id)!.products.push(product);
  }
  return Array.from(groups.values())
    .map((section) => ({
      ...section,
      products: selectStoreProducts(
        section.products,
        search,
        "",
        sort,
        language,
      ),
    }))
    .filter((section) => section.products.length > 0);
}
export function storeCatalogRows(sections: StoreSection[]): StoreCatalogRow[] {
  const rows: StoreCatalogRow[] = [
    "identity",
    "search",
    "categories",
    "results",
  ].map((key) => ({
    kind: "chrome",
    key: key as "identity" | "search" | "categories" | "results",
  }));
  for (const section of sections) {
    for (let index = 0; index < section.products.length; index += 2)
      rows.push({
        kind: "products",
        key: `row-${section.id}-${section.products[index].id}`,
        sectionId: section.id,
        products: section.products.slice(index, index + 2),
      });
  }
  if (!sections.length) rows.push({ kind: "empty", key: "empty" });
  return rows;
}
