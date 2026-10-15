import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import CartBar from "@/components/CartBar";
import { CommerceText } from "@/components/Commerce";
import ProductCard from "@/components/ProductCard";
import { useGridLayout } from "@/components/Grid";
import { BrandColors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import { fetchStore } from "@/services/stores.service";
import { dismissTopSheet } from "@/store/sheetNavigationStore";
import { getEnArName, getImageUrl } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  FlatList,
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  ViewToken,
  useAnimatedValue,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { SearchEntry } from "../shop/components/Browse";
import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import {
  storeCatalogRows,
  storeSections,
  StoreCatalogRow,
  StoreSort,
} from "./products";

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<StoreCatalogRow>,
);
const viewabilityConfig = { itemVisiblePercentThreshold: 25 };
const sorts: StoreSort[] = ["featured", "priceAsc", "priceDesc", "name"];

export default function StoreScreen() {
  const { id, storeName } = useLocalSearchParams<{
    id: string;
    storeName?: string;
  }>();
  const { t, i18n } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const storeQuery = useQuery({
    queryKey: ["store", id],
    queryFn: () => fetchStore(id),
  });
  const store = storeQuery.data;
  const [sort, setSort] = useState<StoreSort>("featured");
  const [activeCategory, setActiveCategory] = useState("");
  const [identityHeight, setIdentityHeight] = useState(88);
  const [searchHeight, setSearchHeight] = useState(56);
  const [railHeight, setRailHeight] = useState(54);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const scrollY = useAnimatedValue(0);
  const listRef = useRef<FlatList<StoreCatalogRow>>(null);
  const sortSheet = useRef<BottomSheetModal>(null);
  const railRef = useRef<ScrollView>(null);
  const pendingCategory = useRef<string | null>(null);
  const atBottom = useRef(false);
  const heights = useRef(new Map<string, number>());
  const categoryFrames = useRef(
    new Map<string, { x: number; width: number }>(),
  );
  const name = store
    ? getEnArName(store.nameEn, store.nameAr)
    : (storeName ?? "");
  const sections = useMemo(
    () => storeSections(store?.products ?? [], "", sort, i18n.language),
    [store?.products, sort, i18n.language],
  );
  const rows = useMemo(() => storeCatalogRows(sections), [sections]);
  const selectedCategory = sections.some(
    (section) => section.id === activeCategory,
  )
    ? activeCategory
    : sections[0]?.id;
  const productCount = sections.reduce(
    (count, section) => count + section.products.length,
    0,
  );
  const { itemWidth: cardWidth, onLayout: onGridLayout } = useGridLayout(2);
  const searchBottom = identityHeight + searchHeight;
  const titleOpacity = scrollY.interpolate({
    inputRange: [identityHeight, identityHeight + 12],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const searchOpacity = scrollY.interpolate({
    inputRange: [searchBottom, searchBottom + 12],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<StoreCatalogRow>[] }) => {
      if (pendingCategory.current) return;
      const ordered = viewableItems
        .slice()
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      const candidates = atBottom.current ? ordered.reverse() : ordered;
      const row = candidates.find(({ item }) => item.kind === "products")?.item;
      if (row?.kind === "products") setActiveCategory(row.sectionId);
    },
    [],
  );
  const handleScrollPosition = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;
      atBottom.current =
        event.nativeEvent.contentSize.height > 0 &&
        offset + event.nativeEvent.layoutMeasurement.height >=
          event.nativeEvent.contentSize.height - 2;
      if (atBottom.current && !pendingCategory.current && sections.length)
        setActiveCategory(sections[sections.length - 1].id);
      setShowHeaderSearch(offset >= searchBottom);
    },
    [searchBottom, sections],
  );
  const handleScroll = useMemo(
    () =>
      // Animated.event stores the callback; refs are read only on native scroll events.
      // eslint-disable-next-line react-hooks/refs
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: handleScrollPosition,
      }),
    [scrollY, handleScrollPosition],
  );
  useEffect(() => {
    const frame = categoryFrames.current.get(selectedCategory ?? "");
    if (frame)
      railRef.current?.scrollTo({
        x: Math.max(0, frame.x - (width - frame.width) / 2),
        animated: true,
      });
  }, [selectedCategory, width]);
  const openSearch = () =>
    router.push({ pathname: "/catalog-search", params: { storeId: id, name } });
  const scrollToCategory = (category: string) => {
    const index = rows.findIndex(
      (row) => row.kind === "products" && row.sectionId === category,
    );
    if (index < 0) return;
    pendingCategory.current = category;
    setActiveCategory(category);
    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewOffset: railHeight,
    });
  };
  const estimatedHeight = (row: StoreCatalogRow) => {
    if (row.kind === "products") return cardWidth + 48 + 60 * fontScale;
    if (row.kind === "empty") return 80;
    return row.key === "identity"
      ? identityHeight
      : row.key === "search"
        ? searchHeight
        : row.key === "categories"
          ? railHeight
          : 60;
  };
  const rowHeight = (row: StoreCatalogRow) =>
    heights.current.get(row.key) ?? estimatedHeight(row);
  const identity = (
    <View
      testID="store-identity"
      onLayout={({ nativeEvent }) =>
        setIdentityHeight(nativeEvent.layout.height)
      }
      style={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {store?.storeLogo && !logoFailed ? (
        <Image
          source={getImageUrl(store.storeLogo)}
          onError={() => setLogoFailed(true)}
          contentFit="contain"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: BrandColors.soft,
          }}
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: BrandColors.soft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CommerceText
            size="lg"
            weight="medium"
            style={{ color: BrandColors.deep }}
          >
            {Array.from(name.trim())[0] ?? "S"}
          </CommerceText>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <CommerceText size="lg" weight="bold" numberOfLines={2}>
          {name}
        </CommerceText>
        {!!getEnArName(store?.descriptionEn, store?.descriptionAr) && (
          <CommerceText
            size="xs"
            style={{ color: BrandColors.muted }}
            numberOfLines={1}
          >
            {getEnArName(store?.descriptionEn, store?.descriptionAr)}
          </CommerceText>
        )}
      </View>
    </View>
  );
  const search = (
    <View
      onLayout={({ nativeEvent }) => setSearchHeight(nativeEvent.layout.height)}
    >
      <SearchEntry
        testID="store-search"
        label={t("store.search")}
        onPress={openSearch}
      />
    </View>
  );
  const categoryRail = (
    <View
      testID="store-category-rail"
      onLayout={({ nativeEvent }) => setRailHeight(nativeEvent.layout.height)}
      style={{
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.line,
      }}
    >
      <ScrollView
        ref={railRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 24,
          paddingTop: 6,
        }}
      >
        {sections.map((section) => (
          <Pressable
            testID={`store-category-${section.id}`}
            key={section.id}
            onLayout={({ nativeEvent }) =>
              categoryFrames.current.set(section.id, nativeEvent.layout)
            }
            accessibilityRole="tab"
            accessibilityState={{ selected: selectedCategory === section.id }}
            onPress={() => scrollToCategory(section.id)}
            style={{
              minHeight: 42,
              justifyContent: "center",
              borderBottomWidth: 2,
              borderBottomColor:
                selectedCategory === section.id
                  ? BrandColors.primary
                  : "transparent",
            }}
          >
            <CommerceText
              weight="medium"
              style={{
                color:
                  selectedCategory === section.id
                    ? BrandColors.deep
                    : BrandColors.muted,
              }}
            >
              {getEnArName(section.nameEn, section.nameAr)}
            </CommerceText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
  const results = (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <CommerceText size="xs" style={{ flex: 1, color: BrandColors.muted }}>
        {t("store.productCount", { count: productCount })}
      </CommerceText>
      <Pressable
        testID="store-sort"
        accessibilityRole="button"
        onPress={() => sortSheet.current?.present()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          minHeight: 36,
        }}
      >
        <Ionicons
          name="swap-vertical-outline"
          size={18}
          color={BrandColors.muted}
        />
        <CommerceText
          size="xs"
          style={{
            color: sort === "featured" ? BrandColors.muted : BrandColors.deep,
          }}
        >
          {t(sort === "featured" ? "store.sort" : `store.sorts.${sort}`)}
        </CommerceText>
      </Pressable>
    </View>
  );
  const renderRow = ({ item }: { item: StoreCatalogRow }) => {
    let content;
    if (item.kind === "chrome")
      content = { identity, search, categories: categoryRail, results }[
        item.key
      ];
    else if (item.kind === "empty")
      content = (
        <CommerceText
          style={{ padding: 24, textAlign: "center", color: BrandColors.muted }}
        >
          {t("store.empty")}
        </CommerceText>
      );
    else
      content = (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {item.products.map((product) => (
            <ProductCard key={product.id} product={product} width={cardWidth} />
          ))}
        </View>
      );
    return (
      <View
        onLayout={({ nativeEvent }) =>
          heights.current.set(item.key, nativeEvent.layout.height)
        }
        style={
          item.kind === "chrome" && item.key === "categories"
            ? { backgroundColor: "white", zIndex: 2 }
            : undefined
        }
      >
        {content}
      </View>
    );
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top", "bottom", "left", "right"]}
      >
        <View
          testID="store-header"
          style={{
            minHeight: 54,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderBottomWidth: showHeaderSearch ? 1 : 0,
            borderBottomColor: BrandColors.line,
          }}
        >
          <Pressable
            testID="store-back"
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            onPress={() => {
              if (dismissTopSheet()) return;
              if (router.canGoBack()) router.back();
              else router.replace("/shop");
            }}
            style={{
              width: 40,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"}
              size={22}
              color={BrandColors.ink}
            />
          </Pressable>
          <Animated.View
            style={{ flex: 1, minWidth: 0, opacity: titleOpacity }}
          >
            <CommerceText
              testID="store-header-title"
              weight="medium"
              size="base"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </CommerceText>
          </Animated.View>
          {showHeaderSearch && (
            <Animated.View style={{ opacity: searchOpacity }}>
              <Pressable
                testID="store-header-search"
                accessibilityRole="button"
                accessibilityLabel={t("store.search")}
                onPress={openSearch}
                style={{
                  width: 40,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={21}
                  color={BrandColors.ink}
                />
              </Pressable>
            </Animated.View>
          )}
          <Pressable
            testID="store-cart"
            accessibilityRole="button"
            accessibilityLabel={`${t("cart.viewCart")} ${t("cart.itemCount", { count: cart.data?.itemCount ?? 0 })}`}
            onPress={() => router.push("/cart")}
            style={{
              width: 40,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="bag-outline" size={22} color={BrandColors.ink} />
            {!!cart.data?.itemCount && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 2,
                  end: 0,
                  minWidth: 18,
                  height: 18,
                  paddingHorizontal: 3,
                  borderRadius: 9,
                  backgroundColor: BrandColors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CommerceText
                  size="xs"
                  weight="medium"
                  allowFontScaling={false}
                  style={{
                    color: "white",
                    fontSize: 10,
                    lineHeight: 14,
                    textAlign: "center",
                  }}
                >
                  {cart.data.itemCount > 99 ? "99+" : cart.data.itemCount}
                </CommerceText>
              </View>
            )}
          </Pressable>
        </View>
        {!store &&
        storeQuery.isPending &&
        storeQuery.fetchStatus !== "paused" ? (
          <ScreenSkeleton kind="store" />
        ) : !store ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <CommerceText>{t("store.loadError")}</CommerceText>
            <Pressable
              accessibilityRole="button"
              onPress={() => void storeQuery.refetch()}
              style={{ padding: 12 }}
            >
              <CommerceText style={{ color: BrandColors.deep }}>
                {t("cart.retry")}
              </CommerceText>
            </Pressable>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <AnimatedFlatList
              testID="store-products"
              onLayout={onGridLayout}
              ref={listRef}
              data={rows}
              renderItem={renderRow}
              keyExtractor={(row) => row.key}
              stickyHeaderIndices={[2]}
              initialNumToRender={8}
              removeClippedSubviews={false}
              getItemLayout={(_, index) => ({
                index,
                length: rowHeight(rows[index]),
                offset: rows
                  .slice(0, index)
                  .reduce((sum, row) => sum + rowHeight(row), 0),
              })}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              onScrollBeginDrag={() => {
                pendingCategory.current = null;
              }}
              contentContainerStyle={{
                paddingBottom: cart.data?.itemCount ? 100 : 24,
              }}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  tintColor={BrandColors.primary}
                  refreshing={storeQuery.isRefetching}
                  onRefresh={() => void storeQuery.refetch()}
                />
              }
            />
            <CartBar placement="screen" />
          </View>
        )}
      </SafeAreaView>
      <AppBottomSheetModal
        ref={sortSheet}
        index={0}
        enableDynamicSizing
        topInset={insets.top}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
        backgroundStyle={{ backgroundColor: "white" }}
        handleIndicatorStyle={{ backgroundColor: BrandColors.line }}
      >
        <BottomSheetView
          style={{
            paddingHorizontal: 22,
            paddingTop: 10,
            paddingBottom: insets.bottom + 18,
          }}
        >
          <CommerceText size="base" weight="bold" style={{ marginBottom: 8 }}>
            {t("store.sort")}
          </CommerceText>
          {sorts.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: sort === value }}
              onPress={() => {
                setSort(value);
                sortSheet.current?.dismiss();
              }}
              style={{
                minHeight: 48,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <CommerceText style={{ flex: 1 }}>
                {t(`store.sorts.${value}`)}
              </CommerceText>
              {sort === value && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={BrandColors.primary}
                />
              )}
            </Pressable>
          ))}
        </BottomSheetView>
      </AppBottomSheetModal>
    </>
  );
}
