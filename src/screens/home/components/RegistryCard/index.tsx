import { CommerceText } from "@/components/Commerce";
import RegistryAvatar from "@/components/RegistryAvatar";
import { BrandColors as C } from "@/constants/Colors";
import { useRegistrySelection } from "@/hooks/useRegistrySelection";
import { fetchRegistries } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { IRegistry } from "@/types";
import { formatEventDate } from "@/utils/event-date";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ReduceMotion, useSharedValue } from "react-native-reanimated";
import { Carousel, CarouselRef } from "react-native-reanimated-carousel";
import RegistrySkeleton from "./RegistryCardSkeleton";
import { paginationWindow, selectedRegistryFirst } from "./pagination";
import PaginationDot from "./PaginationDot";
import { HomeLoadState } from "../shared";

export default function RegistryCard() {
  const { t } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const query = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });
  const selected = useRegistrySelection(query.data);
  const registries = useMemo(
    () =>
      selectedRegistryFirst(
        (query.data ?? []).filter((row) => row.isActive !== false),
        selected?.id,
      ),
    [query.data, selected?.id],
  );
  return (
    <View
      style={styles.section}
      onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
    >
      {!query.data && query.isPending && query.fetchStatus !== "paused" ? (
        <RegistrySkeleton />
      ) : !query.data && (query.isError || query.fetchStatus === "paused") ? (
        <View testID="home-registries-retry">
          <HomeLoadState onRetry={() => void query.refetch()} />
        </View>
      ) : registries.length && width > 0 ? (
        <RegistryCarousel
          key={`${selected?.id}:${registries.map((row) => row.id).join(",")}:${width}`}
          registries={registries}
          width={width}
          height={Math.max(228, 102 + 126 * fontScale)}
        />
      ) : query.data && !registries.length ? (
        <Pressable
          testID="home-create-registry"
          accessibilityRole="button"
          onPress={() => router.push("/(protected)/registry/create")}
          style={styles.empty}
        >
          <Feather name="plus-circle" size={23} color={C.deep} />
          <CommerceText weight="medium" style={{ color: C.deep }}>
            {t("home.createRegistry")}
          </CommerceText>
        </Pressable>
      ) : null}
    </View>
  );
}

