import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import { fetchRegistryActivity } from "@/services/home.service";
import { getUserSub } from "@/utils/helper";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityRow } from "./components/RegistryActivity";
import { HomeLoadState } from "./components/shared";

export default function ActivityList() {
  const { t, i18n } = useTranslation();
  const query = useInfiniteQuery({
    queryKey: ["home", getUserSub(), i18n.language, "activity", "all"],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      fetchRegistryActivity(pageParam, 20, signal),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const items = query.data?.pages.flatMap((page) => page.data) ?? [];
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#FEFDFD" }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <CommerceTopBar
        title={t("homeDesign.activity")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        renderItem={({ item, index }) => (
          <ActivityRow item={item} last={index === items.length - 1} />
        )}
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
              {t("homeDesign.noActivity")}
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
