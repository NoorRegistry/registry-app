import { IRegistryDetails } from "@/types";
import { filterRegistryRows, registryRows } from "../items";

const product = (name: string, price: number) => ({
  id: name,
  nameEn: name,
  nameAr: name,
  price,
  currencyCode: "KWD",
  images: [],
  qty: 10,
});
const registry = {
  registryItems: {
    items: [
      {
        id: "nursery",
        nameEn: "Nursery",
        nameAr: "غرفة الطفل",
        data: [
          { id: "partial", product: product("Crib", 89), qty: 3, qtyLeft: 2 },
          { id: "new", product: product("Bouncer", 24), qty: 1, qtyLeft: 1 },
        ],
      },
    ],
  },
  purchased: {
    items: [
      {
        id: "nursery",
        nameEn: "Nursery",
        nameAr: "غرفة الطفل",
        data: [{ id: "partial", product: product("Crib", 89), qty: 1 }],
      },
      {
        id: "feeding",
        nameEn: "Feeding",
        nameAr: "التغذية",
        data: [{ id: "done", product: product("Bottles", 6), qty: 2 }],
      },
    ],
  },
} as unknown as IRegistryDetails;

it("shows partially purchased items once and retains requested and remaining quantities", () => {
  const rows = registryRows(registry);
  expect(rows.map(({ id }) => id)).toEqual(["partial", "new", "done"]);
  expect(rows[0]).toMatchObject({ qty: 3, qtyLeft: 2, purchasedQty: 1 });
  expect(rows[2]).toMatchObject({
    qty: 2,
    qtyLeft: 0,
    purchasedQty: 2,
    category: { id: "feeding" },
  });
});

it("supports both purchase filters, including partially purchased items in each", () => {
  const rows = registryRows(registry);
  expect(
    filterRegistryRows(rows, "unpurchased", "", "default", "en").map(
      ({ id }) => id,
    ),
  ).toEqual(["partial", "new"]);
  expect(
    filterRegistryRows(rows, "purchased", "", "default", "en").map(
      ({ id }) => id,
    ),
  ).toEqual(["partial", "done"]);
  expect(
    filterRegistryRows(rows, "all", "feeding", "default", "ar").map(
      ({ id }) => id,
    ),
  ).toEqual(["done"]);
});

it("sorts filtered rows without mutating the original registry data", () => {
  const rows = registryRows(registry);
  expect(
    filterRegistryRows(rows, "all", "", "priceAsc", "en").map(({ id }) => id),
  ).toEqual(["done", "new", "partial"]);
  expect(
    filterRegistryRows(rows, "all", "", "priceDesc", "en").map(({ id }) => id),
  ).toEqual(["partial", "new", "done"]);
  expect(rows.map(({ id }) => id)).toEqual(["partial", "new", "done"]);
  expect(
    registryRows({
      ...registry,
      registryItems: { items: [] },
      purchased: { items: [] },
    }),
  ).toEqual([]);
});
