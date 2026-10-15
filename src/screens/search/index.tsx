import { CatalogSkeleton } from "@/components/Skeleton/layouts";
import ProductCard from "@/components/ProductCard";
import { searchResultRows, SearchResultRow } from "./results";
import {
  BrowseHeader,
  BrowseState,
  CategoryGrid,
} from "@/screens/shop/components/Browse";
import { useGridLayout } from "@/components/Grid";
import ResultRowsSkeleton from "@/components/ResultRowsSkeleton";
import { useCart } from "@/hooks/useCart";
import Typography from "@/components/Typography";
import { fetchSearchResults } from "@/services/search.service";
import { fetchProductCategories } from "@/services/products.service";
import { GlobalSearchResult, TGlobalSearchResultsType } from "@/types";
import { getDecodedToken, getEnArName, getImageUrl } from "@/utils/helper";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";
import {
  ActionButton,
  EmptyState,
  FriendSearch,
  PagedList,
  PersonRow,
  palette,
  styles,
} from "../friends/components";
import { nextFriendsPage, useFriendsKey } from "../friends/hooks";
import { useFriendActions } from "../friends/actions";

const types = ["all", "products", "people", "stores"] as const;
export default function SearchScreen({
  standalone = false,
}: { standalone?: boolean } = {}) {
  const params = useLocalSearchParams<{ type?: string; q?: string }>();
  const initialType = types.find((type) => type === params.type) ?? "all";
  return (
    <SearchContent
      key={`${initialType}:${params.q ?? ""}`}
      standalone={standalone}
      initialType={initialType}
      initialQuery={params.q ?? ""}
    />
  );
}
function SearchContent({
  standalone,
  initialType,
  initialQuery,
}: {
  standalone: boolean;
  initialType: TGlobalSearchResultsType;
  initialQuery: string;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const columns = width >= 700 ? 3 : 2;
  const { itemWidth: cardWidth, onLayout: onGridLayout } =
    useGridLayout(columns);
  const hasCart = Boolean(useCart().data?.itemCount);
  const userId = getDecodedToken()?.user?.id ?? "";
  const historyKey = `search_history_${userId}`;
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [search] = useDebounce(query.trim(), 300);
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const data: unknown = JSON.parse(getStorageItem(historyKey) ?? "[]");
      return Array.isArray(data)
        ? data
            .filter((item): item is string => typeof item === "string")
            .slice(0, 8)
        : [];
    } catch {
      return [];
    }
  });
  const ready = search.length >= 2;
  const key = useFriendsKey();
  const result = useInfiniteQuery({
    queryKey: [...key, "globalSearch", type, search],
    queryFn: ({ pageParam, signal }) =>
      fetchSearchResults(search, type, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: nextFriendsPage,
    enabled: ready,
    staleTime: 15000,
  });
  const { refetch } = result;
  useFocusEffect(
    useCallback(() => {
      if (ready) void refetch();
      else if (standalone) inputRef.current?.focus();
    }, [ready, refetch, standalone]),
  );
  const categories = useQuery({
    queryKey: ["productCategories", "search"],
    queryFn: fetchProductCategories,
    enabled: !query.trim(),
    staleTime: 60000,
  });
  const actions = useFriendActions();
  const saveRecent = (term: string) => {
    const normalized = term.trim();
    if (normalized.length < 2) return;
    const next = [
      normalized,
      ...recent.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase(),
      ),
    ].slice(0, 8);
    setRecent(next);
    setStorageItem(historyKey, JSON.stringify(next));
  };
  const data = Array.from(
    new Map(
      result.data?.pages
        .flatMap((page) => page.data)
        .map((row) => [`${row.kind}:${row.id}`, row]),
    ).values(),
  );
  const openResult = (
    item: Exclude<GlobalSearchResult, { kind: "products" }>,
  ) => {
    saveRecent(search);
    if (item.kind === "people")
      router.push({
        pathname:
          item.relationship === "FRIEND" ? "/friends/[id]" : "/people/[id]",
        params: { id: item.id },
      });
    else
      router.push({
        pathname: "/stores/[id]",
        params: {
          id: item.id,
          storeName: getEnArName(item.nameEn, item.nameAr),
        },
      });
  };
  const renderResult = (item: SearchResultRow, index: number) => {
    if (item.kind === "product-row")
      return (
        <View
          onLayout={onGridLayout}
          style={{
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 4,
          }}
        >
          {item.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              width={cardWidth}
              onPress={() => saveRecent(search)}
            />
          ))}
        </View>
      );
    if (item.kind === "people")
      return (
        <PersonRow
          person={item}
          index={index}
          subtitle={item.profileCode}
          onPersonPress={() => openResult(item)}
        >
          <ActionButton
            title={t(
              item.relationship === "FRIEND"
                ? "friends.view"
                : item.relationship === "SENT"
                  ? "friends.sent"
                  : item.relationship === "INCOMING"
                    ? "friends.acceptShort"
                    : "search.request",
            )}
            secondary={item.relationship !== "NONE"}
            disabled={actions.isPending}
            busy={
              actions.isPending &&
              (actions.variables?.id === item.id ||
                actions.variables?.id === item.requestId)
            }
            onPress={() => {
              saveRecent(search);
              if (item.relationship === "FRIEND")
                router.push({
                  pathname: "/friends/[id]",
                  params: { id: item.id },
                });
              else if (item.relationship === "INCOMING" && item.requestId)
                actions.mutate({ kind: "accept", id: item.requestId });
              else if (item.requestId)
                router.push({
                  pathname: "/friends/requests/[id]",
                  params: { id: item.requestId },
                });
              else actions.mutate({ kind: "send", id: item.id });
            }}
          />
        </PersonRow>
      );
    const image = item.storeLogo;
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => openResult(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 58,
            height: 58,
            backgroundColor: "#F7F7F7",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {image && (
            <Image
              source={getImageUrl(image)}
              style={{ width: 58, height: 58 }}
              contentFit="contain"
            />
          )}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Typography.Text weight="medium">
            {getEnArName(item.nameEn, item.nameAr)}
          </Typography.Text>
        </View>
      </Pressable>
    );
  };
  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      {standalone && <BrowseHeader title={t("common.search")} back />}
      <FriendSearch
        inputRef={inputRef}
        onSubmit={() => saveRecent(query)}
        value={query}
        onChange={setQuery}
        placeholder={t("common.globalSearch")}
      />
      <View style={styles.tabs}>
        {types.map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: type === tab }}
            onPress={() => setType(tab)}
            style={[styles.tab, type === tab && styles.activeTab]}
          >
            <Typography.Text
              size="sm"
              weight="medium"
              style={{ color: type === tab ? palette.ink : palette.muted }}
            >
              {t(`search.${tab}`)}
            </Typography.Text>
          </Pressable>
        ))}
      </View>
      {query.trim() ? (
        <PagedList
          bottomPadding={hasCart ? 100 : 32}
          data={ready ? searchResultRows(data, columns) : []}
          keyExtractor={(item) => `${item.kind}:${item.id}`}
          renderItem={({ item, index }) => renderResult(item, index)}
          loading={ready && result.isLoading}
          loadingContent={
            type === "products" || type === "all" ? (
              <BrowseState loading />
            ) : (
              <ResultRowsSkeleton kind={type} showAction={type === "people"} />
            )
          }
          error={ready && (result.isError || result.fetchStatus === "paused")}
          refreshing={result.isRefetching}
          more={!!result.hasNextPage}
          loadingMore={result.isFetchingNextPage}
          moreError={result.isFetchNextPageError}
          refresh={() => (ready ? result.refetch() : Promise.resolve())}
          loadMore={result.fetchNextPage}
          empty={
            ready ? <EmptyState title={t("common.noResultsFound")} /> : null
          }
        />
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: hasCart ? 100 : 30 }}
        >
          {!!recent.length && (
            <View style={{ margin: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Typography.Text weight="medium">
                  {t("search.recent")}
                </Typography.Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setRecent([]);
                    setStorageItem(historyKey, null);
                  }}
                >
                  <Typography.Text size="xs" style={{ color: palette.muted }}>
                    {t("search.clear")}
                  </Typography.Text>
                </Pressable>
              </View>
              {recent.map((term) => (
                <View
                  key={term}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 13,
                    paddingVertical: 12,
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color={palette.muted}
                  />
                  <Pressable
                    accessibilityRole="button"
                    style={{ flex: 1 }}
                    onPress={() => setQuery(term)}
                  >
                    <Typography.Text>{term}</Typography.Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("search.removeRecent")}
                    onPress={() => {
                      const next = recent.filter((item) => item !== term);
                      setRecent(next);
                      setStorageItem(historyKey, JSON.stringify(next));
                    }}
                  >
                    <Ionicons name="close" size={18} color={palette.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {categories.isLoading && <CatalogSkeleton kind="categories" />}
          {!!categories.data?.data?.length && (
            <View style={{ marginTop: 22 }}>
              <Typography.Text
                weight="medium"
                style={{ marginHorizontal: 16, marginBottom: 16 }}
              >
                {t("search.categories")}
              </Typography.Text>
              <CategoryGrid
                categories={categories.data.data.slice(0, 8)}
                onSelect={(category) =>
                  router.push({
                    pathname: "/category/[id]",
                    params: { id: category.id },
                  })
                }
              />
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setType("people");
              setQuery("SS-");
              inputRef.current?.focus();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              margin: 20,
              paddingVertical: 14,
            }}
          >
            <Ionicons name="scan-outline" size={22} color={palette.ink} />
            <Typography.Text weight="medium">
              {t("search.byCode")}
            </Typography.Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
