import CartBar from "@/components/CartBar";
import { BrandColors as colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";
import { BrowseHeader, browseStyles } from "../shop/components/Browse";
import CatalogProducts from "../shop/components/CatalogProducts";

export default function CatalogSearch() {
  const { categoryId, storeId, name } = useLocalSearchParams<{
    categoryId?: string;
    storeId?: string;
    name?: string;
  }>();
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [search] = useDebounce(query.trim(), 300);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top", "bottom", "left", "right"]}
      >
        <BrowseHeader title={t("common.search")} back />
        <View
          style={[
            browseStyles.row,
            {
              marginHorizontal: 16,
              marginBottom: 8,
              minHeight: 46,
              paddingHorizontal: 12,
              backgroundColor: colors.soft,
              borderRadius: 12,
            },
          ]}
        >
          <Ionicons name="search-outline" size={19} color={colors.muted} />
          <TextInput
            testID="catalog-search-input"
            autoFocus
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel={t("shop.searchPlaceholder")}
            placeholder={
              name
                ? t("shop.categorySearch", { name })
                : t("shop.searchPlaceholder")
            }
            placeholderTextColor={colors.muted}
            style={{
              flex: 1,
              paddingVertical: 10,
              fontSize: 14,
              color: colors.ink,
              fontFamily:
                i18n.language === "ar" ? "Tajawalregular" : "Poppinsregular",
              textAlign: I18nManager.isRTL ? "right" : "left",
              includeFontPadding: false,
            }}
          />
          {query.length > 0 && (
            <Pressable
              testID="catalog-search-clear"
              accessibilityRole="button"
              accessibilityLabel={t("friends.clearSearch")}
              onPress={() => setQuery("")}
              hitSlop={10}
            >
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <CatalogProducts
            key={`${categoryId ?? storeId ?? "all"}:${search}`}
            categoryId={categoryId}
            storeId={storeId}
            search={search}
            enabled={search.length >= 2}
          />
          <CartBar placement="screen" />
        </View>
      </SafeAreaView>
    </>
  );
}
