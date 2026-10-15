import { http } from "@/api/http";

export type NotificationType =
  | "SUPPORT_REPLY"
  | "SUPPORT_UPDATED"
  | "ORDER_PLACED"
  | "ORDER_DISPATCHED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "REGISTRY_SHARED"
  | "REGISTRY_PURCHASE";
export type NotificationData = {
  notificationId: string;
  recipientId: string;
  type: NotificationType;
  requestId?: string;
  friendId?: string;
  registryId?: string;
  itemId?: string;
  orderId?: string;
  supportRequestId?: string;
};
export type NotificationItem = {
  id: string;
  type: NotificationType;
  actorName: string;
  createdAt: string;
  readAt: string | null;
  data: NotificationData;
};
export type NotificationSummary = {
  unreadCount: number;
  activityEnabled: boolean;
  language: "en" | "ar";
};
const base = "/v1/api/users/notifications";
export const fetchNotifications = (cursor?: string, signal?: AbortSignal) =>
  http.get<{ data: NotificationItem[]; nextCursor: string | null }>(base, {
    params: { cursor, limit: 20 },
    signal,
  });
export const fetchNotificationSummary = () =>
  http.get<NotificationSummary>(`${base}/summary`);
export const markNotificationRead = (id: string) =>
  http.post(`${base}/${id}/read`);
export const markAllNotificationsRead = () => http.post(`${base}/read-all`);
export const updateNotificationSettings = (settings: {
  activityEnabled?: boolean;
  language?: "en" | "ar";
}) => http.patch<NotificationSummary>(`${base}/settings`, settings);
export const registerPushDevice = (body: {
  installationId: string;
  token: string;
  platform: "ios" | "android";
  language: "en" | "ar";
}) => http.put(`${base}/devices`, body, { timeout: 10000 });
export const unregisterPushDevice = (installationId: string) =>
  http.delete(`${base}/devices/${installationId}`, { timeout: 10000 });
