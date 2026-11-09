import RegistryAccessGate from "./RegistryAccessGate";
import GuestPurchaseSheet, {
  GuestPurchaseSheetHandle,
} from "./GuestPurchaseSheet";
import { saveRegistryReturn } from "@/utils/auth-return";
import { useGlobalStore } from "@/store";
import { IApiError } from "@/api/http";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import RegistryAvatar from "@/components/RegistryAvatar";
import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import { fetchRegistryGuestView } from "@/services/registries.service";
import { IRegistryDetails, IRegistryItem } from "@/types";
import {
  formatPrice,
  clearSessionData,
  getDecodedToken,
  getEnArName,
  getImageUrl,
  getUserSub,
} from "@/utils/helper";
import {
  dismissRegistryOrderGift,
  registryOrderGifts,
} from "@/utils/registry-purchase-context";
import Feather from "@expo/vector-icons/Feather";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RegistryFiltersSheet from "../components/RegistryFiltersSheet";
import {
  filterRegistryRows,
  registryRows,
  RegistryFilter,
  RegistryRow,
  RegistrySort,
} from "../items";

export default function GuestViewScreen({
  onHeaderTitleChange,
}: {
  onHeaderTitleChange?: (title: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{
    id?: string;
    purchaseItemId?: string;
    orderId?: string;
  }>();
  const registryId = params.id;
  const viewerId = getDecodedToken()?.user?.id;
  const [showTitle, setShowTitle] = useState(false);
  const [filter, setFilter] = useState<RegistryFilter>("all");
  const [categoryId, setCategory] = useState("");
  const [sort, setSort] = useState<RegistrySort>("default");
  const filters = useRef<BottomSheetModal>(null);
  const purchaseSheet = useRef<GuestPurchaseSheetHandle>(null);
  const [selection, setSelection] = useState<{
    item: IRegistryItem;
    orderId?: string;
    quantity?: number;
  } | null>(null);
  const [handledPrompt, setHandledPrompt] = useState("");
  const {
    data: registry,
    refetch,
    isFetching,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["registryGuestView", viewerId, registryId],
    queryFn: () => fetchRegistryGuestView(registryId!),
    enabled: !!registryId,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
  useRefreshOnFocus(refetch);
  useEffect(() => {
    if (
      isError &&
      (error as unknown as IApiError)?.status === 401 &&
      registryId
    ) {
      saveRegistryReturn(registryId);
      clearSessionData();
      useGlobalStore.getState().signOut();
      router.replace("/login");
    }
  }, [error, isError, registryId]);
  useEffect(() => {
    onHeaderTitleChange?.(
      showTitle && registry && !isError && !isFetching ? registry.title : "",
    );
    return () => onHeaderTitleChange?.("");
  }, [onHeaderTitleChange, registry, showTitle, isError, isFetching]);
  if ((isFetching || isError) && selection) setSelection(null);
  const promptKey = `${registryId}:${params.orderId}:${params.purchaseItemId}`;
  const activeSelection = useMemo(() => {
    if (!registry || isFetching || isError || registry.isOwner !== false)
      return null;
    if (selection) return selection;
    if (
      !params.orderId ||
      !params.purchaseItemId ||
      handledPrompt === promptKey
    )
      return null;
    const gift = registryOrderGifts(getUserSub(), params.orderId).find(
      (entry) =>
        entry.registryId === registryId &&
        entry.itemId === params.purchaseItemId,
    );
    if (!gift) return null;
    const item = registry.registryItems.items
      .flatMap((section) => section.data)
      .find(
        (entry) =>
          entry.id === gift.itemId &&
          entry.product.id === gift.productId &&
          entry.qtyLeft > 0,
      );
    return item
      ? {
          item,
          orderId: params.orderId,
          quantity: Math.min(gift.quantity, item.qtyLeft),
        }
      : null;
  }, [
    registry,
    isFetching,
    isError,
    selection,
    params.orderId,
    params.purchaseItemId,
    registryId,
    handledPrompt,
    promptKey,
  ]);
  useEffect(() => {
    if (activeSelection) purchaseSheet.current?.present();
  }, [activeSelection]);
  const all = useMemo(
    () => (registry ? registryRows(registry) : []),
    [registry],
  );
  const visible = useMemo(
    () => filterRegistryRows(all, filter, categoryId, sort, i18n.language),
    [all, filter, categoryId, sort, i18n.language],
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Map(all.map((row) => [row.category.id, row.category])).values(),
      ),
    [all],
  );
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) =>
      setShowTitle(event.nativeEvent.contentOffset.y > 120),
    [],
  );
  if (!registryId)
    return (
      <View style={styles.empty}>
        <CommerceText>{t("common.error")}</CommerceText>
      </View>
    );
  // Hide cached contents while revalidating private registry access.
  if (isLoading || isFetching) return <ScreenSkeleton kind="registry" />;
  if (isError)
    return (
      <RegistryAccessGate
        access={(error as unknown as IApiError).access}
        retry={() => void refetch()}
      />
    );
  if (!registry)
    return (
      <View style={styles.empty}>
        <CommerceText>{t("common.error")}</CommerceText>
      </View>
    );
  const rows: (
    | { kind: "controls"; id: string }
    | { kind: "item"; id: string; item: RegistryRow }
    | { kind: "empty"; id: string }
  )[] = [
    { kind: "controls", id: "controls" },
    ...visible.map((item) => ({ kind: "item" as const, id: item.id, item })),
    ...(!visible.length ? [{ kind: "empty" as const, id: "empty" }] : []),
  ];
  const purchasedByYou = new Set(
    registry.purchased.items.flatMap((section) =>
      section.data.filter((item) => item.purchasedByYou).map((item) => item.id),
    ),
  );
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["bottom"]}
    >
      <FlatList
        testID="guest-registry-list"
        data={rows}
        keyExtractor={(row) => row.id}
        stickyHeaderIndices={[1]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={<GuestRegistryHeader registry={registry} />}
        renderItem={({ item: row, index }) =>
          row.kind === "controls" ? (
            <View style={styles.controls}>
              <View style={{ flex: 1, flexDirection: "row", gap: 2 }}>
                {(["all", "unpurchased", "purchased"] as const).map((value) => (
                  <Pressable
                    key={value}
                    testID={`guest-registry-tab-${value}`}
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
                      size="sm"
                      numberOfLines={2}
                      style={{
                        textAlign: "center",
                        color: value === filter ? C.deep : C.muted,
                      }}
                    >
                      {t(`registry.tabs.${value}`)}
                    </CommerceText>
                  </Pressable>
                ))}
              </View>
              <Pressable
                testID="guest-registry-filters"
                accessibilityRole="button"
                accessibilityLabel={t("registry.filterItems")}
                onPress={() => filters.current?.present()}
                style={styles.icon}
              >
                <Feather
                  name="sliders"
                  size={21}
                  color={categoryId || sort !== "default" ? C.primary : C.ink}
                />
              </Pressable>
            </View>
          ) : row.kind === "empty" ? (
            <View style={styles.empty}>
              <CommerceText style={{ color: C.muted }}>
                {t(
                  all.length
                    ? "registry.noMatchingItems"
                    : "registry.emptyItems",
                )}
              </CommerceText>
            </View>
          ) : (
            <GuestRegistryItem
              item={row.item}
              purchasedByYou={purchasedByYou.has(row.id)}
              purchasedFilter={filter === "purchased"}
              canMark={registry.isOwner === false}
              divider={index < rows.length - 1}
              onOpen={() =>
                router.push({
                  pathname: "/products/[id]",
                  params: {
                    id: row.item.product.id,
                    ...(registry.isOwner === false && row.item.qtyLeft > 0
                      ? { giftRegistryId: registry.id, giftItemId: row.id }
                      : {}),
                  },
                })
              }
              onMark={() => {
                const item = registry.registryItems.items
                  .flatMap((section) => section.data)
                  .find((item) => item.id === row.id);
                if (item && item.qtyLeft > 0 && registry.isOwner === false)
                  setSelection({ item });
              }}
            />
          )
        }
      />
      <RegistryFiltersSheet
        ref={filters}
        categories={categories}
        categoryId={categoryId}
        sort={sort}
        onCategory={setCategory}
        onSort={setSort}
      />
      {activeSelection && (
        <GuestPurchaseSheet
          ref={purchaseSheet}
          registryId={registry.id}
          item={activeSelection.item}
          initialQty={activeSelection.quantity}
          quantityLimit={activeSelection.quantity}
          orderId={activeSelection.orderId}
          onDismiss={() => {
            setSelection(null);
            setHandledPrompt(promptKey);
          }}
          onRecorded={() => {
            if (activeSelection.orderId)
              dismissRegistryOrderGift(
                getUserSub(),
                activeSelection.orderId,
                activeSelection.item.id,
              );
            setSelection(null);
            setHandledPrompt(promptKey);
          }}
        />
      )}
    </SafeAreaView>
  );
}

