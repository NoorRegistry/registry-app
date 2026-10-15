import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import { ListSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors as C } from "@/constants/Colors";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { fetchSupportRequests } from "@/services/support.service";
import { getUserSub } from "@/utils/helper";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RequestRow, styles } from "./components";
import { Retry } from "./index";
export default function SupportRequestsScreen() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"OPEN" | "RESOLVED">();
  const requests = useInfiniteQuery({
    queryKey: ["support", getUserSub(), "list", status],
    queryFn: ({ pageParam }) => fetchSupportRequests(pageParam, status),
    initialPageParam: 1,
    getNextPageParam: (p) => (p.page < p.totalPages ? p.page + 1 : undefined),
    refetchInterval: 30000,
  });
  useRefreshOnFocus(requests.refetch);
  const rows = requests.data?.pages.flatMap((p) => p.data) || [];
  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      <CommerceTopBar
        title={t("support.myRequests")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/help")
        }
      />
      <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 22 }}>
        {([undefined, "OPEN", "RESOLVED"] as const).map((value) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: status === value }}
            key={value || "all"}
            onPress={() => setStatus(value)}
            style={{
              paddingVertical: 13,
              borderBottomWidth: status === value ? 2 : 0,
              borderBottomColor: C.primary,
            }}
          >
            <CommerceText weight={status === value ? "bold" : "regular"}>
              {t(value ? `support.status.${value}` : "support.all")}
            </CommerceText>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        renderItem={({ item, index }) => (
          <RequestRow
            request={item}
            last={index === rows.length - 1}
            onPress={() =>
              router.push({ pathname: "/help/[id]", params: { id: item.id } })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={requests.isRefetching}
            onRefresh={() => void requests.refetch()}
            tintColor={C.primary}
          />
        }
        onEndReached={() => {
          if (requests.hasNextPage && !requests.isFetchingNextPage)
            void requests.fetchNextPage();
        }}
        ListEmptyComponent={
          requests.isPending && requests.fetchStatus !== "paused" ? (
            <ListSkeleton kind="orders" />
          ) : requests.isError || requests.fetchStatus === "paused" ? (
            <Retry onPress={() => void requests.refetch()} />
          ) : (
            <View style={styles.empty}>
              <CommerceText style={{ color: C.muted }}>
                {t("support.empty")}
              </CommerceText>
            </View>
          )
        }
        ListFooterComponent={
          requests.isFetchingNextPage ? (
            <ListSkeleton kind="orders" rows={1} />
          ) : requests.isFetchNextPageError ? (
            <Retry onPress={() => void requests.fetchNextPage()} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
