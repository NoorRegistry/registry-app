import Typography from "@/components/Typography";
import { addressLine } from "@/hooks/useAddresses";
import { FriendsTopBar, palette, styles } from "@/screens/friends/components";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { fetchOrder } from "@/services/orders.service";
import {
  formatPrice,
  getEnArName,
  getImageUrl,
  getUserSub,
} from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function OrderDetailScreen() {
  const { id, placed } = useLocalSearchParams<{
    id: string;
    placed?: string;
  }>();
  const { t } = useTranslation();
  const order = useQuery({
    queryKey: ["orders", getUserSub(), id],
    queryFn: () => fetchOrder(id),
    staleTime: 10000,
  });
  useRefreshOnFocus(order.refetch);
  const data = order.data;
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar
        title={data?.reference ?? t("orders.title")}
        onBack={() =>
          placed
            ? router.replace("/")
            : router.canGoBack()
              ? router.back()
              : router.replace("/orders")
        }
      />
      {order.isPending && order.fetchStatus !== "paused" ? (
        <ActivityIndicator style={{ flex: 1 }} color={palette.accent} />
      ) : !data ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 15,
          }}
        >
          <Typography.Text>
            {t(
              order.isError || order.fetchStatus === "paused"
                ? "orders.loadFailed"
                : "orders.unavailable",
            )}
          </Typography.Text>
          <Pressable
            accessibilityRole="button"
            testID="order-retry"
            onPress={() => void order.refetch()}
          >
            <Typography.Text>{t("notifications.retry")}</Typography.Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 28 }}
        >
          <View style={{ paddingVertical: 25, gap: 10 }}>
            <Ionicons
              name={
                data.status === "CANCELLED"
                  ? "close-circle-outline"
                  : data.status === "DELIVERED"
                    ? "checkmark-circle-outline"
                    : "cube-outline"
              }
              size={34}
              color={
                data.status === "CANCELLED" ? palette.danger : palette.accent
              }
            />
            <Typography.Text size="xl" weight="medium">
              {t(`orders.status.${data.status}`)}
            </Typography.Text>
            <Typography.Text size="xs" style={{ color: palette.muted }}>
              {new Date(data.createdAt).toLocaleString()}
            </Typography.Text>
          </View>
          {data.items.map((item) => (
            <View
              key={item.id}
              style={{ flexDirection: "row", gap: 12, paddingVertical: 13 }}
            >
              <Image
                source={
                  item.image
                    ? getImageUrl(item.image)
                    : require("@assets/images/icon.png")
                }
                style={{ width: 56, height: 56, borderRadius: 7 }}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Typography.Text>
                  {getEnArName(item.nameEn, item.nameAr)}
                </Typography.Text>
                <Typography.Text size="xs" style={{ color: palette.muted }}>
                  {item.quantity} × {formatPrice(item.unitPrice, "KWD")}
                </Typography.Text>
              </View>
              <Typography.Text weight="medium">
                {formatPrice(item.total, "KWD")}
              </Typography.Text>
            </View>
          ))}
          <View
            style={{
              paddingVertical: 18,
              gap: 8,
              borderTopWidth: 1,
              borderTopColor: "#EEEDE9",
              marginTop: 14,
            }}
          >
            <Typography.Text weight="medium">
              {t("checkout.deliverTo")}
            </Typography.Text>
            <Typography.Text>{data.shippingAddress.fullName}</Typography.Text>
            <Typography.Text size="sm" style={{ color: palette.muted }}>
              {addressLine(data.shippingAddress)}
            </Typography.Text>
            <Typography.Text size="sm" style={{ color: palette.muted }}>
              {data.shippingAddress.phone}
            </Typography.Text>
          </View>
          <View
            style={{
              paddingVertical: 18,
              gap: 9,
              borderTopWidth: 1,
              borderTopColor: "#EEEDE9",
            }}
          >
            {[
              [t("cart.subtotal"), data.subtotal],
              [t("checkout.delivery"), data.deliveryFee],
              [t("checkout.total"), data.total],
            ].map(([label, amount]) => (
              <View
                key={String(label)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography.Text>{label}</Typography.Text>
                <Typography.Text weight="medium">
                  {formatPrice(Number(amount), "KWD")}
                </Typography.Text>
              </View>
            ))}
            <Typography.Text
              size="xs"
              style={{ color: palette.muted, marginTop: 7 }}
            >
              {t(
                data.status === "CANCELLED"
                  ? "orders.status.CANCELLED"
                  : data.paymentStatus === "PAID"
                    ? "orders.paid"
                    : "checkout.cod",
              )}
            </Typography.Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
