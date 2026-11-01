import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import { fetchGuidesHomeData } from "@/services/guides.service";
import {
  fetchFeaturedGifts,
  fetchRegistryActivity,
} from "@/services/home.service";
import type { SharedRegistryOverview } from "@/services/registries.service";
import { useNotificationNavigation } from "@/store/notifications";
import { useGlobalStore } from "@/store";
import type { IRegistry } from "@/types";
import {
  formatPrice,
  getEnArName,
  getImageUrl,
  getUserSub,
} from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { HomeLoadState } from "@/screens/home/components/shared";
import Toast from "react-native-toast-message";

const chevron = I18nManager.isRTL ? "chevron-left" : "chevron-right";

export function OverviewActivity({
  registries,
}: {
  registries: (IRegistry | SharedRegistryOverview)[];
}) {
  const { t, i18n } = useTranslation();
  const setPending = useNotificationNavigation((state) => state.setPending);
  const selectRegistry = useGlobalStore((state) => state.setSelectedRegistryId);
  const query = useQuery({
    queryKey: ["home", getUserSub(), i18n.language, "activity", "overview"],
    queryFn: ({ signal }) => fetchRegistryActivity(undefined, 4, signal),
    staleTime: 15000,
  });
  if (!query.data)
    return (
      <HomeLoadState
        loading={query.isPending && query.fetchStatus !== "paused"}
        onRetry={() => void query.refetch()}
      />
    );
  if (!query.data.data.length)
    return <EmptyState title={t("homeDesign.noActivity")} />;
  return (
    <View>
      {query.data.data.map((item, index) => {
        const registry = registries.find((r) => r.id === item.data.registryId);
        const product =
          item.product && getEnArName(item.product.nameEn, item.product.nameAr);
        const minutes = Math.max(
          0,
          (query.dataUpdatedAt - new Date(item.createdAt).getTime()) / 60000,
        );
        const relative = !Number.isFinite(minutes)
          ? ""
          : minutes < 1
            ? t("registryOverview.justNow")
            : minutes < 60
              ? t("registryOverview.minutesAgo", { count: Math.floor(minutes) })
              : minutes < 1440
                ? t("registryOverview.hoursAgo", {
                    count: Math.floor(minutes / 60),
                  })
                : minutes < 2880
                  ? t("registryOverview.yesterday")
                  : t("registryOverview.daysAgo", {
                      count: Math.floor(minutes / 1440),
                    });
        const shared = item.type === "REGISTRY_SHARED";
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => {
              if (item.type === "REGISTRY_PURCHASE" && item.data.registryId)
                selectRegistry(item.data.registryId);
              setPending(item.data);
            }}
            style={[styles.activityRow, index > 0 && styles.divider]}
          >
            <View style={styles.activitySymbol}>
              <Feather
                name={shared ? "users" : "gift"}
                size={18}
                color={C.deep}
              />
            </View>
            <View style={styles.copy}>
              <CommerceText size="xs" weight="medium">
                {shared
                  ? t("homeDesign.sharedBy", {
                      name: item.actorName || t("friends.member"),
                    })
                  : t("registryOverview.giftPurchased")}
              </CommerceText>
              {!!product && (
                <CommerceText size="xs" style={{ marginTop: 1 }}>
                  {product}
                </CommerceText>
              )}
              <CommerceText size="xs" style={styles.meta}>
                {[registry?.title, relative].filter(Boolean).join(" · ")}
              </CommerceText>
            </View>
            <Feather name={chevron} size={16} color={C.muted} />
          </Pressable>
        );
      })}
      {!!query.data.nextCursor && (
        <TextAction
          label={t("homeDesign.seeAll")}
          onPress={() => router.push("/registry/activity")}
        />
      )}
    </View>
  );
}

