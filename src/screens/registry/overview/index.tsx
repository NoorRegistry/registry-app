import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CommerceText } from "@/components/Commerce";
import { BrandColors as C, Colors } from "@/constants/Colors";
import { useNotificationSummary } from "@/hooks/useNotifications";
import {
  fetchRegistries,
  fetchSharedRegistries,
  SharedRegistryOverview,
} from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import type { IRegistry } from "@/types";
import { getUserFirstName, getUserSub } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListSkeleton } from "@/components/Skeleton/layouts";
import { HomeLoadState } from "@/screens/home/components/shared";
import RegistryOverviewCard from "./RegistryOverviewCard";
import {
  EmptyState,
  OverviewActivity,
  OverviewGuides,
  OverviewIdeas,
} from "./resources";

type Ownership = "yours" | "shared";
type Resource = "Activity" | "Ideas" | "Guides";
const resourceLabels = {
  Activity: "activity",
  Ideas: "ideas",
  Guides: "guides",
} as const;

export default function RegistryOverviewScreen() {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const userId = getUserSub();
  const { width, fontScale } = useWindowDimensions();
  const [ownership, setOwnership] = useState<Ownership>("yours");
  const [resource, setResource] = useState<Resource>("Activity");
  const [expanded, setExpanded] = useState({ yours: false, shared: false });
  const [refreshing, setRefreshing] = useState(false);
  const select = useGlobalStore((state) => state.setSelectedRegistryId);
  const notifications = useNotificationSummary();
  const ownQuery = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });
  const sharedQuery = useQuery({
    queryKey: ["friends", userId, i18n.language, "registry-overview"],
    queryFn: ({ signal }) => fetchSharedRegistries(signal),
    staleTime: 15000,
  });
  const refresh = useCallback(async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["registries"] }),
      client.invalidateQueries({ queryKey: ["friends", userId] }),
      client.invalidateQueries({ queryKey: ["home", userId] }),
      client.invalidateQueries({ queryKey: ["guides"] }),
      client.invalidateQueries({ queryKey: ["notifications", userId] }),
    ]);
  }, [client, userId]);
  const visited = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (visited.current) void refresh();
      visited.current = true;
    }, [refresh]),
  );

  const yours = ownQuery.data?.filter((row) => row.isActive !== false) ?? [];
  const shared = sharedQuery.data ?? [];
  const query = ownership === "yours" ? ownQuery : sharedQuery;
  const rows = ownership === "yours" ? yours : shared;
  const visible = expanded[ownership] ? rows : rows.slice(0, 3);
  const unread = notifications.data?.unreadCount ?? 0;
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? "common.goodMorning"
      : hour >= 12 && hour < 17
        ? "common.goodAfternoon"
        : hour >= 17 && hour < 22
          ? "common.goodEvening"
          : "common.niceToSeeYou";
  const openRegistry = (registry: IRegistry | SharedRegistryOverview) => {
    if (ownership === "shared") {
      router.push({
        pathname: "/(protected)/registry/guest-view",
        params: { id: registry.id },
      });
    } else {
      select(registry.id);
      router.push({
        pathname: "/(protected)/registry/[id]",
        params: { id: registry.id },
      });
    }
  };
  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        testID="registry-overview"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={C.primary}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await refresh();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
      >
        <View style={styles.greeting}>
          <View style={styles.greetingCopy}>
            <CommerceText weight="medium" style={styles.greetingTitle}>
              {t(greeting, { name: getUserFirstName() })}
            </CommerceText>
            <CommerceText size="sm" style={styles.welcome}>
              {t("common.welcomeBack")}
            </CommerceText>
          </View>
          <Pressable
            testID="overview-notifications"
            accessibilityRole="button"
            accessibilityLabel={t("notifications.title")}
            onPress={() => router.push("/notifications")}
            style={styles.notification}
          >
            <Feather name="bell" size={23} color={C.ink} />
            {unread > 0 && (
              <View style={styles.badge}>
                <CommerceText size="xs" style={styles.badgeText}>
                  {unread > 99 ? "99+" : unread}
                </CommerceText>
              </View>
            )}
          </Pressable>
        </View>
        <View
          style={[
            styles.heading,
            (width < 350 || fontScale > 1.2) && styles.headingStacked,
          ]}
        >
          <CommerceText weight="medium" size="xl" style={styles.title}>
            {t("registryOverview.title")}
          </CommerceText>
          <Pressable
            testID="overview-create-registry"
            accessibilityRole="button"
            onPress={() => router.push("/(protected)/registry/create")}
            style={styles.create}
          >
            <Feather name="plus" size={15} color="white" />
            <CommerceText size="xs" weight="medium" style={styles.createText}>
              {t("home.createRegistry")}
            </CommerceText>
          </Pressable>
        </View>
        <View style={styles.ownership} accessibilityRole="tablist">
          {(["yours", "shared"] as const).map((tab) => {
            const countQuery = tab === "yours" ? ownQuery : sharedQuery;
            const count = tab === "yours" ? yours.length : shared.length;
            return (
              <Pressable
                key={tab}
                testID={`overview-ownership-${tab}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: ownership === tab }}
                onPress={() => setOwnership(tab)}
                style={[
                  styles.owner,
                  ownership === tab && styles.ownerSelected,
                ]}
              >
                <CommerceText
                  size="sm"
                  weight={ownership === tab ? "medium" : "regular"}
                  style={[
                    styles.ownerText,
                    ownership === tab && styles.ownerTextSelected,
                  ]}
                >
                  {t(`registryOverview.${tab}`)}
                </CommerceText>
                {countQuery.data && (
                  <CommerceText
                    size="xs"
                    style={[
                      styles.ownerText,
                      ownership === tab && styles.ownerTextSelected,
                    ]}
                  >
                    {count}
                  </CommerceText>
                )}
              </Pressable>
            );
          })}
        </View>
        {!query.data ? (
          query.isPending && query.fetchStatus !== "paused" ? (
            <ListSkeleton kind="registries" rows={3} />
          ) : (
            <HomeLoadState onRetry={() => void query.refetch()} />
          )
        ) : rows.length ? (
          <View style={styles.registryList}>
            {visible.map((registry) => (
              <RegistryOverviewCard
                key={registry.id}
                registry={registry}
                owned={ownership === "yours"}
                onOpen={() => openRegistry(registry)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title={t(
              ownership === "yours"
                ? "registry.noRegistries"
                : "registryOverview.noShared",
            )}
          />
        )}
        {rows.length > 3 && (
          <Pressable
            testID="overview-view-more"
            accessibilityRole="button"
            accessibilityState={{ expanded: expanded[ownership] }}
            onPress={() =>
              setExpanded((previous) => ({
                ...previous,
                [ownership]: !previous[ownership],
              }))
            }
            style={styles.viewMore}
          >
            <CommerceText size="xs" weight="medium" style={{ color: C.deep }}>
              {expanded[ownership]
                ? t("registryOverview.viewLess")
                : t("registryOverview.viewMore", { count: rows.length - 3 })}
            </CommerceText>
            <Feather
              name={expanded[ownership] ? "chevron-up" : "chevron-down"}
              size={14}
              color={C.deep}
            />
          </Pressable>
        )}
        <View style={styles.resourceTabs} accessibilityRole="tablist">
          {(["Activity", "Ideas", "Guides"] as const).map((tab) => (
            <Pressable
              key={tab}
              testID={`overview-resource-${tab.toLowerCase()}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: resource === tab }}
              onPress={() => setResource(tab)}
              style={[
                styles.resourceTab,
                resource === tab && styles.resourceSelected,
              ]}
            >
              <CommerceText
                size="sm"
                weight={resource === tab ? "medium" : "regular"}
                style={[
                  styles.resourceText,
                  resource === tab && styles.resourceTextSelected,
                ]}
              >
                {t(`registryOverview.${resourceLabels[tab]}`)}
              </CommerceText>
            </Pressable>
          ))}
        </View>
        {resource === "Activity" ? (
          <OverviewActivity registries={[...yours, ...shared]} />
        ) : resource === "Ideas" ? (
          <OverviewIdeas />
        ) : (
          <OverviewGuides />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.light.background },
  content: { paddingHorizontal: 20, paddingTop: 9, paddingBottom: 22 },
  greeting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 22,
  },
  greetingCopy: { flex: 1, minWidth: 0 },
  greetingTitle: { fontSize: 23, letterSpacing: -0.65 },
  welcome: { color: C.muted, fontSize: 13, marginTop: 3 },
  notification: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 2,
    end: 3,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "white", fontSize: 11, lineHeight: 15 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
    marginBottom: 9,
  },
  headingStacked: { flexDirection: "column", alignItems: "flex-start" },
  title: { fontSize: 21, letterSpacing: -0.6, flexShrink: 1 },
  create: {
    backgroundColor: C.primary,
    borderRadius: 30,
    minHeight: 40,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  createText: { color: "white" },
  ownership: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
    marginBottom: 13,
  },
  owner: {
    minHeight: 40,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  ownerSelected: { borderBottomColor: C.primary },
  ownerText: { color: C.muted, fontSize: 13 },
  ownerTextSelected: { color: C.deep },
  registryList: { gap: 9 },
  viewMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 38,
    marginTop: 3,
  },
  resourceTabs: {
    flexDirection: "row",
    backgroundColor: "#F5F2F0",
    borderRadius: 12,
    padding: 4,
    gap: 3,
    marginTop: 18,
    marginBottom: 8,
  },
  resourceTab: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  resourceSelected: { backgroundColor: "white" },
  resourceText: { color: C.muted, fontSize: 13, textAlign: "center" },
  resourceTextSelected: { color: C.ink },
});
