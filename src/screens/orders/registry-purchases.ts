import { Order, OrderItem } from "@/services/orders.service";
import {
  fetchRegistryGuestView,
  fetchRegistryOrderPurchases,
  postRegistryItemPurchase,
} from "@/services/registries.service";
import {
  RegistryGift,
  dismissRegistryOrderGift,
} from "@/utils/registry-purchase-context";

export type OrderRegistryGift = RegistryGift & {
  line: OrderItem;
  quantity: number;
  maxQuantity: number;
  attributedQuantity: number;
  selected: boolean;
  status: "ready" | "saved" | "blocked";
  issue?: "unavailable" | "access" | "quantityChanged" | "save";
  error?: unknown;
};
export const giftKey = (gift: Pick<RegistryGift, "registryId" | "itemId">) =>
  `${gift.registryId}:${gift.itemId}`;

export function orderRegistryGifts(
  order: Order,
  gifts: RegistryGift[],
): OrderRegistryGift[] {
  if (order.status === "CANCELLED") return [];
  const seen = new Set<string>();
  const allocated = new Map<string, number>();
  return gifts.flatMap((gift) => {
    const line = order.items.find((item) => item.productId === gift.productId);
    if (
      !line ||
      seen.has(giftKey(gift)) ||
      !Number.isSafeInteger(gift.quantity) ||
      gift.quantity <= 0
    )
      return [];
    const quantity = Math.min(
      gift.quantity,
      line.quantity - (allocated.get(gift.productId) ?? 0),
    );
    if (quantity <= 0) return [];
    seen.add(giftKey(gift));
    allocated.set(
      gift.productId,
      (allocated.get(gift.productId) ?? 0) + quantity,
    );
    return [
      {
        ...gift,
        line,
        quantity,
        attributedQuantity: quantity,
        maxQuantity: quantity,
        selected: true,
        status: "ready" as const,
      },
    ];
  });
}

// Saved receipts are authoritative, including when a successful POST response
// was lost. Fetch each registry once and isolate access failures to its gifts.
export async function loadOrderRegistryGifts(
  order: Order,
  gifts: RegistryGift[],
  previous: OrderRegistryGift[] = [],
) {
  const rows = orderRegistryGifts(order, gifts);
  if (!rows.length) return rows;
  const receipts = await fetchRegistryOrderPurchases(order.id);
  const saved = new Map(
    receipts.map((receipt) => [
      `${receipt.registryId}:${receipt.registryItemsId}`,
      receipt,
    ]),
  );
  const ids = [
    ...new Set(
      rows
        .filter((row) => !saved.has(giftKey(row)))
        .map((row) => row.registryId),
    ),
  ];
  const requests = await Promise.allSettled(ids.map(fetchRegistryGuestView));
  const registries = new Map(ids.map((id, index) => [id, requests[index]]));
  return rows.map<OrderRegistryGift>((row) => {
    const receipt = saved.get(giftKey(row));
    if (receipt)
      return {
        ...row,
        quantity: receipt.qty,
        selected: false,
        status: "saved",
      };
    const prior = previous.find((entry) => giftKey(entry) === giftKey(row));
    const result = registries.get(row.registryId);
    if (
      !result ||
      result.status === "rejected" ||
      result.value.isOwner !== false
    )
      return { ...row, selected: false, status: "blocked", issue: "access" };
    const registry = result.value;
    const item = registry.registryItems.items
      .flatMap((section) => section.data)
      .find(
        (entry) =>
          entry.id === row.itemId && entry.product.id === row.productId,
      );
    const maxQuantity = Math.min(row.maxQuantity, item?.qtyLeft ?? 0);
    if (maxQuantity <= 0)
      return {
        ...row,
        selected: false,
        maxQuantity: 0,
        status: "blocked",
        issue: "unavailable",
      };
    return {
      ...row,
      registryTitle: registry.title,
      maxQuantity,
      quantity: Math.min(prior?.quantity ?? row.quantity, maxQuantity),
      selected: prior?.selected ?? true,
    };
  });
}

export async function saveOrderRegistryGifts(
  order: Order,
  rows: OrderRegistryGift[],
  name: string,
  email: string,
  userId: string,
) {
  const selected = rows.filter((row) => row.selected && row.status !== "saved");
  const latest = await loadOrderRegistryGifts(
    order,
    rows.map((row) => ({ ...row, quantity: row.attributedQuantity })),
    rows,
  );
  const outcomes = await Promise.all(
    selected.map(async (row): Promise<OrderRegistryGift> => {
      const fresh = latest.find((entry) => giftKey(entry) === giftKey(row))!;
      if (fresh.status === "saved") {
        dismissRegistryOrderGift(userId, order.id, row.itemId);
        return fresh;
      }
      if (fresh.status === "blocked") return fresh;
      if (row.quantity > fresh.maxQuantity)
        return { ...fresh, issue: "quantityChanged" };
      try {
        await postRegistryItemPurchase({
          registryId: row.registryId,
          registryItemsId: row.itemId,
          qty: row.quantity,
          name: name.trim(),
          email: email.trim(),
          platform: "Simplist",
          platformOrderId: order.id,
        });
        dismissRegistryOrderGift(userId, order.id, row.itemId);
        return {
          ...fresh,
          quantity: row.quantity,
          selected: false,
          status: "saved",
        };
      } catch (error) {
        return { ...fresh, quantity: row.quantity, issue: "save", error };
      }
    }),
  );
  const updated = new Map(outcomes.map((row) => [giftKey(row), row]));
  return rows.map((row) => updated.get(giftKey(row)) ?? row);
}
