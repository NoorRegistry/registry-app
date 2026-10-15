import { ListSkeleton } from "@/components/Skeleton/layouts";
import Typography from "@/components/Typography";
import {
  useNotificationInbox,
  useNotificationRead,
} from "@/hooks/useNotifications";
import { FriendsTopBar, palette, styles } from "@/screens/friends/components";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { NotificationItem } from "@/services/notifications.service";
import { useNotificationNavigation } from "@/store/notifications";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const icons = {
  SUPPORT_REPLY: "chatbubble-ellipses-outline",
  SUPPORT_UPDATED: "chatbubble-outline",
  ORDER_PLACED: "receipt-outline",
  ORDER_DISPATCHED: "car-outline",
  ORDER_DELIVERED: "checkmark-circle-outline",
  ORDER_CANCELLED: "close-circle-outline",
  FRIEND_REQUEST: "person-add-outline",
  FRIEND_ACCEPTED: "people-outline",
  REGISTRY_SHARED: "list-outline",
  REGISTRY_PURCHASE: "gift-outline",
} as const;
export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const inbox = useNotificationInbox();
  const read = useNotificationRead();
  const setPending = useNotificationNavigation((state) => state.setPending);
  useRefreshOnFocus(inbox.refetch);
  const rows = inbox.data?.pages.flatMap((page) => page.data) ?? [];
  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 5) * 35)
        .duration(200)
        .reduceMotion(ReduceMotion.System)}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => setPending(item.data)}
        style={{
          flexDirection: "row",
          gap: 13,
          paddingVertical: 17,
          alignItems: "center",
          borderBottomColor: "#F1F0ED",
          borderBottomWidth: index === rows.length - 1 ? 0 : 1,
        }}
      >
        <View
          style={{
            width: 43,
            height: 43,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: item.readAt ? "#F5F3F1" : "#F9E9E0",
          }}
        >
          <Ionicons
            name={icons[item.type]}
            size={21}
            color={item.readAt ? palette.muted : palette.accent}
          />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Typography.Text weight={item.readAt ? "regular" : "medium"}>
            {t(`notifications.events.${item.type}`, {
              name: item.actorName || t("friends.member"),
            })}
          </Typography.Text>
          <Typography.Text size="xs" style={{ color: palette.muted }}>
            {new Date(item.createdAt).toLocaleString(i18n.language, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Typography.Text>
        </View>
        {!item.readAt && (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: palette.accent,
            }}
          />
        )}
      </Pressable>
    </Animated.View>
  );
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar
        title={t("notifications.title")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      >
        {!!rows.some((row) => !row.readAt) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("notifications.readAll")}
            disabled={read.isPending}
            onPress={() =>
              read.mutate(undefined, {
                onError: () =>
                  Toast.show({ type: "error", text1: t("common.error") }),
              })
            }
            style={styles.iconButton}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={23}
              color={palette.ink}
            />
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("notifications.settings")}
          onPress={() => router.push("/notifications/settings")}
          style={styles.iconButton}
        >
          <Ionicons name="options-outline" size={23} color={palette.ink} />
        </Pressable>
      </FriendsTopBar>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 22, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={inbox.isRefetching}
            onRefresh={() => void inbox.refetch()}
          />
        }
        onEndReached={() => {
          if (inbox.hasNextPage && !inbox.isFetchingNextPage)
            void inbox.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          inbox.isFetchingNextPage ? (
            <ActivityIndicator style={{ padding: 20 }} color={palette.accent} />
          ) : inbox.isFetchNextPageError ? (
            <Pressable
              onPress={() => void inbox.fetchNextPage()}
              style={{ padding: 20, alignItems: "center" }}
            >
              <Typography.Text>{t("notifications.retry")}</Typography.Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          inbox.isLoading ? (
            <ListSkeleton kind="notifications" />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <>
                <Typography.Text style={{ color: palette.muted }}>
                  {t(
                    inbox.isError || inbox.fetchStatus === "paused"
                      ? "notifications.loadError"
                      : "notifications.empty",
                  )}
                </Typography.Text>
                {(inbox.isError || inbox.fetchStatus === "paused") && (
                  <Pressable onPress={() => void inbox.refetch()}>
                    <Typography.Text>
                      {t("notifications.retry")}
                    </Typography.Text>
                  </Pressable>
                )}
              </>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
