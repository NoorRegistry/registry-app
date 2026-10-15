import { Skeleton, SkeletonBlock } from "@/components/Skeleton";
import Typography from "@/components/Typography";
import {
  useNotificationSettings,
  useNotificationSummary,
} from "@/hooks/useNotifications";
import { FriendsTopBar, palette, styles } from "@/screens/friends/components";
import {
  hasNotificationPermission,
  syncPushRegistration,
} from "@/utils/push-registration";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Platform,
  Pressable,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const summary = useNotificationSummary();
  const update = useNotificationSettings();
  const refetchSummary = summary.refetch;
  const [permission, setPermission] = useState<boolean>();
  const [registrationError, setRegistrationError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const refresh = useCallback(async () => {
    if (Platform.OS === "web") {
      setPermission(false);
      return;
    }
    setPermission(
      hasNotificationPermission(await Notifications.getPermissionsAsync()),
    );
  }, []);
  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refetchSummary();
      const active = AppState.addEventListener("change", (state) => {
        if (state === "active") void refresh();
      });
      return () => active.remove();
    }, [refresh, refetchSummary]),
  );
  const retry = async () => {
    setSyncing(true);
    try {
      await syncPushRegistration(true);
      setRegistrationError(false);
      await refresh();
    } catch {
      setRegistrationError(true);
    } finally {
      setSyncing(false);
    }
  };
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("notifications.settings")} />
      <View style={{ paddingHorizontal: 22 }}>
        <View
          style={{
            minHeight: 72,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F0ED",
          }}
        >
          <Typography.Text>{t("notifications.activity")}</Typography.Text>
          {summary.isLoading ? (
            <Skeleton style={{ width: 46 }}>
              <SkeletonBlock style={{ height: 28, borderRadius: 14 }} />
            </Skeleton>
          ) : (
            <Switch
              accessibilityLabel={t("notifications.activity")}
              value={
                update.variables?.activityEnabled !== undefined &&
                update.isPending
                  ? update.variables.activityEnabled
                  : (summary.data?.activityEnabled ?? false)
              }
              disabled={!summary.data || update.isPending}
              trackColor={{ true: palette.accent }}
              onValueChange={(activityEnabled) =>
                update.mutate(
                  { activityEnabled },
                  {
                    onError: () =>
                      Toast.show({ type: "error", text1: t("common.error") }),
                  },
                )
              }
            />
          )}
        </View>
        {(summary.isError || summary.fetchStatus === "paused") && (
          <Pressable
            onPress={() => void summary.refetch()}
            style={{ paddingVertical: 14 }}
          >
            <Typography.Text type="danger">
              {t("notifications.retry")}
            </Typography.Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={() => void Linking.openSettings()}
          style={{
            minHeight: 72,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Typography.Text style={{ flex: 1 }}>
            {t("notifications.devicePermission")}
          </Typography.Text>
          <Typography.Text size="sm" style={{ color: palette.muted }}>
            {permission === undefined
              ? "…"
              : t(
                  permission
                    ? "notifications.enabled"
                    : "notifications.disabled",
                )}
          </Typography.Text>
          <Ionicons name="open-outline" size={17} color={palette.muted} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={syncing}
          onPress={() => void retry()}
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          {syncing ? (
            <ActivityIndicator color={palette.accent} />
          ) : (
            <Typography.Text
              style={{
                color: registrationError ? palette.danger : palette.accent,
              }}
            >
              {t(
                registrationError
                  ? "notifications.registrationError"
                  : "notifications.refreshConnection",
              )}
            </Typography.Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
