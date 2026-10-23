import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import { formatPrice, getEnArName, getImageUrl } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { RegistryFilter, RegistryRow } from "../items";

export default function RegistryItem({
  registryItem: item,
  filter,
  divider,
}: {
  registryItem: RegistryRow;
  filter: RegistryFilter;
  divider: boolean;
}) {
  const { t } = useTranslation();
  const image = getImageUrl(item.product.images?.[0]?.path);
  const [failed, setFailed] = useState<string | null>(null);
  const showPurchased = filter === "purchased" || item.qtyLeft === 0;
  const name = getEnArName(item.product.nameEn, item.product.nameAr);
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        onPress={() =>
          router.push({
            pathname: "/products/[id]",
            params: { id: item.product.id },
          })
        }
        style={styles.image}
      >
        {image && image !== failed ? (
          <Image
            source={image}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
            onError={() => setFailed(image)}
          />
        ) : (
          <Feather name="gift" size={27} color={C.deep} />
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: "/products/[id]",
            params: { id: item.product.id },
          })
        }
        style={{ flex: 1, minWidth: 0, gap: 4 }}
      >
        <CommerceText size="xs" numberOfLines={1} style={{ color: C.muted }}>
          {getEnArName(item.category.nameEn, item.category.nameAr)}
        </CommerceText>
        <CommerceText size="base" numberOfLines={2}>
          {name}
        </CommerceText>
        <CommerceText style={{ color: "#171717" }}>
          {formatPrice(item.product.price, item.product.currencyCode)}
        </CommerceText>
        <CommerceText
          size="xs"
          style={{ color: showPurchased ? "#408467" : C.deep }}
        >
          {showPurchased
            ? filter === "purchased" && item.qtyLeft > 0
              ? t("home.registryPurchased", { count: item.purchasedQty })
              : t("registry.purchasedLabel")
            : t("registry.unpurchasedQty", { count: item.qtyLeft })}
        </CommerceText>
      </Pressable>
      <Pressable
        testID={`registry-edit-${item.id}`}
        accessibilityRole="button"
        accessibilityLabel={t("registry.editItem", { name })}
        onPress={() =>
          router.push({
            pathname: "/(protected)/registry/item/[id]",
            params: { id: item.id },
          })
        }
        style={styles.edit}
      >
        <Feather name="edit-2" size={21} color={C.ink} />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
  },
  image: {
    width: 92,
    height: 94,
    borderRadius: 6,
    backgroundColor: "#F7F4F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  edit: {
    width: 34,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
