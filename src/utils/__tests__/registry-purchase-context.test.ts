import {
  dismissRegistryOrderGift,
  forgetCartGift,
  recordRegistryOrder,
  registryOrderGifts,
  rememberRegistryGift,
} from "../registry-purchase-context";
import { getStorageItem, setStorageItem } from "../storage";
import { Order } from "@/services/orders.service";
jest.mock("../storage", () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
}));
let storage: Map<string, string>;
const gift = {
  registryId: "registry",
  registryTitle: "Baby",
  itemId: "item",
  productId: "product",
  quantity: 1,
};
const order = (id = "order", quantity = 1, productId = "product") =>
  ({ id, items: [{ productId, quantity }] }) as Order;
beforeEach(() => {
  storage = new Map();
  jest.clearAllMocks();
  (getStorageItem as jest.Mock).mockImplementation((key: string) =>
    storage.get(key),
  );
  (setStorageItem as jest.Mock).mockImplementation(
    (key: string, value: string) => storage.set(key, value),
  );
});
it("does not prompt for ordinary orders or items not in the completed order", () => {
  recordRegistryOrder("user", order());
  expect(registryOrderGifts("user", "order")).toEqual([]);
  rememberRegistryGift("user", gift);
  recordRegistryOrder("user", order("other-order", 1, "another-product"));
  expect(registryOrderGifts("user", "other-order")).toEqual([]);
});
it("retains the registry and exact item, and caps quantity to actual order units", () => {
  rememberRegistryGift("user", gift);
  rememberRegistryGift("user", gift);
  recordRegistryOrder("user", order("order", 1));
  expect(registryOrderGifts("user", "order")).toEqual([
    { ...gift, quantity: 1 },
  ]);
  expect(registryOrderGifts("another-user", "order")).toEqual([]);
});
it("does not assign unrelated extra units to the gift registry", () => {
  rememberRegistryGift("user", gift);
  recordRegistryOrder("user", order("order", 4));
  expect(registryOrderGifts("user", "order")[0].quantity).toBe(1);
});
it("clears removed cart items and never reuses an old order's attribution", () => {
  rememberRegistryGift("user", gift);
  forgetCartGift("user", gift.productId);
  recordRegistryOrder("user", order());
  expect(registryOrderGifts("user", "order")).toEqual([]);
  rememberRegistryGift("user", gift);
  recordRegistryOrder("user", order("gift-order"));
  recordRegistryOrder("user", order("later-order"));
  expect(registryOrderGifts("user", "later-order")).toEqual([]);
});
it("uses the latest selected registry when a product exists on two registries", () => {
  rememberRegistryGift("user", gift);
  rememberRegistryGift("user", {
    ...gift,
    registryId: "second",
    itemId: "second-item",
  });
  recordRegistryOrder("user", order());
  expect(registryOrderGifts("user", "order")).toEqual([
    { ...gift, registryId: "second", itemId: "second-item" },
  ]);
});
it("handles multi-gift orders, confirmation, Not now and idempotent order retries", () => {
  rememberRegistryGift("user", gift);
  rememberRegistryGift("user", {
    ...gift,
    itemId: "second-item",
    productId: "second-product",
  });
  const both = {
    id: "order",
    items: [
      { productId: "product", quantity: 1 },
      { productId: "second-product", quantity: 2 },
    ],
  } as Order;
  recordRegistryOrder("user", both);
  recordRegistryOrder("user", both);
  expect(registryOrderGifts("user", "order")).toHaveLength(2);
  dismissRegistryOrderGift("user", "order", "item");
  expect(registryOrderGifts("user", "order")).toHaveLength(1);
  dismissRegistryOrderGift("user", "order");
  recordRegistryOrder("user", both);
  expect(registryOrderGifts("user", "order")).toEqual([]);
});
it("recovers from missing or malformed local data", () => {
  storage.set("registry-gifts-user", "bad json");
  expect(registryOrderGifts("user", "order")).toEqual([]);
});
it("does not interrupt a successful checkout when local reminder storage is unavailable", () => {
  (setStorageItem as jest.Mock).mockImplementation(() => {
    throw new Error("Unavailable");
  });
  expect(() => recordRegistryOrder("user", order())).not.toThrow();
});
