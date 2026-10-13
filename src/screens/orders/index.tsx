import Typography from "@/components/Typography";
import { FriendsTopBar, palette, styles } from "@/screens/friends/components";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { fetchOrders } from "@/services/orders.service";
import { formatPrice, getUserSub } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function OrdersScreen() {
  const { t } = useTranslation();
  const orders = useInfiniteQuery({
    queryKey: ["orders", getUserSub(), "list"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchOrders(pageParam),
    getNextPageParam: (page) =>
      page.page < page.totalPages ? page.page + 1 : undefined,
    staleTime: 10000,
  });
  useRefreshOnFocus(orders.refetch);
  const rows = orders.data?.pages.flatMap((page) => page.data) ?? [];
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("orders.title")} />
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 22, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={orders.isRefetching}
            onRefresh={() => void orders.refetch()}
          />
        }
        onEndReached={() => {
          if (orders.hasNextPage && !orders.isFetchingNextPage)
            void orders.fetchNextPage();
        }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/orders/[id]", params: { id: item.id } })
            }
            style={{
              paddingVertical: 18,
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              borderBottomWidth: index === rows.length - 1 ? 0 : 1,
              borderBottomColor: "#F0EEEB",
            }}
          >
            <Ionicons name="cube-outline" size={25} color={palette.accent} />
            <View style={{ flex: 1, gap: 5 }}>
              <Typography.Text weight="medium">
                {item.reference}
              </Typography.Text>
              <Typography.Text size="xs" style={{ color: palette.muted }}>
                {t(`orders.status.${item.status}`)} ·{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </Typography.Text>
            </View>
            <Typography.Text weight="medium">
              {formatPrice(item.total, "KWD")}
            </Typography.Text>
            <Ionicons name="chevron-forward" size={17} color={palette.muted} />
          </Pressable>
        )}
        ListFooterComponent={
          orders.isFetchingNextPage ? (
            <ActivityIndicator color={palette.accent} />
          ) : null
        }
        ListEmptyComponent={
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            {orders.isPending ? (
              <ActivityIndicator color={palette.accent} />
            ) : orders.isError ? (
              <Pressable onPress={() => void orders.refetch()}>
                <Typography.Text>{t("notifications.retry")}</Typography.Text>
              </Pressable>
            ) : (
              <Typography.Text style={{ color: palette.muted }}>
                {t("orders.empty")}
              </Typography.Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
