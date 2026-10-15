import {
  CommerceText,
  CommerceTopBar,
  MoneyText,
  PriceSummary,
} from "@/components/Commerce";
import { BrandColors } from "@/constants/Colors";
import { useCart, useCartActions } from "@/hooks/useCart";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { CartItem } from "@/services/cart.service";
import { fetchCheckoutQuote } from "@/services/orders.service";
import { getEnArName, getImageUrl, getUserSub } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  I18nManager,
  Pressable,
  RefreshControl,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartSkeleton, {
  CartSummarySkeleton,
  CartTotalSkeleton,
} from "./CartSkeleton";

function CartRow({ item, last }: { item: CartItem; last: boolean }) {
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const actions = useCartActions();
  const compact = width < 370 || fontScale > 1.15;
  const unavailable = item.availability !== "AVAILABLE";
  const quantity = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: BrandColors.line,
        borderRadius: 9,
      }}
    >
      <Pressable
        testID={`cart-decrease-${item.productId}`}
        accessibilityRole="button"
        accessibilityLabel={t(
          item.quantity === 1 ? "cart.remove" : "cart.decrease",
        )}
        disabled={actions.isPending}
        onPress={() =>
          actions.mutate({
            kind: "set",
            productId: item.productId,
            quantity: item.quantity - 1,
          })
        }
        style={{
          width: 36,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={item.quantity === 1 ? "trash-outline" : "remove"}
          size={17}
          color={BrandColors.deep}
        />
      </Pressable>
      <CommerceText
        weight="medium"
        style={{ minWidth: 20, textAlign: "center", writingDirection: "ltr" }}
      >
        {item.quantity}
      </CommerceText>
      <Pressable
        testID={`cart-increase-${item.productId}`}
        accessibilityRole="button"
        accessibilityLabel={t("cart.increase")}
        disabled={
          actions.isPending ||
          item.quantity >= item.availableQuantity ||
          item.quantity >= 99
        }
        onPress={() =>
          actions.mutate({
            kind: "set",
            productId: item.productId,
            quantity: item.quantity + 1,
          })
        }
        style={{
          width: 36,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          opacity:
            actions.isPending ||
            item.quantity >= item.availableQuantity ||
            item.quantity >= 99
              ? 0.35
              : 1,
        }}
      >
        <Ionicons name="add" size={19} color={BrandColors.deep} />
      </Pressable>
    </View>
  );
  return (
    <View
      style={{
        paddingVertical: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: BrandColors.line,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={getEnArName(
            item.product.nameEn,
            item.product.nameAr,
          )}
          onPress={() =>
            router.push({
              pathname: "/products/[id]",
              params: { id: item.productId },
            })
          }
        >
          <Image
            source={
              item.product.images[0]?.path
                ? getImageUrl(item.product.images[0].path)
                : require("@assets/images/icon.png")
            }
            contentFit="cover"
            style={{
              width: 68,
              height: 68,
              borderRadius: 9,
              backgroundColor: BrandColors.soft,
            }}
          />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <CommerceText
            size="xs"
            style={{ color: BrandColors.muted }}
            numberOfLines={1}
          >
            {getEnArName(item.product.store.nameEn, item.product.store.nameAr)}
          </CommerceText>
          <CommerceText weight="medium" numberOfLines={2}>
            {getEnArName(item.product.nameEn, item.product.nameAr)}
          </CommerceText>
          <MoneyText
            amount={item.product.price}
            currency={item.product.currencyCode}
            weight="medium"
            style={{ textAlign: "left" }}
          />
        </View>
        {!compact && !unavailable && quantity}
      </View>
      {(compact || unavailable) && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 10,
          }}
        >
          {unavailable && (
            <CommerceText size="xs" style={{ flex: 1, color: "#B14F4D" }}>
              {t(
                item.availability === "UNAVAILABLE"
                  ? "cart.unavailable"
                  : "cart.onlyAvailable",
                { count: item.availableQuantity },
              )}
            </CommerceText>
          )}
          {quantity}
        </View>
      )}
    </View>
  );
}

