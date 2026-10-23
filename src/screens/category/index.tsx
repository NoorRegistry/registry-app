import CartBar from "@/components/CartBar";
import { CommerceText } from "@/components/Commerce";
import { BrandColors as colors } from "@/constants/Colors";
import { fetchProductCategories } from "@/services/products.service";
import { getEnArName } from "@/utils/helper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  ReduceMotion,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BrowseHeader,
  BrowseState,
  CategoryGrid,
  SearchEntry,
  SectionTitle,
} from "../shop/components/Browse";
import CatalogProducts from "../shop/components/CatalogProducts";
import CategorySwitcher from "../shop/components/CategorySwitcher";
import { categoryChildren, categoryPath } from "./tree";
import CategoryTabs from "./components/CategoryTabs";
import { catalogProductsOptions } from "../shop/catalog";

export default function CategoryScreen() {
  const { id, view } = useLocalSearchParams<{ id: string; view?: string }>();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [direction, setDirection] = useState(I18nManager.isRTL ? -1 : 1);
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
    staleTime: 60000,
  });
  const roots = categories.data?.data ?? [];
  const path = categoryPath(roots, id);
  const category = path.at(-1);
  const children = categoryChildren(category);
  const parent = path.at(-2);
  const showGrid = children.length > 0 && view !== "all";
  const tabs = children.length ? children : categoryChildren(parent);
  const groupId = children.length ? id : parent?.id;
  useEffect(() => {
    if (showGrid || !groupId) return;
    const ids = [groupId, ...tabs.map((tab) => tab.id)];
    const selectedIndex = ids.indexOf(id);
    // Warm nearby tabs without downloading the entire category catalog.
    ids.forEach((categoryId, index) => {
      if (
        categoryId === id ||
        (index !== 0 && Math.abs(index - selectedIndex) > 2)
      )
        return;
      const options = catalogProductsOptions({
        categoryId,
        sort: "featured",
        language: i18n.language,
      });
      // Keep any pages already loaded by the user intact.
      if (!queryClient.getQueryData(options.queryKey)) {
        void queryClient.prefetchInfiniteQuery({ ...options, pages: 1 });
      }
    });
  }, [groupId, id, i18n.language, queryClient, showGrid, tabs]);
  const name = category
    ? getEnArName(category.nameEn, category.nameAr)
    : t("common.categories");
  const open = (target: string, all = false) => {
    if (target === id && (view === "all") === all) return;
    router.push({
      pathname: "/category/[id]",
      params: { id: target, ...(all ? { view: "all" } : {}) },
    });
  };
  const switchTab = (target: string, all = false) => {
    if (target === id && (view === "all") === all) return;
    const ids = [groupId, ...tabs.map((tab) => tab.id)];
    const forward = ids.indexOf(target) >= ids.indexOf(id);
    setDirection((forward ? 1 : -1) * (I18nManager.isRTL ? -1 : 1));
    // Keep tab selections on this route so Back follows the category hierarchy.
    router.setParams({ id: target, view: all ? "all" : undefined });
  };
  const header = (
    <>
      <CategorySwitcher roots={roots} path={path} onSelect={open} />
      {showGrid ? (
        <>
          <SectionTitle
            title={t("common.categories")}
            action={t("shop.allProducts")}
            onPress={() => switchTab(id, true)}
          />
          <CategoryGrid
            categories={children.slice(0, 6)}
            onSelect={(child) => open(child.id)}
          />
          {children.length > 6 && (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/category",
                  params: { categoryId: id },
                })
              }
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <CommerceText size="xs" style={{ color: colors.deep }}>
                {t("shop.allCategories")}
              </CommerceText>
            </Pressable>
          )}
        </>
      ) : (
        tabs.length > 0 && (
          <CategoryTabs
            categories={tabs}
            selectedId={children.length ? undefined : id}
            onSelect={(target) =>
              switchTab(target ?? (children.length ? id : parent!.id), !target)
            }
          />
        )
      )}
    </>
  );
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top", "bottom", "left", "right"]}
      >
        <BrowseHeader title={name} back />
        {category && (
          <SearchEntry
            label={t("shop.categorySearch", { name })}
            onPress={() =>
              router.push({
                pathname: "/catalog-search",
                params: { categoryId: id, name },
              })
            }
          />
        )}
        {category ? (
          <View style={{ flex: 1 }}>
            {!showGrid && header}
            <View style={{ flex: 1, overflow: "hidden" }}>
              <Animated.View
                key={id + (view ?? "")}
                entering={(direction > 0 ? FadeInRight : FadeInLeft)
                  .duration(280)
                  .easing(Easing.out(Easing.cubic))
                  .reduceMotion(ReduceMotion.System)}
                exiting={FadeOut.duration(160).reduceMotion(
                  ReduceMotion.System,
                )}
                style={StyleSheet.absoluteFill}
              >
                <CatalogProducts
                  categoryId={id}
                  header={showGrid ? header : undefined}
                  onRefresh={() => categories.refetch()}
                />
              </Animated.View>
            </View>
            <CartBar placement="screen" />
          </View>
        ) : (
          <BrowseState
            loadingLayout="categories"
            loading={
              categories.isPending && categories.fetchStatus !== "paused"
            }
            error={categories.isError || categories.fetchStatus === "paused"}
            empty={t("shop.categoryMissing")}
            retry={() => void categories.refetch()}
          />
        )}
      </SafeAreaView>
    </>
  );
}
