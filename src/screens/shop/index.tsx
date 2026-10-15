import { CommerceText } from "@/components/Commerce";
import { fetchProductCategories } from "@/services/products.service";
import { fetchShopStores } from "@/services/stores.service";
import { getEnArName } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BrowseHeader,
  BrowseState,
  CatalogImage,
  CategoryGrid,
  SearchEntry,
  SectionTitle,
} from "./components/Browse";
import CatalogProducts from "./components/CatalogProducts";

export default function ShopScreen() {
  const { t } = useTranslation();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
    staleTime: 60000,
  });
  const stores = useQuery({
    queryKey: ["stores", "shop"],
    queryFn: () => fetchShopStores(),
    staleTime: 60000,
  });
  const refresh = () => Promise.all([categories.refetch(), stores.refetch()]);
  const header = (
    <>
      <SectionTitle
        title={t("common.categories")}
        action={t("shop.allCategories")}
        onPress={() => router.push("/category")}
      />
      {categories.data ? (
        <CategoryGrid
          categories={categories.data.data.slice(0, 6)}
          onSelect={(category) =>
            router.push({
              pathname: "/category/[id]",
              params: { id: category.id },
            })
          }
        />
      ) : (
        <BrowseState
          loadingLayout="categories"
          loading={categories.isPending && categories.fetchStatus !== "paused"}
          error={categories.isError || categories.fetchStatus === "paused"}
          retry={() => void categories.refetch()}
        />
      )}
      <SectionTitle
        title={t("shop.stores")}
        action={t("shop.seeAll")}
        onPress={() => router.push("/stores")}
      />
      {stores.data ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
        >
          {stores.data.data.map((store) => (
            <Pressable
              testID={`shop-store-${store.id}`}
              key={store.id}
              accessibilityRole="button"
              accessibilityLabel={getEnArName(store.nameEn, store.nameAr)}
              onPress={() =>
                router.push({
                  pathname: "/stores/[id]",
                  params: {
                    id: store.id,
                    storeName: getEnArName(store.nameEn, store.nameAr),
                  },
                })
              }
              style={{ width: 80, gap: 6, alignItems: "center" }}
            >
              <CatalogImage
                path={store.storeLogo}
                size={72}
                icon="storefront-outline"
              />
              <CommerceText
                size="xs"
                numberOfLines={2}
                style={{ textAlign: "center" }}
              >
                {getEnArName(store.nameEn, store.nameAr)}
              </CommerceText>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <BrowseState
          loadingLayout="stores"
          horizontal
          loading={stores.isPending && stores.fetchStatus !== "paused"}
          error={stores.isError || stores.fetchStatus === "paused"}
          retry={() => void stores.refetch()}
        />
      )}
      <View style={{ height: 6 }} />
      <SectionTitle title={t("shop.newArrivals")} />
    </>
  );
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "left", "right"]}
    >
      <BrowseHeader title={t("common.shop")} />
      <SearchEntry
        onPress={() =>
          router.push({
            pathname: "/shop-search",
            params: { type: "products" },
          })
        }
      />
      <CatalogProducts header={header} bottomTabs onRefresh={refresh} />
    </SafeAreaView>
  );
}
