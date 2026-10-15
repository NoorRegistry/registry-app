import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import { CommerceText } from "@/components/Commerce";
import ProductCard from "@/components/ProductCard";
import { useGridLayout } from "@/components/Grid";
import { BrandColors as colors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import {
  CatalogFilter,
  CatalogSort,
  fetchCatalogProducts,
} from "@/services/products.service";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ReactElement, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrowseState, browseStyles } from "./Browse";

export function useCatalogProducts(filters: CatalogFilter, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["catalogProducts", filters],
    queryFn: ({ pageParam, signal }) =>
      fetchCatalogProducts(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page && last.totalPages && last.page < last.totalPages
        ? last.page + 1
        : undefined,
    staleTime: 30000,
    enabled,
  });
}
const sorts: CatalogSort[] = ["featured", "priceAsc", "priceDesc", "name"];
export function SortControl({
  value,
  onChange,
}: {
  value: CatalogSort;
  onChange: (sort: CatalogSort) => void;
}) {
  const { t } = useTranslation();
  const ref = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  return (
    <>
      <Pressable
        testID="catalog-sort"
        accessibilityRole="button"
        accessibilityLabel={t("store.sort")}
        onPress={() => ref.current?.present()}
        style={[browseStyles.row, { minHeight: 44, gap: 6 }]}
      >
        <Ionicons name="swap-vertical-outline" size={17} color={colors.muted} />
        <CommerceText
          size="xs"
          style={{ color: value === "featured" ? colors.muted : colors.deep }}
        >
          {t(value === "featured" ? "store.sort" : `store.sorts.${value}`)}
        </CommerceText>
      </Pressable>
      <AppBottomSheetModal
        ref={ref}
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
        handleIndicatorStyle={{ backgroundColor: colors.line }}
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
          {sorts.map((sort) => (
            <Pressable
              key={sort}
              accessibilityRole="radio"
              accessibilityState={{ checked: sort === value }}
              onPress={() => {
                onChange(sort);
                ref.current?.dismiss();
              }}
              style={[browseStyles.row, { minHeight: 48 }]}
            >
              <CommerceText style={{ flex: 1 }}>
                {t(`store.sorts.${sort}`)}
              </CommerceText>
              {sort === value && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </BottomSheetView>
      </AppBottomSheetModal>
    </>
  );
}
export default function CatalogProducts({
  categoryId,
  storeId,
  search,
  header,
  enabled = true,
  bottomTabs = false,
  onRefresh,
}: {
  categoryId?: string;
  storeId?: string;
  search?: string;
  header?: ReactElement;
  enabled?: boolean;
  bottomTabs?: boolean;
  onRefresh?: () => Promise<unknown>;
}) {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const hasCart = Boolean(useCart().data?.itemCount);
  const [sort, setSort] = useState<CatalogSort>("featured");
  const filters = {
    categoryId,
    storeId,
    search,
    sort,
    language: i18n.language,
  };
  const result = useCatalogProducts(filters, enabled);
  const data = enabled
    ? Array.from(
        new Map(
          result.data?.pages
            .flatMap((page) => page.data)
            .map((product) => [product.id, product]),
        ).values(),
      )
    : [];
  const columns = width >= 700 ? 3 : 2;
  const { itemWidth: cardWidth, onLayout } = useGridLayout(columns);
  const total = result.data?.pages[0]?.total;
  const loading =
    enabled && result.isPending && result.fetchStatus !== "paused";
  const failed = result.isError || result.fetchStatus === "paused";
  return (
    <FlatList
      key={`${categoryId ?? storeId ?? "all"}:${columns}`}
      testID="catalog-products"
      onLayout={onLayout}
      data={data}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductCard product={item} width={cardWidth} />
      )}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      contentContainerStyle={{
        paddingBottom: hasCart ? (bottomTabs ? 104 : 100) : 24,
      }}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          {header}
          {enabled && (
            <View
              style={[
                browseStyles.row,
                { paddingHorizontal: 16, minHeight: 56 },
              ]}
            >
              <CommerceText size="xs" style={{ color: colors.muted, flex: 1 }}>
                {total !== undefined
                  ? t("store.productCount", { count: total })
                  : ""}
              </CommerceText>
              <SortControl value={sort} onChange={setSort} />
            </View>
          )}
        </>
      }
      ListEmptyComponent={
        !enabled ? null : (
          <BrowseState
            loading={loading}
            error={failed}
            retry={() => void result.refetch()}
          />
        )
      }
      ListFooterComponent={
        data.length ? (
          result.isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : failed ? (
            <BrowseState
              error
              retry={() =>
                void (result.isFetchNextPageError
                  ? result.fetchNextPage()
                  : result.refetch())
              }
            />
          ) : null
        ) : null
      }
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (
          enabled &&
          result.hasNextPage &&
          !result.isFetching &&
          !result.isFetchNextPageError
        )
          void result.fetchNextPage();
      }}
      refreshControl={
        <RefreshControl
          tintColor={colors.primary}
          refreshing={result.isRefetching && !result.isFetchingNextPage}
          onRefresh={() => {
            if (enabled) void result.refetch();
            void onRefresh?.();
          }}
        />
      }
    />
  );
}