function GuestRegistryHeader({ registry }: { registry: IRegistryDetails }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  // Progress tracks gift quantities, so a partial purchase never appears complete.
  const items = registryRows(registry);
  const total = items.reduce((sum, item) => sum + item.qty, 0);
  const purchased = items.reduce(
    (sum, item) => sum + Math.min(item.qty, item.purchasedQty),
    0,
  );
  return (
    <View style={{ padding: 16, paddingTop: 18, paddingBottom: 20, gap: 18 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <RegistryAvatar
          title={registry.title}
          logo={registry.logo}
          category={registry.category}
          size={84}
        />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <CommerceText size="xl" weight="bold" numberOfLines={2}>
            {registry.title}
          </CommerceText>
          {!!registry.ownerName?.trim() && (
            <CommerceText size="sm" style={{ color: C.muted }}>
              {registry.ownerName.trim()}
            </CommerceText>
          )}
          <CommerceText size="xs" style={{ color: C.muted }}>
            {t("home.registryItems", { count: total })}
            {" · "}
            {t("home.registryPurchased", { count: purchased })}
          </CommerceText>
          {registry.isOwner && (
            <CommerceText size="xs" style={{ color: C.deep }}>
              {t("registry.ownerPreview")}
            </CommerceText>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={t("registry.purchases")}
          accessibilityValue={{
            min: 0,
            max: Math.max(1, total),
            now: purchased,
          }}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: C.line,
          }}
        >
          <View
            style={{
              width: `${total ? (purchased / total) * 100 : 0}%`,
              height: 6,
              backgroundColor: C.primary,
              borderRadius: 4,
            }}
          />
        </View>
        <CommerceText size="xs" style={{ color: C.muted }}>
          {t("registry.purchasedCount", {
            purchased: String(purchased),
            total: String(total),
          })}
        </CommerceText>
      </View>
      {!!registry.greeting?.trim() && (
        <View style={{ gap: 6 }}>
          <CommerceText
            size="sm"
            numberOfLines={expanded ? undefined : 3}
            style={{ color: C.muted, lineHeight: 22 }}
          >
            {registry.greeting.trim()}
          </CommerceText>
          {registry.greeting.length > 140 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded(!expanded)}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <CommerceText size="sm" style={{ color: C.deep }}>
                {t(expanded ? "common.showLess" : "common.showMore")}
              </CommerceText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
function GuestRegistryItem({
  item,
  onOpen,
  onMark,
  divider,
  canMark,
  purchasedByYou,
  purchasedFilter,
}: {
  item: RegistryRow;
  onOpen: () => void;
  onMark: () => void;
  divider: boolean;
  canMark: boolean;
  purchasedByYou: boolean;
  purchasedFilter: boolean;
}) {
  const { t } = useTranslation();
  const image = getImageUrl(item.product.images?.[0]?.path);
  const [failed, setFailed] = useState<string | null>(null);
  const name = getEnArName(item.product.nameEn, item.product.nameAr);
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <Pressable
        testID={`guest-product-image-${item.id}`}
        accessibilityRole="button"
        accessibilityLabel={name}
        onPress={onOpen}
        style={styles.image}
      >
        {image && image !== failed ? (
          <Image
            source={image}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
            onError={() => setFailed(image)}
          />
        ) : (
          <Feather name="gift" size={27} color={C.deep} />
        )}
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Pressable
          testID={`guest-product-${item.id}`}
          accessibilityRole="button"
          onPress={onOpen}
          style={{ gap: 4 }}
        >
          <CommerceText size="xs" numberOfLines={1} style={{ color: C.muted }}>
            {getEnArName(item.category.nameEn, item.category.nameAr)}
          </CommerceText>
          <CommerceText numberOfLines={2}>{name}</CommerceText>
          <CommerceText style={{ color: "#171717" }}>
            {formatPrice(item.product.price, item.product.currencyCode)}
          </CommerceText>
          <CommerceText
            size="xs"
            style={{
              color: item.qtyLeft === 0 || purchasedFilter ? "#408467" : C.deep,
            }}
          >
            {item.qtyLeft === 0
              ? t(
                  purchasedByYou
                    ? "registry.purchasedByYouLabel"
                    : "registry.purchasedLabel",
                )
              : purchasedFilter
                ? t("registry.purchasedOutOf", {
                    purchased: String(item.purchasedQty),
                    total: String(item.qty),
                  })
                : t("registry.unpurchasedQty", { count: item.qtyLeft })}
          </CommerceText>
        </Pressable>
        {canMark && item.qtyLeft > 0 && (
          <Pressable
            testID={`guest-mark-${item.id}`}
            accessibilityRole="button"
            onPress={onMark}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              minHeight: 44,
              alignSelf: "flex-start",
            }}
          >
            <Feather name="check-circle" size={16} color={C.deep} />
            <CommerceText size="sm" weight="medium" style={{ color: C.deep }}>
              {t("registry.iPurchased")}
            </CommerceText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
  tab: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  icon: {
    width: 40,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
  },
  image: {
    width: 92,
    height: 94,
    borderRadius: 6,
    backgroundColor: "#F7F4F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  empty: { padding: 32, alignItems: "center", justifyContent: "center" },
});
