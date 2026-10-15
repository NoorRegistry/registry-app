import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors } from "@/constants/Colors";
import Typography from "@/components/Typography";
import {
  addressLine,
  useAddressChoice,
  useAddresses,
} from "@/hooks/useAddresses";
import { FriendsTopBar, palette, styles } from "@/screens/friends/components";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { fetchCheckoutQuote, placeOrder } from "@/services/orders.service";
import {
  formatPrice,
  getEnArName,
  getImageUrl,
  getUserSub,
} from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export default function CheckoutScreen() {
  const { t } = useTranslation();
  const userId = getUserSub();
  const client = useQueryClient();
  const addresses = useAddresses();
  const choice = useAddressChoice((state) => state.choice);
  const [note, setNote] = useState("");
  const quote = useQuery({
    queryKey: ["checkout", userId],
    queryFn: fetchCheckoutQuote,
    staleTime: 0,
  });
  useRefreshOnFocus(quote.refetch);
  useRefreshOnFocus(addresses.refetch);
  const selected =
    addresses.data?.find(
      (address) => choice?.userId === userId && address.id === choice.id,
    ) ?? addresses.data?.[0];
  const submitKey = useRef({ fingerprint: "", key: randomUUID() });
  const order = useMutation({
    mutationFn: () => {
      if (!selected || !quote.data) throw new Error("Address required");
      const fingerprint = `${quote.data.cartFingerprint}:${selected.id}:${quote.data.total}`;
      if (submitKey.current.fingerprint !== fingerprint)
        submitKey.current = { fingerprint, key: randomUUID() };
      return placeOrder({
        addressId: selected.id,
        idempotencyKey: submitKey.current.key,
        cartFingerprint: quote.data.cartFingerprint,
        expectedTotal: quote.data.total,
        note: note.trim() || undefined,
      });
    },
    onSuccess: async (result) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["cart", userId] }),
        client.invalidateQueries({ queryKey: ["orders", userId] }),
        client.invalidateQueries({ queryKey: ["notifications", userId] }),
      ]);
      router.replace({
        pathname: "/order-confirmation",
        params: { id: result.id },
      });
    },
    onError: (error: { detail?: string }) => {
      Toast.show({
        type: "error",
        text1: error.detail || t("checkout.failed"),
      });
      void quote.refetch();
    },
  });
  const priceRow = (label: string, value: number, bold = false) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 7,
      }}
    >
      <Typography.Text weight={bold ? "medium" : "regular"}>
        {label}
      </Typography.Text>
      <Typography.Text weight={bold ? "bold" : "medium"}>
        {formatPrice(value, "KWD")}
      </Typography.Text>
    </View>
  );
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("checkout.title")} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {quote.isLoading ? (
          <ScreenSkeleton kind="checkout" />
        ) : quote.isError || !quote.data ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 15,
            }}
          >
            <Typography.Text>{t("checkout.reviewCart")}</Typography.Text>
            <Pressable onPress={() => router.replace("/cart")}>
              <Typography.Text style={{ color: palette.accent }}>
                {t("cart.viewCart")}
              </Typography.Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 22,
                paddingBottom: 20,
              }}
            >
              <Typography.Text
                weight="medium"
                style={{ marginTop: 18, marginBottom: 12 }}
              >
                {t("checkout.deliverTo")}
              </Typography.Text>
              <Pressable
                onPress={() =>
                  router.push(
                    selected
                      ? { pathname: "/addresses", params: { select: "1" } }
                      : "/addresses/edit",
                  )
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingBottom: 22,
                  borderBottomWidth: 1,
                  borderBottomColor: "#EEEDE9",
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={23}
                  color={palette.accent}
                />
                <View style={{ flex: 1, gap: 5 }}>
                  <Typography.Text weight="medium">
                    {selected
                      ? t(`addresses.labels.${selected.label}`, {
                          defaultValue: selected.label,
                        })
                      : t("addresses.add")}
                  </Typography.Text>
                  {selected && (
                    <>
                      <Typography.Text
                        size="sm"
                        style={{ color: palette.muted }}
                      >
                        {addressLine(selected)}
                      </Typography.Text>
                      <Typography.Text
                        size="xs"
                        style={{ color: palette.muted }}
                      >
                        {selected.fullName} · {selected.phone}
                      </Typography.Text>
                    </>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={palette.muted}
                />
              </Pressable>
              <Typography.Text weight="medium" style={{ marginVertical: 18 }}>
                {t("checkout.items")}
              </Typography.Text>
              {quote.data.items.map((item, index) => (
                <View
                  key={item.productId}
                  style={{
                    flexDirection: "row",
                    gap: 13,
                    paddingBottom: 15,
                    marginBottom: 15,
                    borderBottomWidth:
                      index === quote.data.items.length - 1 ? 0 : 1,
                    borderBottomColor: "#F0EEEB",
                  }}
                >
                  <Image
                    source={
                      item.image
                        ? getImageUrl(item.image)
                        : require("@assets/images/icon.png")
                    }
                    style={{ width: 58, height: 58, borderRadius: 7 }}
                  />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Typography.Text size="xs" style={{ color: palette.muted }}>
                      {getEnArName(item.storeNameEn, item.storeNameAr)}
                    </Typography.Text>
                    <Typography.Text numberOfLines={2}>
                      {getEnArName(item.nameEn, item.nameAr)}
                    </Typography.Text>
                    <Typography.Text size="xs" style={{ color: palette.muted }}>
                      {item.quantity} × {formatPrice(item.unitPrice, "KWD")}
                    </Typography.Text>
                  </View>
                  <Typography.Text size="sm" weight="medium">
                    {formatPrice(item.total, "KWD")}
                  </Typography.Text>
                </View>
              ))}
              <View
                style={{
                  paddingVertical: 18,
                  borderTopWidth: 1,
                  borderTopColor: "#EEEDE9",
                  gap: 12,
                }}
              >
                <Typography.Text weight="medium">
                  {t("checkout.payment")}
                </Typography.Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons
                    name="cash-outline"
                    size={22}
                    color={palette.accent}
                  />
                  <Typography.Text style={{ flex: 1 }}>
                    {t("checkout.cod")}
                  </Typography.Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color={palette.accent}
                  />
                </View>
              </View>
              <TextInput
                accessibilityLabel={t("checkout.note")}
                placeholder={t("checkout.note")}
                value={note}
                onChangeText={setNote}
                maxLength={250}
                multiline
                style={{
                  minHeight: 48,
                  fontSize: 14,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#EEEDE9",
                  color: palette.ink,
                }}
              />
              <View style={{ paddingTop: 20 }}>
                {priceRow(t("cart.subtotal"), quote.data.subtotal)}
                {priceRow(t("checkout.delivery"), quote.data.deliveryFee)}
                {priceRow(t("checkout.total"), quote.data.total, true)}
              </View>
            </ScrollView>
            <View
              style={{
                paddingHorizontal: 22,
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: "#F0EEEB",
              }}
            >
              <Pressable
                accessibilityRole="button"
                disabled={order.isPending || !selected || quote.isFetching}
                onPress={() => {
                  Keyboard.dismiss();
                  order.mutate();
                }}
                style={{
                  minHeight: 52,
                  borderRadius: 12,
                  backgroundColor: BrandColors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: !selected || quote.isFetching ? 0.5 : 1,
                }}
              >
                {order.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Typography.Text weight="medium" style={{ color: "#fff" }}>
                    {t("checkout.placeOrder")} ·{" "}
                    {formatPrice(quote.data.total, "KWD")}
                  </Typography.Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
