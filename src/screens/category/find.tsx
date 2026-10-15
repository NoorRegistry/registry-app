import { CommerceText } from "@/components/Commerce";
import { BrandColors as colors } from "@/constants/Colors";
import { fetchProductCategories } from "@/services/products.service";
import { getEnArName } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  I18nManager,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BrowseHeader,
  BrowseState,
  browseStyles,
} from "../shop/components/Browse";
import { categoryChildren, findCategories } from "./tree";

export default function FindCategory() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
    staleTime: 60000,
  });
  const results = query.trim()
    ? findCategories(categories.data?.data ?? [], query)
    : [];
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
              paddingHorizontal: 12,
              marginHorizontal: 16,
              marginBottom: 12,
              borderRadius: 12,
              backgroundColor: colors.soft,
            },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput
            testID="category-find-input"
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={t("shop.findCategory")}
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            style={{
              minHeight: 46,
              flex: 1,
              fontSize: 14,
              fontFamily:
                i18n.language === "ar" ? "Tajawalregular" : "Poppinsregular",
              color: colors.ink,
              textAlign: I18nManager.isRTL ? "right" : "left",
              includeFontPadding: false,
            }}
          />
        </View>
        <FlatList
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={results}
          keyExtractor={(item) => item.category.id}
          ListEmptyComponent={
            query.trim() ? (
              <BrowseState
                loadingLayout="categories"
                loading={categories.isPending}
                error={categories.isError}
                retry={() => void categories.refetch()}
                empty={t("shop.noCategories")}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              testID={`category-found-${item.category.id}`}
              accessibilityRole="button"
              onPress={() =>
                router.push(
                  categoryChildren(item.category).length
                    ? {
                        pathname: "/category",
                        params: { categoryId: item.category.id },
                      }
                    : {
                        pathname: "/category/[id]",
                        params: { id: item.category.id },
                      },
                )
              }
              style={{ paddingHorizontal: 20, paddingVertical: 14, gap: 4 }}
            >
              <CommerceText>
                {getEnArName(item.category.nameEn, item.category.nameAr)}
              </CommerceText>
              <CommerceText size="xs" style={{ color: colors.muted }}>
                {item.path
                  .slice(0, -1)
                  .map((node) => getEnArName(node.nameEn, node.nameAr))
                  .join(" / ")}
              </CommerceText>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </>
  );
}
