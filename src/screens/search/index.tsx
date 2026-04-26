import LoadingSpinner from "@/components/Loader/customLoader";
import ProductCard from "@/components/ProductCard";
import RegistryListItem from "@/components/RegistryListItem";
import Typography from "@/components/Typography";
import { ChevronRightIcon } from "@/components/icons/chevron";
import { CloseIcon } from "@/components/icons/close";
import { SearchIcon } from "@/components/icons/search";
import { Colors } from "@/constants/Colors";
import { useHeaderScrollState } from "@/hooks/useHeaderScrollState";
import GuideCard from "@/screens/guides/components/GuideCard";
import { fetchSearchResults } from "@/services/search.service";
import {
  IGlobalSearchResults,
  ISearchGuide,
  ISearchProduct,
  ISearchStore,
  TGlobalSearchResultsType,
} from "@/types";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link, Stack, useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  I18nManager,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

type SearchSection = {
  id: TGlobalSearchResultsType;
  title: string;
  count: number;
};

function SearchScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const handleHeaderScroll = useHeaderScrollState();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [expandedSections, setExpandedSections] = useState<
    Record<TGlobalSearchResultsType, boolean>
  >({
    stores: true,
    products: true,
    guides: true,
    registries: true,
  });
  const inputRef = useRef<TextInput>(null);
  const trimmedSearchQuery = searchQuery.trim();
  const debouncedTrimmedSearchQuery = debouncedSearchQuery.trim();
  const sectionWidth = width - 32;

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const toggleSection = (sectionId: TGlobalSearchResultsType) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  useFocusEffect(
    React.useCallback(() => {
      inputRef.current?.focus();
    }, []),
  );

  const { data, isFetching } = useQuery({
    queryKey: ["search", debouncedTrimmedSearchQuery],
    queryFn: () => fetchSearchResults(debouncedTrimmedSearchQuery),
    enabled: Boolean(debouncedTrimmedSearchQuery),
  });

  const totalResults = data?.total ?? 0;
  const activeSearchTerm = debouncedTrimmedSearchQuery || trimmedSearchQuery;
  const isWaitingForDebounce =
    Boolean(trimmedSearchQuery) &&
    trimmedSearchQuery !== debouncedTrimmedSearchQuery;
  const isSearching = isWaitingForDebounce || isFetching;
  const hasResolvedSearchResults =
    Boolean(debouncedTrimmedSearchQuery) && data !== undefined;

  const sections: SearchSection[] = [
    {
      id: "stores" as const,
      title: t("common.stores"),
      count: data?.counts.stores ?? 0,
    },
    {
      id: "products" as const,
      title: t("common.products"),
      count: data?.counts.products ?? 0,
    },
    {
      id: "guides" as const,
      title: t("common.guides"),
      count: data?.counts.guides ?? 0,
    },
    {
      id: "registries" as const,
      title: t("common.registries"),
      count: data?.counts.registries ?? 0,
    },
  ].filter((section) => section.count > 0) as SearchSection[];

  return (
    <>
      <Stack.Screen options={{}} />
      <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
        <View className="mx-4 mt-4 mb-2 flex-row items-center rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow shadow-neutral-100">
          <SearchIcon
            width={22}
            height={22}
            color={Colors[colorScheme ?? "light"].tabIconDefault}
          />
          <TextInput
            ref={inputRef}
            placeholder={t("common.globalSearch")}
            onChangeText={handleSearch}
            className="flex-1 px-3 font-Poppinsregular text-black"
            textAlign={I18nManager.isRTL ? "right" : "left"}
            placeholderTextColor={
              Colors[colorScheme ?? "light"].placeholderTextColor
            }
            value={searchQuery}
          />
          {isSearching ? <LoadingSpinner size="large" /> : null}
          {!isSearching && trimmedSearchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={10}
              className="p-1"
            >
              <CloseIcon
                size={18}
                color={Colors[colorScheme ?? "light"].tabIconDefault}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        {trimmedSearchQuery ? (
          <ScrollView
            className="flex-1"
            onScroll={handleHeaderScroll}
            scrollEventThrottle={16}
            contentContainerClassName="px-4 pb-32"
          >
            {hasResolvedSearchResults ? (
              <>
                <Typography.Text
                  type="secondary"
                  size="base"
                  className="mb-6 mt-2"
                >
                  {t("common.showingResultsFor", {
                    count: totalResults,
                    term: activeSearchTerm,
                  })}
                </Typography.Text>
                {sections.length ? (
                  sections.map((section) => (
                    <View
                      key={section.id}
                      className="mb-6 self-start border-b border-neutral-200 pb-6"
                      style={{ width: sectionWidth }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleSection(section.id)}
                        className="w-full flex-row items-center justify-between py-1"
                      >
                        <Typography.Text weight="medium" size="lg">
                          {section.title} ({section.count})
                        </Typography.Text>
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            transform: [
                              { scaleX: I18nManager.isRTL ? -1 : 1 },
                              {
                                rotate: expandedSections[section.id]
                                  ? "90deg"
                                  : "0deg",
                              },
                            ],
                          }}
                        >
                          <ChevronRightIcon width={24} height={24} />
                        </View>
                      </TouchableOpacity>
                      {expandedSections[section.id] ? (
                        <SearchSectionContent
                          sectionId={section.id}
                          data={data}
                        />
                      ) : null}
                    </View>
                  ))
                ) : (
                  <EmptySectionState />
                )}
              </>
            ) : (
              <SearchLoadingState />
            )}
          </ScrollView>
        ) : (
          <EmptySearch />
        )}
      </SafeAreaView>
    </>
  );
}

