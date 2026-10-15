import type { GlobalSearchResult, SearchProductResult } from "@/types";

export type SearchResultRow =
  | { kind: "product-row"; id: string; products: SearchProductResult[] }
  | Exclude<GlobalSearchResult, SearchProductResult>;

// Chunk the combined pages, so products stay in a grid even at page boundaries.
export function searchResultRows(
  results: GlobalSearchResult[],
  columns: number,
): SearchResultRow[] {
  const rows: SearchResultRow[] = [];
  for (const result of results) {
    if (result.kind !== "products") {
      rows.push(result);
      continue;
    }
    const last = rows.at(-1);
    if (last?.kind === "product-row" && last.products.length < columns) {
      last.products.push(result);
    } else {
      rows.push({ kind: "product-row", id: result.id, products: [result] });
    }
  }
  return rows;
}
