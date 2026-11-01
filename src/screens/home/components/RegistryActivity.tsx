import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import {
  fetchRegistryActivity,
  RegistryActivityItem,
} from "@/services/home.service";
import { useNotificationNavigation } from "@/store/notifications";
import { getEnArName, getUserSub } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";
import { HomeLoadState, HomeSectionHeading, homeStyles } from "./shared";

export function ActivityRow({
  item,
  last = false,
}: {
  item: RegistryActivityItem;
  last?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const setPending = useNotificationNavigation((state) => state.setPending);
  const name = item.actorName?.trim();
  const initial = name
    ?.split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase();
  const title =
    item.type === "REGISTRY_PURCHASE"
      ? name
        ? t("homeDesign.purchaseBy", { name })
        : t("homeDesign.purchase")
      : t("homeDesign.sharedBy", { name: name || t("friends.member") });
  const product = item.product
    ? getEnArName(item.product.nameEn, item.product.nameAr)
    : "";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setPending(item.data)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        borderBottomColor: C.line,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: C.soft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {initial ? (
          <CommerceText weight="medium" style={{ color: C.deep }}>
            {initial}
          </CommerceText>
        ) : (
          <Feather name="gift" size={20} color={C.deep} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <CommerceText size="sm" numberOfLines={2}>
          {title}
        </CommerceText>
        <CommerceText size="xs" numberOfLines={2} style={{ color: C.muted }}>
          {[
            product,
            new Date(item.createdAt).toLocaleString(i18n.language, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
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
  );
}
export default function RegistryActivity() {
  const { t, i18n } = useTranslation();
  const query = useQuery({
    queryKey: ["home", getUserSub(), i18n.language, "activity"],
    queryFn: ({ signal }) => fetchRegistryActivity(undefined, 2, signal),
    staleTime: 15000,
  });
  if (query.data && !query.data.data.length) return null;
  return (
    <View style={homeStyles.section}>
      <HomeSectionHeading
        title={t("homeDesign.activity")}
        onSeeAll={() => router.push("/registry/activity")}
      />
      {query.data ? (
        query.data.data.map((item, index) => (
          <ActivityRow
            key={item.id}
            item={item}
            last={index === query.data.data.length - 1}
          />
        ))
      ) : (
        <HomeLoadState
          loading={query.isPending && query.fetchStatus !== "paused"}
          onRetry={() => void query.refetch()}
        />
      )}
    </View>
  );
}