export function OverviewIdeas() {
  const { t, i18n } = useTranslation();
  const query = useQuery({
    queryKey: [
      "home",
      getUserSub(),
      i18n.language,
      "gifts",
      "registry-overview",
    ],
    queryFn: ({ signal }) => fetchFeaturedGifts(1, 4, signal),
    staleTime: 30000,
  });
  if (!query.data)
    return (
      <HomeLoadState
        loading={query.isPending && query.fetchStatus !== "paused"}
        onRetry={() => void query.refetch()}
      />
    );
  if (!query.data.data.length)
    return <EmptyState title={t("homeDesign.noFeatured")} />;
  return (
    <View>
      <View style={styles.ideas}>
        {query.data.data.map((product) => (
          <Pressable
            key={product.id}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/(protected)/products/[id]",
                params: { id: product.id },
              })
            }
            style={styles.product}
          >
            <View style={styles.productImage}>
              {product.images?.[0]?.path ? (
                <Image
                  source={getImageUrl(product.images[0].path)}
                  style={StyleSheet.absoluteFill}
                  contentFit="contain"
                />
              ) : (
                <Feather name="gift" size={28} color={C.deep} />
              )}
            </View>
            <CommerceText size="sm" weight="medium" numberOfLines={2}>
              {getEnArName(product.nameEn, product.nameAr)}
            </CommerceText>
            <CommerceText size="xs" style={styles.meta}>
              {formatPrice(product.price, product.currencyCode)}
            </CommerceText>
          </Pressable>
        ))}
      </View>
      <TextAction
        label={t("homeDesign.allFeaturedGifts")}
        onPress={() => router.push("/featured-gifts")}
      />
    </View>
  );
}

export function OverviewGuides() {
  const { t, i18n } = useTranslation();
  const query = useQuery({
    queryKey: ["guides", "home", i18n.language],
    queryFn: fetchGuidesHomeData,
  });
  if (!query.data)
    return (
      <HomeLoadState
        loading={query.isPending && query.fetchStatus !== "paused"}
        onRetry={() => void query.refetch()}
      />
    );
  const guides = Array.from(
    new Map(
      query.data
        .flatMap((category) => category.guides)
        .map((guide) => [guide.id, guide]),
    ).values(),
  );
  if (!guides.length)
    return <EmptyState title={t("registryOverview.noGuides")} />;
  return (
    <View>
      {guides.map((guide, index) => (
        <Pressable
          key={guide.id}
          accessibilityRole="link"
          onPress={async () => {
            try {
              const base = process.env.EXPO_PUBLIC_GUIDES_URL;
              if (!base) throw new Error("Guide URL is not configured");
              const url = `${base.replace(/\/$/, "")}/${guide.url.replace(/^\//, "")}`;
              if (Platform.OS === "web") await Linking.openURL(url);
              else
                await WebBrowser.openBrowserAsync(url, {
                  enableBarCollapsing: true,
                  showTitle: true,
                });
            } catch {
              Toast.show({
                type: "error",
                text1: t("registryOverview.guideError"),
              });
            }
          }}
          style={[styles.guide, index > 0 && styles.divider]}
        >
          <Feather name="book-open" size={20} color={C.deep} />
          <CommerceText size="sm" style={styles.copy}>
            {getEnArName(guide.nameEn, guide.nameAr)}
          </CommerceText>
          <Feather name={chevron} size={16} color={C.muted} />
        </Pressable>
      ))}
    </View>
  );
}

export function EmptyState({ title }: { title: string }) {
  return (
    <CommerceText size="sm" style={styles.empty}>
      {title}
    </CommerceText>
  );
}
function TextAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.textAction}
    >
      <CommerceText size="xs" style={{ color: C.deep }}>
        {label}
      </CommerceText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  copy: { flex: 1, minWidth: 0 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
  },
  activitySymbol: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { color: C.muted, fontSize: 11, marginTop: 4 },
  divider: { borderTopColor: C.line, borderTopWidth: StyleSheet.hairlineWidth },
  ideas: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  product: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: 0,
    marginBottom: 8,
  },
  productImage: {
    height: 118,
    backgroundColor: C.soft,
    borderRadius: 13,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  guide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 18,
  },
  textAction: { paddingVertical: 12, alignItems: "center", minHeight: 44 },
  empty: { color: C.muted, paddingVertical: 24 },
});
