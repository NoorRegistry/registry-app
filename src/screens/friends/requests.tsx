import Typography from "@/components/Typography";
import { fetchFriendRequests } from "@/services/friends.service";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActionButton,
  EmptyState,
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
import { useFriendActions } from "./actions";

export default function RequestsScreen() {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<"incoming" | "sent">("incoming");
  const key = useFriendsKey();
  const summary = useFriendsSummary();
  const actions = useFriendActions();
  const query = useInfiniteQuery({
    queryKey: [...key, "requests", direction],
    queryFn: ({ pageParam, signal }) =>
      fetchFriendRequests(pageParam, direction, signal),
    initialPageParam: 1,
    getNextPageParam: nextFriendsPage,
    staleTime: 10000,
  });
  useRefreshOnFocus(query.refetch);
  useRefreshOnFocus(summary.refetch);
  const requests = Array.from(
    new Map(
      query.data?.pages
        .flatMap((page) => page.data)
        .map((row) => [row.id, row]),
    ).values(),
  );
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("friends.requests")} />
      <View style={styles.tabs}>
        {(["incoming", "sent"] as const).map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: direction === tab }}
            onPress={() => setDirection(tab)}
            style={[styles.tab, direction === tab && styles.activeTab]}
          >
            <Typography.Text
              weight="medium"
              style={{ color: direction === tab ? palette.ink : palette.muted }}
            >
              {t(`friends.${tab}`)} {summary.data?.[tab] || ""}
            </Typography.Text>
          </Pressable>
        ))}
      </View>
      <PagedList
        data={requests}
        keyExtractor={(item) => item.id}
        loading={query.isLoading}
        error={query.isError || query.fetchStatus === "paused"}
        refreshing={query.isRefetching}
        more={!!query.hasNextPage}
        loadingMore={query.isFetchingNextPage}
        moreError={query.isFetchNextPageError}
        refresh={async () => {
          await Promise.all([query.refetch(), summary.refetch()]);
        }}
        loadMore={query.fetchNextPage}
        empty={<EmptyState title={t("friends.noRequests")} />}
        renderItem={({ item, index }) => (
          <PersonRow
            person={direction === "incoming" ? item.sender : item.recipient}
            index={index}
            onPersonPress={() =>
              router.push({
                pathname: "/friends/requests/[id]",
                params: { id: item.id },
              })
            }
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              {direction === "incoming" ? (
                <>
                  <ActionButton
                    title={t("friends.acceptShort")}
                    busy={
                      actions.isPending &&
                      actions.variables?.id === item.id &&
                      actions.variables.kind === "accept"
                    }
                    disabled={actions.isPending}
                    onPress={() =>
                      actions.mutate({ kind: "accept", id: item.id })
                    }
                  />
                  <MotionButton
                    label={t("friends.decline")}
                    disabled={actions.isPending}
                    onPress={() =>
                      actions.mutate({ kind: "decline", id: item.id })
                    }
                    style={{ padding: 10 }}
                  >
                    <Ionicons name="close" size={22} color={palette.muted} />
                  </MotionButton>
                </>
              ) : (
                <ActionButton
                  title={t("common.cancel")}
                  secondary
                  busy={actions.isPending && actions.variables?.id === item.id}
                  disabled={actions.isPending}
                  onPress={() =>
                    actions.mutate({ kind: "cancel", id: item.id })
                  }
                />
              )}
            </View>
          </PersonRow>
        )}
      />
    </SafeAreaView>
  );
}