function RegistryCarousel({
  registries,
  width,
  height,
}: {
  registries: IRegistry[];
  width: number;
  height: number;
}) {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(0);
  const progress = useSharedValue(0);
  const ref = useRef<CarouselRef>(null);
  const select = useGlobalStore((state) => state.setSelectedRegistryId);
  const previousIcon = I18nManager.isRTL ? "chevron-right" : "chevron-left";
  const nextIcon = I18nManager.isRTL ? "chevron-left" : "chevron-right";
  const open = (registry: IRegistry) => {
    select(registry.id);
    router.push({
      pathname: "/(protected)/registry/[id]",
      params: { id: registry.id },
    });
  };
  const renderRegistry = (registry: IRegistry) => {
    const total = registry._count.totalItems;
    const purchased = registry._count.totalPurchased;
    const percentage = total
      ? Math.min(100, Math.max(0, (purchased / total) * 100))
      : 0;
    const date = formatEventDate(registry.eventDate, i18n?.language ?? "en");
    const category =
      registry.category?.name ||
      (i18n?.language === "ar"
        ? registry.category?.nameAr
        : registry.category?.nameEn);
    return (
      <View
        style={[
          styles.registry,
          { minHeight: height, marginEnd: registries.length > 1 ? 10 : 0 },
        ]}
      >
        <View style={styles.cardHeading}>
          <CommerceText
            size="xs"
            weight="medium"
            style={{ color: C.deep, letterSpacing: 2, flex: 1 }}
          >
            {t("homeDesign.yourRegistry")}
          </CommerceText>
          {registries.length > 1 && (
            <View style={styles.controls}>
              <CommerceText size="xs" style={{ color: C.muted }}>
                {active + 1}/{registries.length}
              </CommerceText>
              {[-1, 1].map((direction) => (
                <Pressable
                  key={direction}
                  testID={
                    direction < 0
                      ? "home-registry-previous"
                      : "home-registry-next"
                  }
                  accessibilityRole="button"
                  accessibilityLabel={t(
                    direction < 0
                      ? "homeDesign.previousRegistry"
                      : "homeDesign.nextRegistry",
                  )}
                  disabled={
                    direction < 0
                      ? active === 0
                      : active === registries.length - 1
                  }
                  onPress={() => {
                    ref.current?.scrollTo({
                      index: active + direction,
                      animated: true,
                    });
                  }}
                  style={{
                    padding: 9,
                    opacity: (
                      direction < 0
                        ? active === 0
                        : active === registries.length - 1
                    )
                      ? 0.3
                      : 1,
                  }}
                >
                  <Feather
                    name={direction < 0 ? previousIcon : nextIcon}
                    size={20}
                    color={C.ink}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <Pressable
          testID={`home-registry-${registry.id}`}
          accessibilityRole="button"
          accessibilityLabel={registry.title}
          onPress={() => open(registry)}
        >
          <View style={styles.identity}>
            <RegistryAvatar
              title={registry.title}
              logo={registry.logo}
              category={registry.category}
              size={58}
              radius={10}
            />
            <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
              <CommerceText size="xl" weight="medium" numberOfLines={1}>
                {registry.title}
              </CommerceText>
              {!!(category || date) && (
                <CommerceText
                  size="sm"
                  style={{ color: C.muted }}
                  numberOfLines={1}
                >
                  {[category, date].filter(Boolean).join(" · ")}
                </CommerceText>
              )}
            </View>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={t("homeDesign.giftsPurchased")}
            accessibilityValue={{
              min: 0,
              max: Math.max(total, 1),
              now: purchased,
            }}
            style={styles.progress}
          >
            <View
              style={{
                height: 5,
                borderRadius: 4,
                backgroundColor: C.primary,
                width: `${percentage}%`,
              }}
            />
          </View>
          <View style={styles.counts}>
            <CommerceText size="xs" style={{ color: C.muted }}>
              {t("homeDesign.giftCount", { count: total })}
            </CommerceText>
            <CommerceText size="xs" style={{ color: C.muted }}>
              {t("home.registryPurchased", { count: purchased })}
            </CommerceText>
          </View>
          <View style={styles.open}>
            <CommerceText size="sm" weight="medium" style={{ color: "white" }}>
              {t("homeDesign.openRegistry")}
            </CommerceText>
            <Feather
              name={I18nManager.isRTL ? "arrow-up-left" : "arrow-up-right"}
              color="white"
              size={17}
            />
          </View>
        </Pressable>
      </View>
    );
  };
  return (
    <>
      {registries.length === 1 ? (
        renderRegistry(registries[0])
      ) : (
        <Carousel
          testID="home-registry-carousel"
          ref={ref}
          data={registries}
          keyExtractor={(registry) => registry.id}
          itemSize={width - 12}
          progress={progress}
          loop={false}
          snapMode="page"
          style={{ width, height }}
          animation={{
            type: "timing",
            duration: 280,
            reduceMotion: ReduceMotion.System,
          }}
          onConfigurePanGesture={(gesture) =>
            gesture.activeOffsetX([-12, 12]).failOffsetY([-10, 10])
          }
          onSnapToItem={setActive}
          renderItem={({ item }) => renderRegistry(item)}
        />
      )}
      {registries.length > 1 && (
        <View testID="home-registry-pagination" style={styles.dots}>
          {paginationWindow(registries.length, active).map(
            ({ index, small }) => (
              <Pressable
                key={registries[index].id}
                testID={`home-registry-dot-${index}`}
                accessibilityRole="button"
                accessibilityLabel={t("home.registryPage", {
                  current: String(index + 1),
                  total: String(registries.length),
                })}
                accessibilityState={{ selected: index === active }}
                onPress={() => ref.current?.scrollTo({ index, animated: true })}
                style={styles.dotTarget}
              >
                <PaginationDot
                  index={index}
                  small={small}
                  progress={progress}
                />
              </Pressable>
            ),
          )}
        </View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  registry: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: C.soft,
    justifyContent: "center",
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 25,
    marginBottom: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    marginEnd: -8,
    marginTop: -7,
    marginBottom: -7,
  },
  identity: { flexDirection: "row", alignItems: "center", gap: 14 },
  progress: {
    height: 5,
    borderRadius: 4,
    backgroundColor: "#EADFD9",
    marginTop: 14,
    overflow: "hidden",
  },
  counts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 8,
  },
  open: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: C.primary,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 14,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },
  dotTarget: {
    width: 24,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: C.soft,
    padding: 22,
    borderRadius: 20,
    alignItems: "center",
  },
});
