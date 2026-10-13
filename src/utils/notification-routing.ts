import type { NotificationData } from "@/services/notifications.service";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseNotificationData(value: unknown): NotificationData | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const validId = (key: string) =>
    typeof data[key] === "string" && uuid.test(data[key]);
  if (!validId("notificationId") || !validId("recipientId")) return null;
  const required = {
    ORDER_PLACED: "orderId",
    ORDER_DISPATCHED: "orderId",
    ORDER_DELIVERED: "orderId",
    ORDER_CANCELLED: "orderId",
    FRIEND_REQUEST: "requestId",
    FRIEND_ACCEPTED: "friendId",
    REGISTRY_SHARED: "registryId",
    REGISTRY_PURCHASE: "itemId",
  };
  if (
    typeof data.type !== "string" ||
    !Object.hasOwn(required, data.type) ||
    !validId(required[data.type as keyof typeof required])
  )
    return null;
  return {
    notificationId: data.notificationId as string,
    recipientId: data.recipientId as string,
    type: data.type as NotificationData["type"],
    ...Object.fromEntries(
      ["requestId", "friendId", "registryId", "itemId", "orderId"]
        .filter(validId)
        .map((key) => [key, data[key]]),
    ),
  };
}

// Only internal, explicitly supported destinations; never navigate a payload URL.
export function notificationDestination(data: NotificationData) {
  switch (data.type) {
    case "ORDER_PLACED":
    case "ORDER_DISPATCHED":
    case "ORDER_DELIVERED":
    case "ORDER_CANCELLED":
      return {
        pathname: "/orders/[id]" as const,
        params: { id: data.orderId! },
      };
    case "FRIEND_REQUEST":
      return {
        pathname: "/friends/requests/[id]" as const,
        params: { id: data.requestId! },
      };
    case "FRIEND_ACCEPTED":
      return {
        pathname: "/friends/[id]" as const,
        params: { id: data.friendId! },
      };
    case "REGISTRY_SHARED":
      return {
        pathname: "/registry/guest-view" as const,
        params: { id: data.registryId! },
      };
    case "REGISTRY_PURCHASE":
      return {
        pathname: "/registry/item/[id]" as const,
        params: { id: data.itemId! },
      };
  }
}
