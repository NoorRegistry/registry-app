import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import RegistryAvatar from "@/components/RegistryAvatar";
import { BrandColors as C } from "@/constants/Colors";
import { searchPublicRegistries } from "@/services/home.service";
import { formatEventDate } from "@/utils/event-date";
import { getUserSub } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  I18nManager,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";
import { HomeLoadState } from "./components/shared";

export default function FindRegistry() {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState("");
  const [search] = useDebounce(text.trim(), 300);
  const enabled = search.length >= 2;
  const query = useInfiniteQuery({
    queryKey: ["publicRegistries", getUserSub(), i18n.language, search],
    initialPageParam: 1,
    staleTime: 0,
    refetchOnMount: "always",
    enabled,
    queryFn: ({ pageParam, signal }) =>
      searchPublicRegistries(search, pageParam, signal),
    getNextPageParam: (page) =>
      page.page && page.totalPages && page.page < page.totalPages
        ? page.page + 1
        : undefined,
  });
  useRefreshOnFocus(query.refetch, enabled);
  const items =
    enabled && !query.isError
      ? (query.data?.pages.flatMap((page) => page.data) ?? [])
      : [];
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#FEFDFD" }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <CommerceTopBar
        title={t("homeDesign.findRegistry")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      />
      <View
        style={{
          marginHorizontal: 20,
          marginVertical: 12,
          paddingHorizontal: 13,
          borderRadius: 12,
          backgroundColor: C.soft,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Feather name="search" size={19} color={C.muted} />
        <TextInput
          accessibilityLabel={t("homeDesign.searchRegistry")}
          placeholder={t("homeDesign.searchRegistry")}
          value={text}
          onChangeText={setText}
          autoFocus
          autoCorrect={false}
          maxLength={100}
          style={{
            flex: 1,
            minHeight: 48,
            fontSize: 16,
            textAlign: I18nManager.isRTL ? "right" : "left",
            color: C.ink,
          }}
          placeholderTextColor={C.muted}
        />
        {!!text && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("homeDesign.clearSearch")}
            onPress={() => setText("")}
            style={{ padding: 10 }}
          >
            <Feather name="x" size={18} color={C.muted} />
          </Pressable>
        )}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/registry/guest-view",
                params: { id: item.id },
              })
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 17,
              borderBottomWidth: index < items.length - 1 ? 0.5 : 0,
              borderBottomColor: C.line,
            }}
          >
            <RegistryAvatar title={item.title} logo={item.logo} size={50} />
            <View style={{ flex: 1, gap: 3 }}>
              <CommerceText weight="medium">{item.title}</CommerceText>
              {!!item.ownerName && (
                <CommerceText size="xs" style={{ color: C.muted }}>
                  {item.ownerName}
                </CommerceText>
              )}
              <CommerceText size="xs" style={{ color: C.muted }}>
                {[
                  item.category.name,
                  formatEventDate(item.eventDate, i18n.language),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </CommerceText>
            </View>
            <Feather
              name={I18nManager.isRTL ? "chevron-left" : "chevron-right"}
              size={19}
              color={C.muted}
            />
          </Pressable>
        )}
        refreshControl={
          <RefreshControl
            refreshing={
              enabled && query.isRefetching && !query.isFetchingNextPage
            }
            onRefresh={() => {
              if (enabled) void query.refetch();
            }}
          />
        }
        onEndReached={() => {
          if (enabled && query.hasNextPage && !query.isFetchingNextPage)
            void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !enabled ? (
            <CommerceText
              size="sm"
              style={{ color: C.muted, paddingVertical: 20 }}
            >
              {t("homeDesign.searchHint")}
            </CommerceText>
          ) : query.isPending ||
            query.isError ||
            query.fetchStatus === "paused" ? (
            <HomeLoadState
              loading={query.isPending && query.fetchStatus !== "paused"}
              onRetry={() => void query.refetch()}
            />
          ) : (
            <CommerceText style={{ paddingVertical: 20 }}>
              {t("homeDesign.noRegistries")}
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
