import { queryClient } from "@/api/queryClient";
import i18n from "@/i18n";
import {
  registerPushDevice,
  unregisterPushDevice,
} from "@/services/notifications.service";
import { useGlobalStore } from "@/store";
import { useNotificationNavigation } from "@/store/notifications";
import { clearSessionData, getUserSub } from "@/utils/helper";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import Constants from "expo-constants";
import { randomUUID } from "expo-crypto";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const installationKey = "push-installation-id";
let registration: Promise<void> | undefined;
let loggingOut = false;

async function getPushToken(projectId: string) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Notifications.getExpoPushTokenAsync({ projectId }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Push registration timed out")),
          15000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
export function getInstallationId() {
  let id = getStorageItem(installationKey);
  if (!id) {
    id = randomUUID();
    setStorageItem(installationKey, id);
  }
  return id;
}
export function hasNotificationPermission(
  permission: Notifications.NotificationPermissionsStatus,
) {
  return (
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
export function syncPushRegistration(prompt = false): Promise<void> {
  if (Platform.OS === "web") return Promise.resolve();
  if (loggingOut) return Promise.resolve();
  if (registration)
    return prompt
      ? registration.then(() => syncPushRegistration(true))
      : registration;
  const userId = getUserSub();
  if (!userId) return Promise.resolve();
  registration = (async () => {
    if (Platform.OS === "android")
      await Notifications.setNotificationChannelAsync("activity", {
        name: i18n.t("notifications.activity"),
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    let permission = await Notifications.getPermissionsAsync();
    const promptKey = `push-permission-asked.${userId}`;
    if (
      prompt &&
      !getStorageItem(promptKey) &&
      permission.canAskAgain &&
      !hasNotificationPermission(permission)
    ) {
      setStorageItem(promptKey, "1");
      permission = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
    }
    if (loggingOut || getUserSub() !== userId) return;
    if (!hasNotificationPermission(permission)) {
      await unregisterPushDevice(getInstallationId());
      return;
    }
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    if (!projectId) throw new Error("Missing EAS project ID");
    const token = (await getPushToken(projectId)).data;
    if (loggingOut || getUserSub() !== userId) return;
    await registerPushDevice({
      installationId: getInstallationId(),
      token,
      platform: Platform.OS === "ios" ? "ios" : "android",
      language: i18n.language === "ar" ? "ar" : "en",
    });
  })().finally(() => {
    registration = undefined;
  });
  return registration;
}

export async function logoutWithNotifications() {
  if (loggingOut) return;
  loggingOut = true;
  try {
    // Finish any token refresh first so it cannot re-register after logout.
    await registration?.catch(() => undefined);
    if (Platform.OS !== "web") {
      await unregisterPushDevice(getInstallationId());
      await Notifications.dismissAllNotificationsAsync().catch(() => undefined);
      await Notifications.setBadgeCountAsync(0).catch(() => undefined);
    }
    useNotificationNavigation.getState().setPending(null);
    clearSessionData();
    useGlobalStore.getState().signOut();
    queryClient.clear();
  } finally {
    loggingOut = false;
  }
}
