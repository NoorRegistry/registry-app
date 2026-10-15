import { CommerceText } from "@/components/Commerce";
import { ListSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors as C } from "@/constants/Colors";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { fetchOrder, fetchOrders } from "@/services/orders.service";
import {
  fetchSupportArticles,
  fetchSupportRequests,
  supportTopics,
} from "@/services/support.service";
import { getImageUrl, getUserSub } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import {
  Chevron,
  HelpHeader,
  RequestRow,
  styles,
  SupportButton,
  SupportInput,
  topicIcons,
} from "./components";
export default function HelpScreen() {
  const { t, i18n } = useTranslation();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const account = getUserSub();
  const [search, setSearch] = useState("");
  const orders = useQuery({
    queryKey: ["orders", account, "help", orderId],
    queryFn: async () =>
      orderId ? fetchOrder(orderId) : (await fetchOrders()).data[0] || null,
  });
  const requests = useQuery({
    queryKey: ["support", account, "recent"],
    queryFn: () => fetchSupportRequests(1, undefined, 3),
    refetchInterval: 30000,
  });
  const articles = useQuery({
    queryKey: ["support", account, "articles"],
    queryFn: fetchSupportArticles,
  });
  const refreshOrders = orders.refetch;
  const refreshRequests = requests.refetch;
  const refreshArticles = articles.refetch;
  const refresh = useCallback(
    () => Promise.all([refreshOrders(), refreshRequests(), refreshArticles()]),
    [refreshOrders, refreshRequests, refreshArticles],
  );
  useRefreshOnFocus(refresh);
  const order = orders.data;
  const ar = i18n.language.startsWith("ar");
  const results =
    articles.data?.filter((x) =>
      `${x.titleEn} ${x.titleAr} ${x.bodyEn} ${x.bodyAr}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
    ) || [];
  const contact = () =>
    router.push({ pathname: "/help/new", params: orderId ? { orderId } : {} });
  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      <HelpHeader
        title={t("profile.help")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/profile")
        }
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={requests.isRefetching}
            onRefresh={() => void refresh()}
            tintColor={C.primary}
          />
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F7F5F3",
            borderRadius: 10,
            paddingHorizontal: 13,
            gap: 8,
          }}
        >
          <Feather name="search" size={20} color={C.muted} />
          <SupportInput
            accessibilityLabel={t("support.search")}
            placeholder={t("support.search")}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            style={{ flex: 1, paddingHorizontal: 0 }}
          />
        </View>
        {search.trim() ? (
          <>
            <View style={styles.heading}>
              <CommerceText weight="bold" size="base">
                {t("support.results")}
              </CommerceText>
            </View>
            {articles.isPending && articles.fetchStatus !== "paused" ? (
              <ListSkeleton kind="orders" rows={3} />
            ) : articles.isError || articles.fetchStatus === "paused" ? (
              <Retry onPress={() => void articles.refetch()} />
            ) : results.length ? (
              results.map((a, i) => (
                <Pressable
                  accessibilityRole="button"
                  key={a.id}
                  onPress={() =>
                    router.push({
                      pathname: "/help/topic",
                      params: { topic: a.topic, article: a.id },
                    })
                  }
                  style={[styles.row, i < results.length - 1 && styles.divider]}
                >
                  <CommerceText style={{ flex: 1 }}>
                    {ar ? a.titleAr : a.titleEn}
                  </CommerceText>
                  <Chevron />
                </Pressable>
              ))
            ) : (
              <CommerceText style={{ paddingVertical: 24, color: C.muted }}>
                {t("support.noResults")}
              </CommerceText>
            )}
          </>
        ) : (
          <>
            {orders.isPending && orders.fetchStatus !== "paused" ? (
              <ListSkeleton kind="orders" rows={1} />
            ) : orders.isError || orders.fetchStatus === "paused" ? (
              <Retry onPress={() => void orders.refetch()} />
            ) : (
              order && (
                <>
                  <View style={styles.heading}>
                    <CommerceText weight="bold" size="base">
                      {t(orderId ? "support.order" : "support.latestOrder")}
                    </CommerceText>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: "/help/new",
                        params: { orderId: order.id, topic: "ORDERS" },
                      })
                    }
                    style={[styles.row, styles.divider]}
                  >
                    {order.items[0]?.image ? (
                      <Image
                        source={getImageUrl(order.items[0].image)}
                        style={{ width: 64, height: 64, borderRadius: 8 }}
                        contentFit="contain"
                      />
                    ) : (
                      <Feather name="package" size={30} color={C.deep} />
                    )}
                    <View style={{ flex: 1, gap: 4 }}>
                      <CommerceText weight="medium">
                        {order.reference}
                      </CommerceText>
                      <CommerceText size="xs" style={{ color: C.muted }}>
                        {t(`orders.status.${order.status}`)} ·{" "}
                        {t("cart.itemCount", {
                          count: order.items.reduce(
                            (n, item) => n + item.quantity,
                            0,
                          ),
                        })}
                      </CommerceText>
                      <CommerceText style={{ color: C.deep }}>
                        {t("support.getHelp")}
                      </CommerceText>
                    </View>
                    <Chevron />
                  </Pressable>
                </>
              )
            )}
            <View style={styles.heading}>
              <CommerceText weight="bold" size="base">
                {t("support.myRequests")}
              </CommerceText>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/help/requests")}
                style={{ padding: 8 }}
              >
                <CommerceText style={{ color: C.deep }}>
                  {t("support.seeAll")}
                </CommerceText>
              </Pressable>
            </View>
            {requests.isPending && requests.fetchStatus !== "paused" ? (
              <ListSkeleton kind="orders" rows={2} />
            ) : requests.isError || requests.fetchStatus === "paused" ? (
              <Retry onPress={() => void requests.refetch()} />
            ) : requests.data?.data.length ? (
              requests.data.data.map((r, i, all) => (
                <RequestRow
                  key={r.id}
                  request={r}
                  last={i === all.length - 1}
                  onPress={() =>
                    router.push({
                      pathname: "/help/[id]",
                      params: { id: r.id },
                    })
                  }
                />
              ))
            ) : (
              <CommerceText style={{ paddingVertical: 14, color: C.muted }}>
                {t("support.empty")}
              </CommerceText>
            )}
            <View style={styles.heading}>
              <CommerceText weight="bold" size="base">
                {t("support.browseTopics")}
              </CommerceText>
            </View>
            {supportTopics.map((topic, i) => (
              <Pressable
                accessibilityRole="button"
                key={topic}
                testID={`help-topic-${topic}`}
                onPress={() =>
                  router.push({ pathname: "/help/topic", params: { topic } })
                }
                style={[
                  styles.row,
                  i < supportTopics.length - 1 && styles.divider,
                ]}
              >
                <Feather name={topicIcons[topic]} size={22} color={C.ink} />
                <CommerceText style={{ flex: 1 }}>
                  {t(`support.topics.${topic}`)}
                </CommerceText>
                <Chevron />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <SupportButton
          contact
          title={t("support.contact")}
          testID="contact-support"
          onPress={contact}
        />
      </View>
    </SafeAreaView>
  );
}
export function Retry({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.empty}>
      <CommerceText>{t("support.loadError")}</CommerceText>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{ padding: 10 }}
      >
        <CommerceText style={{ color: C.deep }}>
          {t("notifications.retry")}
        </CommerceText>
      </Pressable>
    </View>
  );
}
