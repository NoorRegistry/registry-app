import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import { useTranslation } from "react-i18next";
import { BrandColors } from "@/constants/Colors";
import Typography from "@/components/Typography";
import { useHeaderScrollState } from "@/hooks/useHeaderScrollState";
import { fetchRegistries, fetchRegistry } from "@/services/registries.service";
import { useRegistrySelection } from "@/hooks/useRegistrySelection";
import { CommerceText } from "@/components/Commerce";
import { IRegistryDetails } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import RegistryFiltersSheet from "./components/RegistryFiltersSheet";
import {
  filterRegistryRows,
  registryRows,
  RegistryFilter,
  RegistrySort,
  RegistryRow,
} from "./items";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import RegistryCard from "../home/components/RegistryCard";
import RegistryHeader from "./components/RegistryHeader";
import RegistryItem from "./components/RegistryItem";

function RegistryScreen() {
  const { t } = useTranslation();
  const registriesQuery = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });

  const registries = registriesQuery.data;
  const selected = useRegistrySelection(registries);
  const detailsQuery = useQuery({
    queryKey: ["registryById", selected?.id],
    queryFn: () => fetchRegistry(selected!.id),
    enabled: !!selected,
  });
  const registryDetails = detailsQuery.data;
  const loading =
    (!registries &&
      registriesQuery.isPending &&
      registriesQuery.fetchStatus !== "paused") ||
    (!!selected &&
      !registryDetails &&
      detailsQuery.isPending &&
      detailsQuery.fetchStatus !== "paused");
  if (loading) return <ScreenSkeleton kind="registry" />;
  if (registries?.length === 0) return <RegistryCard />;
  if (!registryDetails) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <Typography.Text>{t("registry.loadError")}</Typography.Text>
        <Pressable
          testID="registry-retry"
          accessibilityRole="button"
          onPress={async () => {
            const refreshed = await registriesQuery.refetch();
            if (refreshed.data?.some(({ id }) => id === selected?.id))
              await detailsQuery.refetch();
          }}
        >
          <Typography.Text
            weight="medium"
            style={{ color: BrandColors.primary }}
          >
            {t("notifications.retry")}
          </Typography.Text>
        </Pressable>
      </View>
    );
  }

  return (
    <RegistryContent
      key={registryDetails.id}
      registry={registryDetails}
      onRefresh={async () => {
        await Promise.all([registriesQuery.refetch(), detailsQuery.refetch()]);
      }}
    />
  );
}

function RegistryContent({
  registry,
  onRefresh,
}: {
  registry: IRegistryDetails;
  onRefresh: () => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const handleScroll = useHeaderScrollState();
  const [filter, setFilter] = useState<RegistryFilter>("all");
  const [categoryId, setCategory] = useState("");
  const [sort, setSort] = useState<RegistrySort>("default");
  const [refreshing, setRefreshing] = useState(false);
  const sheet = useRef<BottomSheetModal>(null);
  const all = useMemo(() => registryRows(registry), [registry]);
  const categories = useMemo(
    () =>
      Array.from(
        new Map(all.map((row) => [row.category.id, row.category])).values(),
      ),
    [all],
  );
  const visible = useMemo(
    () => filterRegistryRows(all, filter, categoryId, sort, i18n.language),
    [all, filter, categoryId, sort, i18n.language],
  );
  type ListRow =
    | { kind: "controls"; id: string }
    | { kind: "empty"; id: string }
    | { kind: "item"; id: string; item: RegistryRow };
  const rows = useMemo<ListRow[]>(
    () => [
      { kind: "controls", id: "controls" },
      ...visible.map((item) => ({ kind: "item" as const, id: item.id, item })),
      ...(!visible.length ? [{ kind: "empty" as const, id: "empty" }] : []),
    ],
    [visible],
  );
  const filtered = Boolean(categoryId || sort !== "default");
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        testID="owner-registry-list"
        data={rows}
        keyExtractor={(row) => row.id}
        stickyHeaderIndices={[1]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={<RegistryHeader registry={registry} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={BrandColors.primary}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await onRefresh();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
        renderItem={({ item, index }) =>
          item.kind === "controls" ? (
            <View style={styles.controls}>
              <View style={{ flex: 1, flexDirection: "row", gap: 2 }}>
                {(["all", "unpurchased", "purchased"] as const).map((value) => (
                  <Pressable
                    key={value}
                    testID={`registry-tab-${value}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: value === filter }}
                    onPress={() => setFilter(value)}
                    style={[
                      styles.tab,
                      {
                        flex:
                          value === "all"
                            ? 0.75
                            : value === "unpurchased"
                              ? 1.35
                              : 1.2,
                      },
                      value === filter && { backgroundColor: "#F8EAE5" },
                    ]}
                  >
                    <CommerceText
                      numberOfLines={2}
                      size="sm"
                      style={{
                        color:
                          filter === value
                            ? BrandColors.deep
                            : BrandColors.muted,
                        textAlign: "center",
                      }}
                    >
                      {t(`registry.tabs.${value}`)}
                    </CommerceText>
                  </Pressable>
                ))}
              </View>
              <Pressable
                testID="registry-filters"
                accessibilityRole="button"
                accessibilityLabel={t("registry.filterItems")}
                accessibilityState={{ selected: filtered }}
                onPress={() => sheet.current?.present()}
                style={styles.filter}
              >
                <Feather
                  name="sliders"
                  size={21}
                  color={filtered ? BrandColors.primary : BrandColors.ink}
                />
                {filtered && (
                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      end: 3,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: BrandColors.primary,
                    }}
                  />
                )}
              </Pressable>
            </View>
          ) : item.kind === "item" ? (
            <RegistryItem
              registryItem={item.item}
              filter={filter}
              divider={index < rows.length - 1}
            />
          ) : (
            <CommerceText
              style={{
                textAlign: "center",
                color: BrandColors.muted,
                padding: 32,
              }}
            >
              {t(all.length ? "common.noResultsFound" : "registry.emptyItems")}
            </CommerceText>
          )
        }
        contentContainerStyle={{ paddingBottom: 12 }}
      />
      <View style={styles.footer}>
        <Pressable
          testID="registry-add-items"
          accessibilityRole="button"
          onPress={() => router.navigate("/(protected)/(tabs)/shop")}
          style={styles.add}
        >
          <LinearGradient
            colors={["#D18A72", BrandColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Feather name="plus" size={23} color="white" />
          <CommerceText size="base" style={{ color: "white" }}>
            {t("registry.addItems")}
          </CommerceText>
        </Pressable>
      </View>
      <RegistryFiltersSheet
        ref={sheet}
        categories={categories}
        categoryId={categoryId}
        sort={sort}
        onCategory={setCategory}
        onSort={setSort}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    paddingHorizontal: 5,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  filter: {
    width: 34,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BrandColors.line,
    backgroundColor: "white",
  },
  add: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
    borderRadius: 9,
    paddingVertical: 10,
  },
});
export default RegistryScreen;
