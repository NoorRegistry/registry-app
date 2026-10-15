import {
  CatalogSkeleton,
  CatalogSkeletonKind,
} from "@/components/Skeleton/layouts";
import { CommerceText } from "@/components/Commerce";
import Grid from "@/components/Grid";
import Typography from "@/components/Typography";
import { BrandColors as colors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import { IProductCategory } from "@/types";
import { getEnArName, getImageUrl } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

export const browseStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconButton: {
    width: 42,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
});
export function BrowseHeader({
  title,
  back = false,
}: {
  title: string;
  back?: boolean;
}) {
  const { t } = useTranslation();
  const cart = useCart();
  const count = cart.data?.itemCount ?? 0;
  return (
    <View style={[browseStyles.row, { minHeight: 54, paddingHorizontal: 12 }]}>
      {back && (
        <Pressable
          testID="browse-back"
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          style={browseStyles.iconButton}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/shop")
          }
        >
          <Ionicons
            name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"}
            size={22}
            color={colors.ink}
          />
        </Pressable>
      )}
      <CommerceText
        size="lg"
        weight="bold"
        numberOfLines={1}
        style={{ flex: 1, minWidth: 0, paddingStart: back ? 0 : 4 }}
      >
        {title}
      </CommerceText>
      <Pressable
        testID="browse-cart"
        accessibilityRole="button"
        accessibilityLabel={`${t("cart.title")}${count ? `, ${count}` : ""}`}
        onPress={() => router.push("/cart")}
        style={browseStyles.iconButton}
      >
        <Ionicons name="bag-outline" size={24} color={colors.ink} />
        {count > 0 && (
          <View
            style={{
              position: "absolute",
              top: 2,
              end: 0,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 3,
              borderRadius: 9,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography.Text
              allowFontScaling={false}
              style={{
                color: "white",
                fontSize: 10,
                lineHeight: 14,
                textAlign: "center",
              }}
            >
              {count > 99 ? "99+" : count}
            </Typography.Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
export function SearchEntry({
  onPress,
  label,
  testID = "browse-search",
}: {
  onPress: () => void;
  label?: string;
  testID?: string;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="search"
      accessibilityLabel={label ?? t("shop.browseSearch")}
      onPress={onPress}
      style={[
        browseStyles.row,
        {
          minHeight: 44,
          marginHorizontal: 16,
          marginTop: 4,
          marginBottom: 12,
          paddingHorizontal: 13,
          paddingVertical: 8,
          backgroundColor: colors.soft,
          borderRadius: 12,
        },
      ]}
    >
      <Ionicons name="search-outline" size={19} color={colors.muted} />
      <CommerceText style={{ color: colors.muted, flex: 1 }}>
        {label ?? t("shop.browseSearch")}
      </CommerceText>
    </Pressable>
  );
}
export function CatalogImage({
  path,
  size,
  icon = "grid-outline",
}: {
  path?: string;
  size: number;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: "#F7F5F3",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {!loaded && (
        <Ionicons
          name={icon}
          size={Math.min(32, size * 0.45)}
          color={colors.deep}
        />
      )}
      {path && !failed && (
        <Image
          source={getImageUrl(path)}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          contentFit="contain"
          style={{ position: "absolute", width: "85%", height: "85%" }}
        />
      )}
    </View>
  );
}
export function CategoryGrid({
  categories,
  onSelect,
  availableWidth,
}: {
  availableWidth?: number;
  categories: IProductCategory[];
  onSelect: (category: IProductCategory) => void;
}) {
  const { width, fontScale } = useWindowDimensions();
  const columns = availableWidth
    ? fontScale > 1.3
      ? 1
      : 2
    : width >= 600
      ? 5
      : 3;
  return (
    <Grid
      data={categories}
      columns={columns}
      padding={16}
      keyExtractor={(category) => category.id}
      renderItem={(category, size) => (
        <Pressable
          testID={`category-tile-${category.id}`}
          key={category.id}
          accessibilityRole="button"
          accessibilityLabel={getEnArName(category.nameEn, category.nameAr)}
          onPress={() => onSelect(category)}
          style={{
            paddingBottom: 8,
            gap: 6,
            alignItems: "center",
          }}
        >
          <CatalogImage key={category.logo} path={category.logo} size={size} />
          <CommerceText
            size="xs"
            numberOfLines={2}
            style={{ textAlign: "center", minHeight: 34 * fontScale }}
          >
            {getEnArName(category.nameEn, category.nameAr)}
          </CommerceText>
        </Pressable>
      )}
    />
  );
}
export function BrowseState({
  loading,
  error,
  retry,
  empty,
  loadingLayout = "products",
  horizontal = false,
}: {
  loading?: boolean;
  error?: boolean;
  retry?: () => void;
  empty?: string;
  loadingLayout?: CatalogSkeletonKind;
  horizontal?: boolean;
}) {
  const { t } = useTranslation();
  if (loading)
    return <CatalogSkeleton kind={loadingLayout} horizontal={horizontal} />;
  return (
    <View style={{ padding: 24, alignItems: "center", gap: 12 }}>
      <CommerceText style={{ color: colors.muted, textAlign: "center" }}>
        {error ? t("shop.loadError") : (empty ?? t("store.empty"))}
      </CommerceText>
      {error && (
        <Pressable
          accessibilityRole="button"
          onPress={retry}
          style={{ padding: 12 }}
        >
          <CommerceText weight="medium" style={{ color: colors.deep }}>
            {t("friends.retry")}
          </CommerceText>
        </Pressable>
      )}
    </View>
  );
}
export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={[browseStyles.row, browseStyles.section]}>
      <CommerceText weight="bold" size="base" style={{ flex: 1 }}>
        {title}
      </CommerceText>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
          <CommerceText size="xs" style={{ color: colors.deep }}>
            {action}
          </CommerceText>
        </Pressable>
      )}
    </View>
  );
}
