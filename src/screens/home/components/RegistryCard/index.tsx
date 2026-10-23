import { CommerceText } from "@/components/Commerce";
import RegistryAvatar from "@/components/RegistryAvatar";
import { BrandColors as C } from "@/constants/Colors";
import { useRegistrySelection } from "@/hooks/useRegistrySelection";
import { fetchRegistries } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { IRegistry } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
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
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useSharedValue,
} from "react-native-reanimated";
import { Carousel, CarouselRef } from "react-native-reanimated-carousel";
import RegistrySkeleton from "./RegistryCardSkeleton";
import { paginationWindow, selectedRegistryFirst } from "./pagination";
import PaginationDot from "./PaginationDot";

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
    () => selectedRegistryFirst(query.data ?? [], selected?.id),
    [query.data, selected?.id],
  );
  return (
    <View style={styles.section}>
      {!query.data && query.isPending && query.fetchStatus !== "paused" ? (
        <RegistrySkeleton />
      ) : (
        <>
          <View style={styles.actions}>
            <Pressable
              testID="home-my-registries"
              accessibilityRole="button"
              onPress={() => router.push("/(protected)/(tabs)/registry")}
              style={[styles.action, { backgroundColor: C.soft }]}
            >
              <Feather name="gift" size={29} color={C.ink} />
              <CommerceText
                weight="medium"
                size="base"
                style={styles.actionLabel}
              >
                {t("home.myRegistries")}
              </CommerceText>
            </Pressable>
            <Pressable
              testID="home-create-registry"
              accessibilityRole="button"
              onPress={() => router.push("/(protected)/registry/create")}
              style={styles.action}
            >
              <LinearGradient
                colors={["#D78A70", C.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Feather name="plus-circle" size={29} color="white" />
              <CommerceText
                weight="medium"
                size="base"
                style={[styles.actionLabel, { color: "white" }]}
              >
                {t("home.createRegistry")}
              </CommerceText>
            </Pressable>
          </View>
          <View
            onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
          >
            {!query.data &&
            (query.isError || query.fetchStatus === "paused") ? (
              <Pressable
                testID="home-registries-retry"
                accessibilityRole="button"
                onPress={() => void query.refetch()}
                style={styles.retry}
              >
                <CommerceText style={{ color: C.muted }}>
                  {t("registry.loadError")}
                </CommerceText>
                <CommerceText weight="medium" style={{ color: C.deep }}>
                  {t("friends.retry")}
                </CommerceText>
              </Pressable>
            ) : registries.length > 0 && width > 0 ? (
              <RegistryCarousel
                // A new selection, deletion or viewport size starts with the selected registry.
                key={`${selected?.id}:${registries.map(({ id }) => id).join(",")}:${width}`}
                registries={registries}
                width={width}
                height={Math.max(92, 28 + 64 * fontScale)}
              />
            ) : null}
          </View>
        </>
      )}
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
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const progress = useSharedValue(0);
  const ref = useRef<CarouselRef>(null);
  const select = useGlobalStore((state) => state.setSelectedRegistryId);
  const open = (registry: IRegistry) => {
    select(registry.id);
    router.push("/(protected)/(tabs)/registry");
  };
  const renderRegistry = (registry: IRegistry) => (
    <Pressable
      testID={`home-registry-${registry.id}`}
      accessibilityRole="button"
      onPress={() => open(registry)}
      style={[styles.registry, { minHeight: height }]}
    >
      <RegistryAvatar title={registry.title} logo={registry.logo} size={62} />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <CommerceText size="base" weight="bold" numberOfLines={1}>
          {registry.title}
        </CommerceText>
        <CommerceText style={{ color: C.muted }} numberOfLines={2}>
          {t("home.registryItems", { count: registry._count.totalItems })}
          {" · "}
          {t("home.registryPurchased", {
            count: registry._count.totalPurchased,
          })}
        </CommerceText>
      </View>
      <Feather
        name={I18nManager.isRTL ? "chevron-left" : "chevron-right"}
        size={23}
        color={C.muted}
      />
    </Pressable>
  );
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
          itemSize={width}
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
              <Animated.View
                key={registries[index].id}
                entering={FadeIn.duration(180).reduceMotion(
                  ReduceMotion.System,
                )}
                exiting={FadeOut.duration(120).reduceMotion(
                  ReduceMotion.System,
                )}
                layout={LinearTransition.springify()
                  .damping(24)
                  .stiffness(260)
                  .reduceMotion(ReduceMotion.System)}
              >
                <Pressable
                  testID={`home-registry-dot-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={t("home.registryPage", {
                    current: String(index + 1),
                    total: String(registries.length),
                  })}
                  accessibilityState={{ selected: index === active }}
                  onPress={() =>
                    ref.current?.scrollTo({ index, animated: true })
                  }
                  style={styles.dotTarget}
                >
                  <PaginationDot
                    index={index}
                    small={small}
                    progress={progress}
                  />
                </Pressable>
              </Animated.View>
            ),
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    paddingTop: 12,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
  },
  actions: { flexDirection: "row", gap: 10, marginBottom: 10 },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: 88,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  actionLabel: { textAlign: "center" },
  registry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dotTarget: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  retry: { gap: 6, paddingVertical: 20, alignItems: "center" },
});
