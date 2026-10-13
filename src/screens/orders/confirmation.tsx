import { BrandColors } from "@/constants/Colors";
import Typography from "@/components/Typography";
import { addressLine } from "@/hooks/useAddresses";
import { fetchOrder } from "@/services/orders.service";
import { formatPrice, getUserFirstName, getUserSub } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import Animated, {
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const order = useQuery({
    queryKey: ["orders", getUserSub(), id],
    queryFn: () => fetchOrder(id),
    staleTime: 10000,
  });
  const data = order.data;
  const scale = useSharedValue(0.7);
  useEffect(() => {
    scale.set(
      withSpring(1, {
        damping: 13,
        stiffness: 160,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [scale]);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "bottom"]}
    >
      <View
        style={{
          paddingHorizontal: 20,
          height: 48,
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
          onPress={() => router.replace("/")}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={23} color="#202421" />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 26,
          paddingBottom: 25,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            alignItems: "center",
            paddingTop: 10,
            paddingBottom: 32,
            gap: 17,
          }}
        >
          <Animated.View
            style={[
              {
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: "#E9F0E6",
                alignItems: "center",
                justifyContent: "center",
              },
              checkStyle,
            ]}
          >
            <Ionicons name="checkmark" size={47} color="#4D7043" />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(300).reduceMotion(
              ReduceMotion.System,
            )}
            style={{ alignItems: "center", gap: 8 }}
          >
            <Typography.Text size="2xl" weight="bold">
              {t("orders.thankYou", { name: getUserFirstName() })}
            </Typography.Text>
            <Typography.Text style={{ color: "#767C77" }}>
              {t("orders.confirmation", { reference: data?.reference ?? "…" })}
            </Typography.Text>
          </Animated.View>
        </View>
        {order.isPending ? (
          <ActivityIndicator color="#C78063" />
        ) : data ? (
          <Animated.View
            entering={FadeInDown.delay(100)
              .duration(300)
              .reduceMotion(ReduceMotion.System)}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 13,
                paddingVertical: 19,
                borderTopWidth: 1,
                borderTopColor: "#EEEDE9",
              }}
            >
              <Ionicons name="location-outline" size={23} color="#C78063" />
              <View style={{ flex: 1, gap: 6 }}>
                <Typography.Text weight="medium">
                  {data.shippingAddress.fullName}
                </Typography.Text>
                <Typography.Text size="sm" style={{ color: "#767C77" }}>
                  {addressLine(data.shippingAddress)}
                </Typography.Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 13,
                paddingVertical: 19,
                borderTopWidth: 1,
                borderTopColor: "#EEEDE9",
              }}
            >
              <Ionicons name="cash-outline" size={23} color="#C78063" />
              <View style={{ flex: 1, gap: 5 }}>
                <Typography.Text weight="medium">
                  {t("checkout.cod")}
                </Typography.Text>
                <Typography.Text size="xs" style={{ color: "#767C77" }}>
                  {t("orders.payOnDelivery")}
                </Typography.Text>
              </View>
              <Typography.Text size="lg" weight="bold">
                {formatPrice(data.total, "KWD")}
              </Typography.Text>
            </View>
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => void order.refetch()}
            style={{ alignItems: "center", padding: 16 }}
          >
            <Typography.Text>{t("notifications.retry")}</Typography.Text>
          </Pressable>
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: 22, paddingVertical: 12, gap: 10 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.replace({ pathname: "/orders/[id]", params: { id } })
          }
          style={{
            minHeight: 52,
            borderRadius: 12,
            backgroundColor: BrandColors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography.Text weight="medium" style={{ color: "#fff" }}>
            {t("orders.viewOrder")}
          </Typography.Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/shop")}
          style={{
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography.Text weight="medium">
            {t("orders.keepShopping")}
          </Typography.Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
