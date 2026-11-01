import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import ProductCard from "@/components/ProductCard";
import {
  fetchFeaturedGifts,
  fetchFeaturedStores,
} from "@/services/home.service";
import { IProduct, IStore, IPaginatedResponse } from "@/types";
import { getUserSub } from "@/utils/helper";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  RefreshControl,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StoreTile } from "./components/Featured";
import { HomeLoadState } from "./components/shared";

export default function FeaturedList({ kind }: { kind: "gifts" | "stores" }) {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const gifts = kind === "gifts";
  const columns = gifts ? 2 : 3;
  const itemWidth = (width - 40 - (columns - 1) * 12) / columns;
  const query = useInfiniteQuery({
    queryKey: ["home", getUserSub(), i18n.language, "all", kind, gifts],
    initialPageParam: 1,
    queryFn: ({
      pageParam,
      signal,
    }): Promise<IPaginatedResponse<IProduct | IStore>> =>
      gifts
        ? fetchFeaturedGifts(pageParam, 24, signal)
        : fetchFeaturedStores(pageParam, 24, signal),
    getNextPageParam: (page) =>
      page.page && page.totalPages && page.page < page.totalPages
        ? page.page + 1
        : undefined,
  });
  const items = query.data?.pages.flatMap((page) => page.data) ?? [];
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#FEFDFD" }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <CommerceTopBar
        title={t(
          gifts ? "homeDesign.featuredGifts" : "homeDesign.featuredStores",
        )}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      />
      <FlatList
        key={columns}
        data={items}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 22 }} />}
        renderItem={({ item }) =>
          gifts ? (
            <ProductCard product={item as IProduct} width={itemWidth} />
          ) : (
            <StoreTile store={item as IStore} width={itemWidth} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => void query.refetch()}
          />
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage)
            void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          query.isPending || query.isError || query.fetchStatus === "paused" ? (
            <HomeLoadState
              loading={query.isPending && query.fetchStatus !== "paused"}
              onRetry={() => void query.refetch()}
            />
          ) : (
            <CommerceText style={{ paddingVertical: 28 }}>
              {t("homeDesign.noFeatured")}
            </CommerceText>
          )
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <HomeLoadState loading />
          ) : query.isFetchNextPageError ? (
            <HomeLoadState onRetry={() => void query.fetchNextPage()} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