export default function CartScreen() {
  const { t } = useTranslation();
  const cart = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const quote = useQuery({
    queryKey: ["cartQuote", getUserSub(), cart.dataUpdatedAt],
    queryFn: fetchCheckoutQuote,
    enabled:
      !!cart.data?.itemCount && !cart.data.hasUnavailableItems && !cart.isError,
    staleTime: 15000,
  });
  useRefreshOnFocus(cart.refetch);
  const ready =
    !!quote.data &&
    !quote.isError &&
    !cart.isFetching &&
    !quote.isFetching &&
    !cart.data?.hasUnavailableItems &&
    !cart.isError;
  const shop = () => router.navigate("/(protected)/(tabs)/shop");
  const summary = !!cart.data?.itemCount && (
    <View style={{ paddingTop: 20, gap: 16 }}>
      <CommerceText size="base" weight="bold">
        {t("cart.summary")}
      </CommerceText>
      {quote.data ? (
        <PriceSummary
          subtotal={quote.data.subtotal}
          deliveryFee={quote.data.deliveryFee}
          total={quote.data.total}
          currency={quote.data.currencyCode}
        />
      ) : quote.isFetching ? (
        <CartSummarySkeleton />
      ) : (
        <>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <CommerceText style={{ color: BrandColors.muted }}>
              {t("cart.subtotal")}
            </CommerceText>
            <MoneyText
              amount={cart.data.subtotal}
              currency={cart.data.currencyCode}
            />
          </View>
          <CommerceText size="xs" style={{ color: "#B14F4D" }}>
            {t(
              cart.data.hasUnavailableItems
                ? "checkout.reviewCart"
                : "cart.quoteError",
            )}
          </CommerceText>
          {!cart.data.hasUnavailableItems && (
            <Pressable
              onPress={() => void quote.refetch()}
              accessibilityRole="button"
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <CommerceText style={{ color: BrandColors.deep }}>
                {t("cart.retry")}
              </CommerceText>
            </Pressable>
          )}
        </>
      )}
      <Pressable
        onPress={shop}
        accessibilityRole="button"
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <CommerceText weight="medium" style={{ color: BrandColors.deep }}>
          {t("orders.keepShopping")}
        </CommerceText>
      </Pressable>
    </View>
  );
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "bottom", "left", "right"]}
    >
      <CommerceTopBar
        title={t("cart.title")}
        count={
          cart.data?.itemCount
            ? t("cart.itemCount", { count: cart.data.itemCount })
            : undefined
        }
        onBack={() => (router.canGoBack() ? router.back() : shop())}
        action={t("cart.addItems")}
        onAction={shop}
      />
      {cart.isPending && cart.fetchStatus !== "paused" ? (
        <CartSkeleton />
      ) : !cart.data ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <CommerceText>{t("cart.loadError")}</CommerceText>
          <Pressable
            accessibilityRole="button"
            onPress={() => void cart.refetch()}
            style={{ padding: 12 }}
          >
            <CommerceText style={{ color: BrandColors.deep }}>
              {t("cart.retry")}
            </CommerceText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          testID="cart-list"
          data={cart.data.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <CartRow item={item} last={index === cart.data.items.length - 1} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              tintColor={BrandColors.primary}
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                try {
                  await cart.refetch();
                } finally {
                  setRefreshing(false);
                }
              }}
            />
          }
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <CommerceText weight="medium">{t("cart.empty")}</CommerceText>
              <Pressable
                onPress={shop}
                accessibilityRole="button"
                style={{ padding: 12 }}
              >
                <CommerceText style={{ color: BrandColors.deep }}>
                  {t("orders.keepShopping")}
                </CommerceText>
              </Pressable>
            </View>
          }
          ListFooterComponent={summary || null}
        />
      )}
      {!!cart.data?.itemCount && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: BrandColors.line,
            paddingHorizontal: 18,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <CommerceText size="xs" style={{ color: BrandColors.muted }}>
              {t("checkout.total")}
            </CommerceText>
            {quote.data ? (
              <MoneyText
                amount={quote.data.total}
                currency={quote.data.currencyCode}
                weight="bold"
                size="base"
                style={{ textAlign: "left" }}
              />
            ) : quote.isFetching ? (
              <CartTotalSkeleton />
            ) : (
              <CommerceText style={{ color: BrandColors.muted }}>
                —
              </CommerceText>
            )}
          </View>
          <Pressable
            testID="cart-checkout"
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready }}
            disabled={!ready}
            onPress={() => router.push("/checkout")}
            style={{
              minHeight: 48,
              maxWidth: "60%",
              paddingHorizontal: 22,
              borderRadius: 11,
              backgroundColor: BrandColors.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              opacity: ready ? 1 : 0.45,
            }}
          >
            <CommerceText
              weight="medium"
              style={{ color: "#fff", flexShrink: 1 }}
            >
              {t("checkout.title")}
            </CommerceText>
            <Ionicons
              name={I18nManager.isRTL ? "arrow-back" : "arrow-forward"}
              size={18}
              color="#fff"
            />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
