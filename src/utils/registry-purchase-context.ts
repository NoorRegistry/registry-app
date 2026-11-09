import { Order } from "@/services/orders.service";
import { getStorageItem, setStorageItem } from "./storage";

export type RegistryGift = {
  registryId: string;
  registryTitle: string;
  itemId: string;
  productId: string;
  quantity: number;
};
type PurchaseContext = {
  cart: RegistryGift[];
  orders: Record<string, RegistryGift[]>;
};
const key = (userId: string) => `registry-gifts-${userId}`;
function read(userId: string): PurchaseContext {
  try {
    const data = JSON.parse(getStorageItem(key(userId)) || "null");
    if (Array.isArray(data?.cart) && data?.orders) return data;
  } catch {}
  return { cart: [], orders: {} };
}
function write(userId: string, context: PurchaseContext) {
  // A local reminder must never block a successful checkout or cart mutation.
  try {
    if (userId) setStorageItem(key(userId), JSON.stringify(context));
  } catch {}
}

// Only successful registry-origin cart additions create attribution. The same
// product can belong to one registry in this cart; the latest selection wins.
export function rememberRegistryGift(userId: string, gift: RegistryGift) {
  const context = read(userId);
  const previous = context.cart.find(
    (entry) => entry.productId === gift.productId,
  );
  context.cart = context.cart.filter(
    (entry) => entry.productId !== gift.productId,
  );
  context.cart.push({
    ...gift,
    quantity:
      gift.quantity +
      (previous?.itemId === gift.itemId &&
      previous.registryId === gift.registryId
        ? previous.quantity
        : 0),
  });
  write(userId, context);
}
export function forgetCartGift(userId: string, productId: string) {
  const context = read(userId);
  context.cart = context.cart.filter((gift) => gift.productId !== productId);
  write(userId, context);
}
export function recordRegistryOrder(userId: string, order: Order) {
  const context = read(userId);
  // Retrying an idempotent order must not erase or duplicate its prompt.
  if (!(order.id in context.orders)) {
    context.orders[order.id] = context.cart.flatMap((gift) => {
      const line = order.items.find(
        (item) => item.productId === gift.productId,
      );
      return line
        ? [{ ...gift, quantity: Math.min(gift.quantity, line.quantity) }]
        : [];
    });
  }
  context.cart = [];
  // Bound locally retained order history.
  context.orders = Object.fromEntries(
    Object.entries(context.orders).slice(-20),
  );
  write(userId, context);
}
export function registryOrderGifts(userId: string, orderId: string) {
  return read(userId).orders[orderId] ?? [];
}
export function dismissRegistryOrderGift(
  userId: string,
  orderId: string,
  itemId?: string,
) {
  const context = read(userId);
  context.orders[orderId] = itemId
    ? (context.orders[orderId] ?? []).filter((gift) => gift.itemId !== itemId)
    : [];
  write(userId, context);
}
