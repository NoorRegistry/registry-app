import { IRegistryDetails, TProductCard } from "@/types";

export type RegistryFilter = "all" | "unpurchased" | "purchased";
export type RegistrySort = "default" | "name" | "priceAsc" | "priceDesc";
export type RegistryRow = {
  id: string;
  product: TProductCard;
  category: { id: string; nameEn: string; nameAr: string };
  qty: number;
  qtyLeft: number;
  purchasedQty: number;
};

// Merge partial purchases into one All row; each quantity filter still includes it.
export function registryRows(registry: IRegistryDetails): RegistryRow[] {
  const rows = new Map<string, RegistryRow>();
  for (const section of registry.registryItems.items) {
    for (const item of section.data) {
      rows.set(item.id, {
        ...item,
        category: {
          id: section.id,
          nameEn: section.nameEn,
          nameAr: section.nameAr,
        },
        qtyLeft: Math.max(0, item.qtyLeft),
        purchasedQty: Math.max(0, item.qty - item.qtyLeft),
      });
    }
  }
  for (const section of registry.purchased?.items ?? []) {
    for (const item of section.data) {
      const existing = rows.get(item.id);
      if (existing)
        existing.purchasedQty = Math.max(existing.purchasedQty, item.qty);
      else
        rows.set(item.id, {
          ...item,
          category: {
            id: section.id,
            nameEn: section.nameEn,
            nameAr: section.nameAr,
          },
          qtyLeft: 0,
          purchasedQty: item.qty,
        });
    }
  }
  return [...rows.values()];
}

export function filterRegistryRows(
  rows: RegistryRow[],
  filter: RegistryFilter,
  categoryId: string,
  sort: RegistrySort,
  language: string,
) {
  const result = rows.filter(
    (row) =>
      (!categoryId || row.category.id === categoryId) &&
      (filter === "all" ||
        (filter === "unpurchased" ? row.qtyLeft > 0 : row.purchasedQty > 0)),
  );
  if (sort === "priceAsc")
    result.sort((a, b) => a.product.price - b.product.price);
  if (sort === "priceDesc")
    result.sort((a, b) => b.product.price - a.product.price);
  if (sort === "name")
    result.sort((a, b) =>
      (language.startsWith("ar")
        ? a.product.nameAr
        : a.product.nameEn
      ).localeCompare(
        language.startsWith("ar") ? b.product.nameAr : b.product.nameEn,
        language,
      ),
    );
  return result;
}