function SearchSectionContent({
  sectionId,
  data,
}: {
  sectionId: TGlobalSearchResultsType;
  data?: IGlobalSearchResults;
}) {
  switch (sectionId) {
    case "stores":
      return <StoresSection stores={data?.stores ?? []} />;
    case "products":
      return <ProductsSection products={data?.products ?? []} />;
    case "guides":
      return <GuidesSection guides={data?.guides ?? []} />;
    case "registries":
      return <RegistriesSection results={data} />;
    default:
      return null;
  }
}

function StoresSection({ stores }: { stores: ISearchStore[] }) {
  const { width } = useWindowDimensions();

  if (!stores.length) {
    return <EmptySectionState />;
  }

  const viewportWidth = width - 32;
  const visibleCardCount = width >= 390 ? 2.8 : 2.2;
  const storeCardWidth = viewportWidth / visibleCardCount;

  return (
    <View className="mt-5 w-full">
      <FlatList
        horizontal
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/(protected)/stores/[id]",
              params: {
                id: item.id,
                storeName: getEnArName(item.nameEn, item.nameAr),
              },
            }}
            asChild
          >
            <Pressable
              className="h-24 items-center justify-center rounded-3xl border border-neutral-200 p-2"
              style={{ width: storeCardWidth }}
            >
              <View className="flex-1 w-full">
                <Image
                  source={{ uri: getImageUrl(item.storeLogo) }}
                  style={{ flex: 1 }}
                  contentFit="contain"
                />
              </View>
            </Pressable>
          </Link>
        )}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="w-3" />}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </View>
  );
}

function ProductsSection({ products }: { products: ISearchProduct[] }) {
  const { width } = useWindowDimensions();

  if (!products.length) {
    return <EmptySectionState />;
  }

  const viewportWidth = width - 32;
  const visibleCardCount = width >= 390 ? 2.2 : 1.7;
  const productCardWidth = viewportWidth / visibleCardCount;

  return (
    <View className="mt-5 w-full">
      <FlatList
        horizontal
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={{ ...item, store: item.store ?? undefined }}
            width={productCardWidth}
          />
        )}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="w-3" />}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </View>
  );
}

function GuidesSection({ guides }: { guides: ISearchGuide[] }) {
  const { width } = useWindowDimensions();

  if (!guides.length) {
    return <EmptySectionState />;
  }

  const viewportWidth = width - 32;
  const guideCardWidth = viewportWidth / 1.3;

  return (
    <View className="mt-5 w-full">
      <FlatList
        horizontal
        data={guides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GuideCard guide={item} width={guideCardWidth} />
        )}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="w-4" />}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </View>
  );
}

function RegistriesSection({ results }: { results?: IGlobalSearchResults }) {
  const registries = results?.registries ?? [];

  if (!registries.length) {
    return <EmptySectionState />;
  }

  return (
    <View className="mt-5 gap-3">
      {registries.map((registry) => (
        <Link
          key={registry.id}
          href={{
            pathname: "/(protected)/registry/guest-view",
            params: { id: registry.id },
          }}
          asChild
        >
          <RegistryListItem
            registry={{
              id: registry.id,
              title: registry.title,
              logo: registry.logo ?? "",
              isActive: false,
              visibility: "Public",
              _count: { totalItems: 0, totalPurchased: 0 },
              category: {},
            }}
          />
        </Link>
      ))}
    </View>
  );
}

function EmptySectionState() {
  const { t } = useTranslation();

  return (
    <Typography.Text size="base" weight="light" className="pt-4">
      {t("common.noResultsFound")}
    </Typography.Text>
  );
}

function SearchLoadingState() {
  return <View className="h-24" />;
}

function EmptySearch() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center p-10">
      <Typography.Text
        type="secondary"
        size="base"
        weight="light"
        className="text-center"
      >
        {t("common.emptySearchDescription")}
      </Typography.Text>
    </View>
  );
}

export default SearchScreen;
