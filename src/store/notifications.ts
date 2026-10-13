import { NotificationData } from "@/services/notifications.service";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { parseNotificationData } from "@/utils/notification-routing";
import { create } from "zustand";

const key = "pending-notification";
function restore() {
  try {
    return parseNotificationData(JSON.parse(getStorageItem(key) || "null"));
  } catch {
    return null;
  }
}
export const useNotificationNavigation = create<{
  pending: NotificationData | null;
  setPending: (data: NotificationData | null) => void;
}>((set) => ({
  pending: restore(),
  setPending: (data) => {
    setStorageItem(key, data ? JSON.stringify(data) : null);
    set({ pending: data });
  },
}));
