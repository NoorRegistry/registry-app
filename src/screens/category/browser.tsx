import { CommerceText } from "@/components/Commerce";
import { BrandColors as colors } from "@/constants/Colors";
import { fetchProductCategories } from "@/services/products.service";
import { IProductCategory } from "@/types";
import { getEnArName } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  I18nManager,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BrowseHeader,
  BrowseState,
  CatalogImage,
  CategoryGrid,
  SearchEntry,
  SectionTitle,
  browseStyles,
} from "../shop/components/Browse";
import { categoryChildren, categoryPath } from "./tree";

export default function CategoryBrowser() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  return (
    <CategoryBrowserContent
      key={categoryId ?? "root"}
      initialId={categoryId ?? ""}
    />
  );
}
function CategoryBrowserContent({ initialId }: { initialId: string }) {
  const { t } = useTranslation();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
    staleTime: 60000,
  });
  const [selected, setSelected] = useState(initialId);
  const [paneWidth, setPaneWidth] = useState(0);
  const roots = categories.data?.data ?? [];
  const path = categoryPath(roots, selected || roots[0]?.id);
  const parent = path.at(-1);
  const children = categoryChildren(parent);
  const openProducts = (id: string, all = false) =>
    router.push({
      pathname: "/category/[id]",
      params: { id, ...(all ? { view: "all" } : {}) },
    });
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top", "bottom", "left", "right"]}
      >
        <BrowseHeader title={t("common.categories")} back />
        <SearchEntry
          testID="category-find"
          label={t("shop.findCategory")}
          onPress={() => router.push("/category/search")}
        />
        {!parent ? (
          <BrowseState
            loadingLayout="categories"
            loading={
              categories.isPending && categories.fetchStatus !== "paused"
            }
            error={categories.isError || categories.fetchStatus === "paused"}
            empty={t("shop.categoryMissing")}
            retry={() => void categories.refetch()}
          />
        ) : (
          <View style={{ flex: 1, flexDirection: "row" }}>
            <FlatList
              testID="category-root-rail"
              data={roots}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={{ width: 88, flexGrow: 0, backgroundColor: "#FCFAF9" }}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const active = path[0]?.id === item.id;
                return (
                  <Pressable
                    testID={`category-root-${item.id}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelected(item.id)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 6,
                      gap: 5,
                      alignItems: "center",
                      backgroundColor: active ? colors.soft : "transparent",
                      borderStartWidth: 3,
                      borderStartColor: active ? colors.primary : "transparent",
                    }}
                  >
                    <CatalogImage path={item.logo} size={42} />
                    <CommerceText
                      size="xs"
                      weight={active ? "medium" : "regular"}
                      style={{
                        textAlign: "center",
                        color: active ? colors.deep : colors.muted,
                      }}
                    >
                      {getEnArName(item.nameEn, item.nameAr)}
                    </CommerceText>
                  </Pressable>
                );
              }}
            />
            <ScrollView
              key={parent.id}
              testID="category-browser-pane"
              style={{ flex: 1 }}
              onLayout={({ nativeEvent }) =>
                setPaneWidth(nativeEvent.layout.width)
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {path.length > 1 && (
                <Pressable
                  testID="category-browser-up"
                  accessibilityRole="button"
                  accessibilityLabel={t("common.back")}
                  onPress={() => setSelected(path.at(-2)!.id)}
                  style={[
                    browseStyles.row,
                    { paddingHorizontal: 16, paddingTop: 14 },
                  ]}
                >
                  <Ionicons
                    name={
                      I18nManager.isRTL ? "chevron-forward" : "chevron-back"
                    }
                    size={16}
                    color={colors.muted}
                  />
                  <CommerceText
                    size="xs"
                    numberOfLines={2}
                    style={{ flex: 1, color: colors.muted }}
                  >
                    {path
                      .slice(0, -1)
                      .map((item) => getEnArName(item.nameEn, item.nameAr))
                      .join(" / ")}
                  </CommerceText>
                </Pressable>
              )}
              <SectionTitle title={getEnArName(parent.nameEn, parent.nameAr)} />
              <Pressable
                testID="category-browser-all"
                accessibilityRole="button"
                onPress={() => openProducts(parent.id, true)}
                style={[
                  browseStyles.row,
                  { minHeight: 44, paddingHorizontal: 16, marginBottom: 12 },
                ]}
              >
                <CommerceText size="xs" style={{ flex: 1, color: colors.deep }}>
                  {t("shop.allProducts")}
                </CommerceText>
                <Ionicons
                  name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"}
                  size={16}
                  color={colors.deep}
                />
              </Pressable>
              {paneWidth > 0 && (
                <CategoryGrid
                  categories={children}
                  availableWidth={paneWidth}
                  onSelect={(item: IProductCategory) =>
                    categoryChildren(item).length
                      ? setSelected(item.id)
                      : openProducts(item.id)
                  }
                />
              )}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
