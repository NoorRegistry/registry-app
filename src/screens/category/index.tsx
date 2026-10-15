import CartBar from "@/components/CartBar";
import { CommerceText } from "@/components/Commerce";
import { BrandColors as colors } from "@/constants/Colors";
import { fetchProductCategories } from "@/services/products.service";
import { getEnArName } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
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

export default function CategoryScreen() {
  const { id, view } = useLocalSearchParams<{ id: string; view?: string }>();
  const { t } = useTranslation();
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
  const tabs = children.length ? children : categoryChildren(parent);
  const header = (
    <>
      <CategorySwitcher roots={roots} path={path} onSelect={open} />
      {showGrid ? (
        <>
          <SectionTitle
            title={t("common.categories")}
            action={t("shop.allProducts")}
            onPress={() => open(id, true)}
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 20 }}
            style={{
              flexGrow: 0,
              flexShrink: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.line,
            }}
          >
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: children.length > 0 }}
              onPress={() => open(children.length ? id : parent!.id, true)}
              style={{
                minHeight: 46,
                justifyContent: "center",
                borderBottomWidth: children.length ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
            >
              <CommerceText
                size="xs"
                style={{ color: children.length ? colors.deep : colors.muted }}
              >
                {t("store.all")}
              </CommerceText>
            </Pressable>
            {tabs.map((child) => (
              <Pressable
                testID={`category-tab-${child.id}`}
                key={child.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: child.id === id }}
                onPress={() => open(child.id)}
                style={{
                  minHeight: 46,
                  justifyContent: "center",
                  borderBottomWidth: child.id === id ? 2 : 0,
                  borderBottomColor: colors.primary,
                }}
              >
                <CommerceText
                  size="xs"
                  numberOfLines={1}
                  style={{
                    color: child.id === id ? colors.deep : colors.muted,
                  }}
                >
                  {getEnArName(child.nameEn, child.nameAr)}
                </CommerceText>
              </Pressable>
            ))}
          </ScrollView>
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
            <CatalogProducts
              key={id + (view ?? "")}
              categoryId={id}
              header={showGrid ? header : undefined}
              onRefresh={() => categories.refetch()}
            />
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
