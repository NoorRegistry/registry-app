import {
  CommerceText,
  CommerceTopBar,
  MoneyText,
  PriceSummary,
} from "@/components/Commerce";
import { BrandColors } from "@/constants/Colors";
import { addressLine } from "@/hooks/useAddresses";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { fetchOrder } from "@/services/orders.service";
import {
  formatPrice,
  getEnArName,
  getImageUrl,
  getUserSub,
} from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OrderProgress from "./Progress";

export default function OrderDetailScreen() {
  const { id, placed } = useLocalSearchParams<{
    id: string;
    placed?: string;
  }>();
  const { t, i18n } = useTranslation();
  const order = useQuery({
    queryKey: ["orders", getUserSub(), id],
    queryFn: () => fetchOrder(id),
    staleTime: 10000,
  });
  useRefreshOnFocus(order.refetch);
  const data = order.data;
  const cancelled = data?.status === "CANCELLED";
  const delivered = data?.status === "DELIVERED";
  const date = data
    ? new Date(data.createdAt).toLocaleString(i18n.language, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
  const back = () =>
    placed
      ? router.replace("/")
      : router.canGoBack()
        ? router.back()
        : router.replace("/orders");
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "bottom", "left", "right"]}
    >
      <CommerceTopBar
        title={t("orders.details")}
        onBack={back}
        action={t("profile.help")}
        onAction={() => router.push("/help")}
      />
      {order.isPending && order.fetchStatus !== "paused" ? (
        <ActivityIndicator style={{ flex: 1 }} color={BrandColors.primary} />
      ) : !data ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 15,
          }}
        >
          <CommerceText>
            {t(
              order.isError || order.fetchStatus === "paused"
                ? "orders.loadFailed"
                : "orders.unavailable",
            )}
          </CommerceText>
          <Pressable
            accessibilityRole="button"
            testID="order-retry"
            onPress={() => void order.refetch()}
            style={{ padding: 12 }}
          >
            <CommerceText style={{ color: BrandColors.deep }}>
              {t("notifications.retry")}
            </CommerceText>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          testID="order-details-content"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              tintColor={BrandColors.primary}
              refreshing={order.isRefetching}
              onRefresh={() => void order.refetch()}
            />
          }
        >
          <View
            style={{
              backgroundColor: cancelled ? "#FCF1F0" : BrandColors.soft,
              paddingHorizontal: 20,
              paddingVertical: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 18,
            }}
          >
            {data.status === "DISPATCHED" ? (
              <Feather name="truck" size={42} color={BrandColors.deep} />
            ) : (
              <Ionicons
                name={
                  cancelled
                    ? "close-circle-outline"
                    : delivered
                      ? "checkmark-circle-outline"
                      : "cube-outline"
                }
                size={42}
                color={cancelled ? "#B14F4D" : BrandColors.deep}
              />
            )}
            <View style={{ flex: 1, gap: 4 }}>
              <CommerceText
                size="xl"
                weight="bold"
                style={{ color: cancelled ? "#B14F4D" : BrandColors.deep }}
              >
                {t(`orders.status.${data.status}`)}
              </CommerceText>
              <CommerceText
                size="sm"
                style={{ color: BrandColors.muted, writingDirection: "ltr" }}
              >
                {data.reference}
              </CommerceText>
              <CommerceText size="xs" style={{ color: BrandColors.muted }}>
                {date}
              </CommerceText>
            </View>
          </View>
          <View style={{ paddingHorizontal: 18 }}>
            <OrderProgress status={data.status} />
            <CommerceText
              size="base"
              weight="bold"
              style={{ marginTop: 16, marginBottom: 6 }}
            >
              {t("checkout.items")} ·{" "}
              {data.items.reduce((count, item) => count + item.quantity, 0)}
            </CommerceText>
            {data.items.map((item, index) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",
                  paddingVertical: 14,
                  borderBottomWidth: index === data.items.length - 1 ? 0 : 1,
                  borderBottomColor: BrandColors.line,
                }}
              >
                <Image
                  source={
                    item.image
                      ? getImageUrl(item.image)
                      : require("@assets/images/icon.png")
                  }
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 8,
                    backgroundColor: BrandColors.soft,
                  }}
                  contentFit="cover"
                />
                <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
                  <CommerceText weight="medium" numberOfLines={2}>
                    {getEnArName(item.nameEn, item.nameAr)}
                  </CommerceText>
                  <CommerceText
                    size="xs"
                    style={{
                      color: BrandColors.muted,
                      writingDirection: "ltr",
                    }}
                  >
                    {item.quantity} ×{" "}
                    {formatPrice(item.unitPrice, data.currencyCode)}
                  </CommerceText>
                </View>
                <MoneyText
                  amount={item.total}
                  currency={data.currencyCode}
                  size="sm"
                  weight="medium"
                />
              </View>
            ))}
            <View
              style={{
                paddingVertical: 18,
                borderTopWidth: 1,
                borderTopColor: BrandColors.line,
                marginTop: 8,
                gap: 12,
              }}
            >
              <CommerceText weight="bold" size="base">
                {t("checkout.deliverTo")}
              </CommerceText>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Ionicons
                  name="location-outline"
                  size={23}
                  color={BrandColors.muted}
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <CommerceText weight="medium">
                    {data.shippingAddress.fullName}
                  </CommerceText>
                  <CommerceText
                    size="sm"
                    style={{ color: BrandColors.muted, lineHeight: 21 }}
                  >
                    {addressLine(data.shippingAddress)}
                  </CommerceText>
                  <CommerceText
                    size="xs"
                    style={{
                      color: BrandColors.muted,
                      writingDirection: "ltr",
                    }}
                  >
                    {"\u2066" + (data.shippingAddress.phone ?? "") + "\u2069"}
                  </CommerceText>
                </View>
              </View>
            </View>
            <View
              style={{
                paddingTop: 18,
                borderTopWidth: 1,
                borderTopColor: BrandColors.line,
                gap: 14,
              }}
            >
              <CommerceText weight="bold" size="base">
                {t("checkout.payment")}
              </CommerceText>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Ionicons
                  name="cash-outline"
                  size={22}
                  color={BrandColors.muted}
                />
                <CommerceText style={{ flex: 1 }}>
                  {t("checkout.cod")}
                </CommerceText>
                <View
                  style={{
                    backgroundColor: cancelled
                      ? "#FCF1F0"
                      : data.paymentStatus === "PAID"
                        ? "#EEF5EF"
                        : "#FFF3E1",
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    borderRadius: 8,
                    maxWidth: "45%",
                  }}
                >
                  <CommerceText
                    size="xs"
                    style={{
                      color: cancelled
                        ? "#B14F4D"
                        : data.paymentStatus === "PAID"
                          ? "#39734F"
                          : "#9B601B",
                    }}
                  >
                    {t(
                      cancelled
                        ? "orders.status.CANCELLED"
                        : data.paymentStatus === "PAID"
                          ? "orders.paid"
                          : "orders.unpaid",
                    )}
                  </CommerceText>
                </View>
              </View>
              <PriceSummary
                subtotal={data.subtotal}
                deliveryFee={data.deliveryFee}
                total={data.total}
                currency={data.currencyCode}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
