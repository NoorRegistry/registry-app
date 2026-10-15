import {
  notificationDestination,
  parseNotificationData,
} from "../notification-routing";

const id = "00000000-0000-4000-8000-000000000001";
const base = { notificationId: id, recipientId: id };
it.each([
  ["SUPPORT_REPLY", "supportRequestId", "/help/[id]"],
  ["SUPPORT_UPDATED", "supportRequestId", "/help/[id]"],
  ["FRIEND_REQUEST", "requestId", "/friends/requests/[id]"],
  ["FRIEND_ACCEPTED", "friendId", "/friends/[id]"],
  ["REGISTRY_SHARED", "registryId", "/registry/guest-view"],
  ["REGISTRY_PURCHASE", "itemId", "/registry/item/[id]"],
  ...[
    "ORDER_PLACED",
    "ORDER_DISPATCHED",
    "ORDER_DELIVERED",
    "ORDER_CANCELLED",
  ].map((type) => [type, "orderId", "/orders/[id]"]),
])("routes %s using its own stable resource ID", (type, key, path) => {
  const parsed = parseNotificationData({ ...base, type, [key]: id });
  expect(parsed).not.toBeNull();
  expect(notificationDestination(parsed!)).toMatchObject({
    pathname: path,
    params: { id },
  });
});
it.each([
  null,
  { ...base, type: "SUPPORT_REPLY", supportRequestId: "/admin" },
  {},
  { ...base, type: "FRIEND_REQUEST" },
  { ...base, type: "FRIEND_REQUEST", requestId: "/admin" },
  { ...base, type: "https://example.com" },
  { ...base, type: "constructor", requestId: id },
  { ...base, recipientId: "invalid", type: "FRIEND_ACCEPTED", friendId: id },
])("rejects malformed or unsupported notification payloads", (value) => {
  expect(parseNotificationData(value)).toBeNull();
});
it("ignores arbitrary URLs and extra fields", () => {
  const parsed = parseNotificationData({
    ...base,
    type: "FRIEND_REQUEST",
    requestId: id,
    url: "https://example.com",
  });
  expect(parsed).not.toHaveProperty("url");
});
it("opens the purchased item without opening the mark-purchase form", () => {
  const parsed = parseNotificationData({
    ...base,
    type: "REGISTRY_PURCHASE",
    itemId: id,
  });
  expect(notificationDestination(parsed!).params).not.toHaveProperty(
    "purchased",
  );
});
