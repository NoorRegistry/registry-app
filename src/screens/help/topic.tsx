import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import { ListSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors as C } from "@/constants/Colors";
import {
  fetchSupportArticles,
  supportTopics,
  SupportTopic,
} from "@/services/support.service";
import { getUserSub } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles, SupportButton } from "./components";
import { Retry } from "./index";
export default function SupportTopicScreen() {
  const { topic: raw, article } = useLocalSearchParams<{
    topic: string;
    article?: string;
  }>();
  const topic = supportTopics.includes(raw as SupportTopic)
    ? (raw as SupportTopic)
    : "APP";
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(article);
  const articles = useQuery({
    queryKey: ["support", getUserSub(), "articles"],
    queryFn: fetchSupportArticles,
  });
  const rows = articles.data?.filter((a) => a.topic === topic) || [];
  const ar = i18n.language.startsWith("ar");
  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      <CommerceTopBar
        title={t(`support.topics.${topic}`)}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/help")
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {articles.isPending && articles.fetchStatus !== "paused" ? (
          <ListSkeleton kind="orders" />
        ) : articles.isError || articles.fetchStatus === "paused" ? (
          <Retry onPress={() => void articles.refetch()} />
        ) : rows.length ? (
          rows.map((a, i) => (
            <View key={a.id} style={i < rows.length - 1 && styles.divider}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: expanded === a.id }}
                onPress={() =>
                  setExpanded(expanded === a.id ? undefined : a.id)
                }
                style={styles.row}
              >
                <CommerceText weight="medium" style={{ flex: 1 }}>
                  {ar ? a.titleAr : a.titleEn}
                </CommerceText>
                <Ionicons
                  name={expanded === a.id ? "remove" : "add"}
                  size={20}
                  color={C.deep}
                />
              </Pressable>
              {expanded === a.id && (
                <CommerceText
                  selectable
                  style={{ color: C.muted, paddingBottom: 20, lineHeight: 25 }}
                >
                  {ar ? a.bodyAr : a.bodyEn}
                </CommerceText>
              )}
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <CommerceText style={{ color: C.muted }}>
              {t("support.noArticles")}
            </CommerceText>
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <SupportButton
          contact
          title={t("support.contact")}
          onPress={() =>
            router.push({ pathname: "/help/new", params: { topic } })
          }
        />
      </View>
    </SafeAreaView>
  );
}
