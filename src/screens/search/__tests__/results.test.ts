import { searchResultRows } from "../results";
import type { GlobalSearchResult, SearchProductResult } from "@/types";

const product = (id: string) =>
  ({ id, kind: "products" }) as SearchProductResult;
const store = { id: "store", kind: "stores" } as GlobalSearchResult;
const person = { id: "person", kind: "people" } as GlobalSearchResult;

it("fills product rows across appended pages without hiding people or stores", () => {
  const firstPage = [product("a"), product("b"), product("c")];
  const rows = searchResultRows(
    [...firstPage, product("d"), product("e"), person, store],
    2,
  );
  expect(rows).toEqual([
    { kind: "product-row", id: "a", products: [product("a"), product("b")] },
    { kind: "product-row", id: "c", products: [product("c"), product("d")] },
    { kind: "product-row", id: "e", products: [product("e")] },
    person,
    store,
  ]);
  expect(firstPage).toHaveLength(3);
});
it("reflows tablet columns and keeps mixed result order", () => {
  expect(
    searchResultRows(
      [product("a"), person, product("b"), product("c"), product("d"), store],
      3,
    ),
  ).toEqual([
    { kind: "product-row", id: "a", products: [product("a")] },
    person,
    {
      kind: "product-row",
      id: "b",
      products: [product("b"), product("c"), product("d")],
    },
    store,
  ]);
  expect(searchResultRows([person, store], 2)).toEqual([person, store]);
  expect(searchResultRows([], 2)).toEqual([]);
});
