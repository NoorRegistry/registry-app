import { Order } from "@/services/orders.service";
import {
  fetchRegistryGuestView,
  fetchRegistryOrderPurchases,
  postRegistryItemPurchase,
} from "@/services/registries.service";
import { dismissRegistryOrderGift } from "@/utils/registry-purchase-context";
import {
  loadOrderRegistryGifts,
  orderRegistryGifts,
  saveOrderRegistryGifts,
} from "../registry-purchases";
jest.mock("@/services/registries.service", () => ({
  fetchRegistryGuestView: jest.fn(),
  fetchRegistryOrderPurchases: jest.fn(),
  postRegistryItemPurchase: jest.fn(),
}));
jest.mock("@/utils/registry-purchase-context", () => ({
  dismissRegistryOrderGift: jest.fn(),
}));
const gifts = [
  {
    registryId: "lina",
    registryTitle: "Lina",
    itemId: "mattress",
    productId: "product-a",
    quantity: 2,
  },
  {
    registryId: "noor",
    registryTitle: "Noor",
    itemId: "coffee",
    productId: "product-b",
    quantity: 1,
  },
];
const order = {
  id: "order",
  status: "PENDING",
  items: [
    { productId: "product-a", quantity: 2 },
    { productId: "product-b", quantity: 1 },
    { productId: "personal", quantity: 4 },
  ],
} as Order;
const registry = (id: string, quantity = 3) => ({
  id,
  isOwner: false,
  title: id,
  registryItems: {
    items: [
      {
        data: [
          {
            id: id === "lina" ? "mattress" : "coffee",
            product: { id: id === "lina" ? "product-a" : "product-b" },
            qtyLeft: quantity,
          },
        ],
      },
    ],
  },
});
beforeEach(() => {
  jest.clearAllMocks();
  (fetchRegistryOrderPurchases as jest.Mock).mockResolvedValue([]);
  (fetchRegistryGuestView as jest.Mock).mockImplementation(async (id) =>
    registry(id),
  );
  (postRegistryItemPurchase as jest.Mock).mockResolvedValue({ id: "purchase" });
});
it("includes only attributed gifts, caps ordered quantities and deduplicates exact registry items", () => {
  expect(
    orderRegistryGifts(order, [...gifts, gifts[0]]).map((row) => row.itemId),
  ).toEqual(["mattress", "coffee"]);
  expect(orderRegistryGifts({ ...order, status: "CANCELLED" }, gifts)).toEqual(
    [],
  );
  expect(
    orderRegistryGifts(order, [{ ...gifts[0], quantity: 100 }])[0].quantity,
  ).toBe(2);
});
it("loads each registry once, clamps current availability and blocks owner previews", async () => {
  (fetchRegistryGuestView as jest.Mock).mockImplementation(async (id) =>
    id === "noor" ? { ...registry(id), isOwner: true } : registry(id, 1),
  );
  const rows = await loadOrderRegistryGifts(order, gifts);
  expect(rows[0]).toMatchObject({
    quantity: 1,
    maxQuantity: 1,
    status: "ready",
  });
  expect(rows[1]).toMatchObject({
    selected: false,
    status: "blocked",
    issue: "access",
  });
  expect(fetchRegistryGuestView).toHaveBeenCalledTimes(2);
});
it("records both registries independently and never sends normal purchases", async () => {
  const rows = await loadOrderRegistryGifts(order, gifts);
  const result = await saveOrderRegistryGifts(
    order,
    rows,
    " Guest ",
    " guest@example.invalid ",
    "user",
  );
  expect(result.every((row) => row.status === "saved")).toBe(true);
  expect(postRegistryItemPurchase).toHaveBeenCalledTimes(2);
  expect(postRegistryItemPurchase).toHaveBeenCalledWith(
    expect.objectContaining({
      registryId: "lina",
      registryItemsId: "mattress",
      qty: 2,
      name: "Guest",
      email: "guest@example.invalid",
      platform: "Simplist",
      platformOrderId: "order",
    }),
  );
  expect(dismissRegistryOrderGift).toHaveBeenCalledTimes(2);
});
it("keeps the successful gift saved and retries only the failed gift", async () => {
  const rows = await loadOrderRegistryGifts(order, gifts);
  (postRegistryItemPurchase as jest.Mock).mockImplementation(
    async (payload) => {
      if (payload.registryId === "noor") throw new Error("Offline");
      return {};
    },
  );
  const first = await saveOrderRegistryGifts(
    order,
    rows,
    "Guest",
    "guest@example.invalid",
    "user",
  );
  expect(first[0].status).toBe("saved");
  expect(first[1].issue).toBe("save");
  (fetchRegistryOrderPurchases as jest.Mock).mockResolvedValue([
    { registryId: "lina", registryItemsId: "mattress", qty: 2 },
  ]);
  (postRegistryItemPurchase as jest.Mock).mockResolvedValue({});
  const second = await saveOrderRegistryGifts(
    order,
    first,
    "Guest",
    "guest@example.invalid",
    "user",
  );
  expect(second.every((row) => row.status === "saved")).toBe(true);
  expect(
    (postRegistryItemPurchase as jest.Mock).mock.calls.map(
      ([payload]) => payload.registryId,
    ),
  ).toEqual(["lina", "noor", "noor"]);
});
it("recovers a committed purchase after a lost response without issuing another POST", async () => {
  const rows = await loadOrderRegistryGifts(order, gifts);
  rows[1].selected = false;
  (fetchRegistryOrderPurchases as jest.Mock).mockResolvedValue([
    { registryId: "lina", registryItemsId: "mattress", qty: 2 },
  ]);
  const result = await saveOrderRegistryGifts(
    order,
    rows,
    "Guest",
    "guest@example.invalid",
    "user",
  );
  expect(result[0].status).toBe("saved");
  expect(result[1].status).toBe("ready");
  expect(postRegistryItemPurchase).not.toHaveBeenCalled();
});
it("requires a new confirmation when availability falls, instead of silently saving a smaller quantity", async () => {
  const rows = await loadOrderRegistryGifts(order, gifts);
  rows[1].selected = false;
  (fetchRegistryGuestView as jest.Mock).mockImplementation(async (id) =>
    registry(id, 1),
  );
  const result = await saveOrderRegistryGifts(
    order,
    rows,
    "Guest",
    "guest@example.invalid",
    "user",
  );
  expect(result[0]).toMatchObject({
    quantity: 1,
    maxQuantity: 1,
    issue: "quantityChanged",
    status: "ready",
  });
  expect(postRegistryItemPurchase).not.toHaveBeenCalled();
});
it("isolates revoked registry access so the other selected gift can still save", async () => {
  const rows = await loadOrderRegistryGifts(order, gifts);
  (fetchRegistryGuestView as jest.Mock).mockImplementation(async (id) => {
    if (id === "noor") throw new Error("Forbidden");
    return registry(id);
  });
  const result = await saveOrderRegistryGifts(
    order,
    rows,
    "Guest",
    "guest@example.invalid",
    "user",
  );
  expect(result[0].status).toBe("saved");
  expect(result[1]).toMatchObject({ status: "blocked", issue: "access" });
  expect(postRegistryItemPurchase).toHaveBeenCalledTimes(1);
});
