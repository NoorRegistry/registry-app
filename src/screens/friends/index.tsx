import Typography from "@/components/Typography";
import { fetchFriends } from "@/services/friends.service";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";
import {
  ActionButton,
  EmptyState,
  FriendSearch,
  FriendsTopBar,
  MotionButton,
  PagedList,
  PersonRow,
  palette,
  styles,
} from "./components";
import {
  nextFriendsPage,
  useFriendsKey,
  useFriendsSummary,
  useRefreshOnFocus,
} from "./hooks";

export default function FriendsScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search.trim(), 300);
  const key = useFriendsKey();
  const summary = useFriendsSummary();
  const query = useInfiniteQuery({
    queryKey: [...key, "list", debouncedSearch],
    queryFn: ({ pageParam, signal }) =>
      fetchFriends(pageParam, debouncedSearch, signal),
    initialPageParam: 1,
    getNextPageParam: nextFriendsPage,
    staleTime: 15000,
  });
  useRefreshOnFocus(query.refetch);
  useRefreshOnFocus(summary.refetch);
  const friends = Array.from(
    new Map(
      query.data?.pages
        .flatMap((page) => page.data)
        .map((row) => [row.id, row]),
    ).values(),
  );
  const count = summary.data?.friends ?? query.data?.pages[0]?.total ?? 0;
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("friends.title")}>
        <MotionButton
          label={t("friends.addFriend")}
          onPress={() =>
            router.push({
              pathname: "/(protected)/(tabs)/search",
              params: { type: "people", q: "" },
            })
          }
          style={styles.iconButton}
        >
          <Ionicons name="person-add-outline" size={23} color={palette.ink} />
        </MotionButton>
        <MotionButton
          label={t("friends.settings")}
          onPress={() => router.push("/friends/settings")}
          style={styles.iconButton}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={palette.ink} />
        </MotionButton>
      </FriendsTopBar>
      <View style={styles.tabs}>
        <View style={[styles.tab, styles.activeTab]}>
          <Typography.Text
            size="sm"
            weight="medium"
            style={{ color: palette.ink }}
          >
            {t("friends.title")}{" "}
            {count > 0 && (
              <Typography.Text style={{ color: palette.muted }}>
                {count}
              </Typography.Text>
            )}
          </Typography.Text>
        </View>
        <View style={{ flex: 1 }}>
          <MotionButton
            label={t("friends.requests")}
            onPress={() => router.push("/friends/requests")}
            style={styles.tab}
          >
            <Typography.Text weight="medium" style={{ color: palette.muted }}>
              {t("friends.requests")}
            </Typography.Text>
            {!!summary.data?.incoming && (
              <View
                style={{
                  backgroundColor: palette.accent,
                  borderRadius: 9,
                  minWidth: 18,
                  paddingHorizontal: 5,
                }}
              >
                <Typography.Text
                  size="xs"
                  style={{ color: "white", textAlign: "center" }}
                >
                  {summary.data.incoming}
                </Typography.Text>
              </View>
            )}
          </MotionButton>
        </View>
      </View>
      <FriendSearch
        value={search}
        onChange={setSearch}
        placeholder={t("friends.searchFriends")}
      />
      <PagedList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <PersonRow
            person={item.friend}
            index={index}
            onPress={() =>
              router.push({
                pathname: "/friends/[id]",
                params: { id: item.friend.id },
              })
            }
          >
            <Typography.Text
              size="xs"
              style={{ color: palette.muted, textAlign: "right", maxWidth: 85 }}
            >
              {t("friends.sharedRatio", {
                shared: String(item.sharedCount),
                total: String(item.totalRegistries),
              })}
            </Typography.Text>
          </PersonRow>
        )}
        loading={query.isPending}
        error={query.isError}
        refreshing={query.isRefetching}
        more={!!query.hasNextPage}
        loadingMore={query.isFetchingNextPage}
        moreError={query.isFetchNextPageError}
        refresh={async () => {
          await Promise.all([query.refetch(), summary.refetch()]);
        }}
        loadMore={query.fetchNextPage}
        empty={
          <EmptyState
            title={t(
              debouncedSearch ? "friends.noMatches" : "friends.emptyTitle",
            )}
          >
            <ActionButton
              title={t("friends.addFriend")}
              onPress={() =>
                router.push({
                  pathname: "/(protected)/(tabs)/search",
                  params: { type: "people", q: "" },
                })
              }
            />
          </EmptyState>
        }
      />
    </SafeAreaView>
  );
}
