import { BrandColors } from "@/constants/Colors";
import Typography from "@/components/Typography";
import { useCart, useCartActions } from "@/hooks/useCart";
import { CartItem } from "@/services/cart.service";
import { formatPrice, getEnArName, getImageUrl } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
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

const ink = "#202421";
const muted = "#777D79";
const line = "#ECEEEB";

function CartRow({ item, last }: { item: CartItem; last: boolean }) {
  const { t } = useTranslation();
  const actions = useCartActions();
  const busy = actions.isPending;
  const image = item.product.images[0]?.path;

  return (
    <View
      style={{
        paddingVertical: 18,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: line,
      }}
    >
      <View style={{ flexDirection: "row", gap: 14 }}>
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
              image ? getImageUrl(image) : require("@assets/images/icon.png")
            }
            contentFit="cover"
            style={{
              width: 82,
              height: 82,
              borderRadius: 10,
              backgroundColor: "#F5F5F2",
            }}
          />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Typography.Text size="xs" style={{ color: muted }} numberOfLines={1}>
            {getEnArName(item.product.store.nameEn, item.product.store.nameAr)}
          </Typography.Text>
          <Typography.Text
            weight="medium"
            numberOfLines={2}
            style={{ marginTop: 3 }}
          >
            {getEnArName(item.product.nameEn, item.product.nameAr)}
          </Typography.Text>
          <Typography.Text weight="medium" style={{ marginTop: 5 }}>
            {formatPrice(item.product.price, item.product.currencyCode)}
          </Typography.Text>
          {item.availability !== "AVAILABLE" && (
            <Typography.Text
              size="xs"
              style={{ color: "#B14F4D", marginTop: 3 }}
            >
              {item.availability === "UNAVAILABLE"
                ? t("cart.unavailable")
                : t("cart.onlyAvailable", { count: item.availableQuantity })}
            </Typography.Text>
          )}
        </View>
      </View>
      <View
        style={{
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 11,
            backgroundColor: "#F5F6F3",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(
              item.quantity === 1 ? "cart.remove" : "cart.decrease",
            )}
            disabled={busy}
            onPress={() =>
              actions.mutate({
                kind: "set",
                productId: item.productId,
                quantity: item.quantity - 1,
              })
            }
            style={{
              width: 42,
              height: 42,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={item.quantity === 1 ? "trash-outline" : "remove"}
              size={18}
              color={ink}
            />
          </Pressable>
          <Typography.Text
            weight="medium"
            style={{ minWidth: 24, textAlign: "center" }}
          >
            {item.quantity}
          </Typography.Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("cart.increase")}
            disabled={
              busy ||
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
              width: 42,
              height: 42,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={18} color={ink} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { t } = useTranslation();
  const cart = useCart();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "bottom"]}
    >
      <View
        style={{
          height: 54,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          style={{ width: 40, height: 44, justifyContent: "center" }}
        >
          <Ionicons name="arrow-back" size={22} color={ink} />
        </Pressable>
        <Typography.Text size="lg" weight="bold">
          {t("cart.title")}
        </Typography.Text>
        {!!cart.data?.itemCount && (
          <Typography.Text style={{ color: muted }}>
            {cart.data.itemCount}
          </Typography.Text>
        )}
      </View>
      {cart.isPending ? (
        <ActivityIndicator color={ink} style={{ marginTop: 90 }} />
      ) : cart.isError ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Typography.Text>{t("cart.loadError")}</Typography.Text>
          <Pressable
            onPress={() => void cart.refetch()}
            style={{ padding: 12 }}
          >
            <Typography.Text weight="medium">{t("cart.retry")}</Typography.Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={cart.data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <CartRow
              item={item}
              last={index === (cart.data?.items.length ?? 0) - 1}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={cart.isRefetching}
              onRefresh={() => void cart.refetch()}
            />
          }
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography.Text size="base" weight="medium">
                {t("cart.empty")}
              </Typography.Text>
            </View>
          }
        />
      )}
      {!!cart.data?.itemCount && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: line,
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography.Text style={{ color: muted }}>
              {t("cart.subtotal")}
            </Typography.Text>
            <Typography.Text size="lg" weight="bold">
              {formatPrice(cart.data.subtotal, cart.data.currencyCode)}
            </Typography.Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={cart.data.hasUnavailableItems}
            onPress={() => router.push("/checkout")}
            style={{
              marginTop: 13,
              minHeight: 50,
              borderRadius: 12,
              backgroundColor: BrandColors.primary,
              alignItems: "center",
              justifyContent: "center",
              opacity: cart.data.hasUnavailableItems ? 0.45 : 1,
            }}
          >
            <Typography.Text weight="medium" style={{ color: "#fff" }}>
              {t("checkout.title")}
            </Typography.Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
