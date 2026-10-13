import { queryClient } from "@/api/queryClient";
import { useNotificationSummary } from "@/hooks/useNotifications";
import { markNotificationRead } from "@/services/notifications.service";
import { useGlobalStore } from "@/store";
import { useNotificationNavigation } from "@/store/notifications";
import { getDecodedToken, getUserSub } from "@/utils/helper";
import {
  notificationDestination,
  parseNotificationData,
} from "@/utils/notification-routing";
import { syncPushRegistration } from "@/utils/push-registration";
import * as Notifications from "expo-notifications";
import {
  router,
  usePathname,
  useRootNavigationState,
  useSegments,
} from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppState, Platform } from "react-native";
import Toast from "react-native-toast-message";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = parseNotificationData(notification.request.content.data);
    const belongsToUser =
      !!data &&
      useGlobalStore.getState().isAuthenticated &&
      data.recipientId === getUserSub();
    return {
      shouldShowBanner: belongsToUser,
      shouldShowList: belongsToUser,
      shouldPlaySound: false,
      shouldSetBadge: belongsToUser,
    };
  },
});

export default function NotificationCenter() {
  const authenticated = useGlobalStore.use.isAuthenticated();
  const userId = authenticated ? getUserSub() : "";
  const { pending, setPending } = useNotificationNavigation();
  const navigation = useRootNavigationState();
  const segments = useSegments();
  const pathname = usePathname();
  const protectedScreen = segments[0] === "(protected)";
  const { t, i18n } = useTranslation();
  const summary = useNotificationSummary();
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (Platform.OS === "web") return;
    const capture = (response: Notifications.NotificationResponse | null) => {
      if (
        !response ||
        response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
      )
        return;
      const id = response.notification.request.identifier;
      if (handled.current.has(id)) return;
      handled.current.add(id);
      const data = parseNotificationData(
        response.notification.request.content.data,
      );
      if (data) setPending(data);
      void Notifications.clearLastNotificationResponseAsync();
    };
    const taps = Notifications.addNotificationResponseReceivedListener(capture);
    void Notifications.getLastNotificationResponseAsync().then(capture);
    const received = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["friends"] });
    });
    return () => {
      taps.remove();
      received.remove();
    };
  }, [setPending]);

  useEffect(() => {
    // Wait through login, onboarding and profile completion before navigation.
    if (
      !pending ||
      !navigation?.key ||
      !userId ||
      !protectedScreen ||
      getDecodedToken()?.user?.getUserData
    )
      return;
    setPending(null);
    if (pending.recipientId !== userId) {
      Toast.show({ type: "error", text1: t("notifications.otherAccount") });
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ["friends"] });
    void queryClient.invalidateQueries({ queryKey: ["registryGuestView"] });
    void queryClient.invalidateQueries({
      queryKey: ["registries", "items", pending.itemId],
    });
    if (pending.orderId)
      void queryClient.invalidateQueries({ queryKey: ["orders", userId] });
    router.push(notificationDestination(pending));
    void markNotificationRead(pending.notificationId)
      .then(() =>
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
      )
      .catch(() => undefined);
  }, [pending, navigation?.key, userId, protectedScreen, setPending, t]);

  useEffect(() => {
    if (!userId || Platform.OS === "web" || !protectedScreen) return;
    const sync = () => {
      void syncPushRegistration(pathname === "/" && !pending).catch(() => {
        /* Inbox still works; retry on next foreground or from settings. */
      });
    };
    sync();
    const active = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        sync();
        void queryClient.invalidateQueries({
          queryKey: ["notifications", userId],
        });
      }
    });
    const token = Notifications.addPushTokenListener(() => {
      void syncPushRegistration().catch(() => undefined);
    });
    return () => {
      active.remove();
      token.remove();
    };
  }, [userId, pathname, pending, protectedScreen, i18n.language]);

  useEffect(() => {
    if (Platform.OS !== "web")
      void Notifications.setBadgeCountAsync(
        userId ? (summary.data?.unreadCount ?? 0) : 0,
      ).catch(() => undefined);
  }, [userId, summary.data?.unreadCount]);
  return null;
}
