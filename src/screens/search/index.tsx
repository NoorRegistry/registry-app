import LoadingSpinner from "@/components/Loader/customLoader";
import Typography from "@/components/Typography";
import { fetchSearchResults } from "@/services/search.service";
import { IGlobalSearchResults, TGlobalSearchResultsType } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, Stack, useFocusEffect } from "expo-router";
import { t } from "i18next";
import React, { useRef, useState } from "react";
import {
  I18nManager,
  SectionList,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { useDebounce } from "use-debounce";

type CommonData = { id: string; name: string };

type StoreItem = CommonData & { type: "store" };
type ProductItem = CommonData & { type: "product" };
type RegistryItem = CommonData & { type: "registry" };

type SectionItem = StoreItem | ProductItem | RegistryItem;

type SectionListDataType = {
  id: TGlobalSearchResultsType;
  title: string;
  data: SectionItem[]; // A union type for all section data items
};

type ConvertToSectionListDataReturn = SectionListDataType[];

function returnEmptyResults(): ConvertToSectionListDataReturn {
  return [
    {
      id: "stores" as TGlobalSearchResultsType,
      title: t("common.stores"),
      data: [], // Empty array for stores
    },
    {
      id: "products" as TGlobalSearchResultsType,
      title: t("common.products"),
      data: [], // Empty array for products
    },
    {
      id: "registries" as TGlobalSearchResultsType,
      title: t("common.registries"),
      data: [], // Empty array for registries
    },
  ];
}

function convertToSectionListData(
  json: IGlobalSearchResults,
): ConvertToSectionListDataReturn {
  return [
    {
      id: "stores" as TGlobalSearchResultsType,
      title: t("common.stores"),
      data: json.stores.map(
        (store) => ({ ...store, type: "store" }) as StoreItem,
      ),
    },
    {
      id: "products" as TGlobalSearchResultsType,
      title: t("common.products"),
      data: json.products.map(
        (product) => ({ ...product, type: "product" }) as ProductItem,
      ),
    },
    {
      id: "registries" as TGlobalSearchResultsType,
      title: t("common.registries"),
      data: json.registries.map(
        (registry) =>
          ({
            ...registry,
            name: registry.title,
            type: "registry",
          }) as RegistryItem,
      ),
    },
  ];
}

function SearchScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const inputRef = useRef<TextInput>(null);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  useFocusEffect(
    React.useCallback(() => {
      // Focus the TextInput when the screen is active
      inputRef.current?.focus();
    }, []),
  );

  const { data, isFetching } = useQuery({
    queryKey: ["search", debouncedSearchQuery],
    queryFn: () => fetchSearchResults(debouncedSearchQuery),
    placeholderData: keepPreviousData,
    enabled: Boolean(debouncedSearchQuery),
  });

  // Convert query results to SectionList data format
  const sectionListData = data
    ? convertToSectionListData(data)
    : returnEmptyResults();

  return (
    <>
      <Stack.Screen options={{}} />
      <View className="flex-row items-center bg-white shadow shadow-neutral-200 m-4 py-2 rounded-lg pe-2">
        {/* Search Bar */}
        <View className="flex-1 rounded-lg">
          <TextInput
            ref={inputRef}
            placeholder={t("common.globalSearch")}
            onChangeText={handleSearch}
            className="h-8 rounded-lg  px-4 font-Poppinsregular text-black"
            textAlign={I18nManager.isRTL ? "right" : "left"}
            placeholderTextColor={
              Colors[colorScheme ?? "light"].placeholderTextColor
            }
            clearButtonMode="while-editing"
            value={searchQuery}
          />
          {isFetching && (
            <View className="absolute end-[2] top-1">
              <LoadingSpinner size="large" />
            </View>
          )}
        </View>
      </View>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        {searchQuery ? (
          <SectionList
            sections={sectionListData}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title, id } }) => (
              <View className="py-2 bg-white border-b border-neutral-200 flex-row justify-between">
                <Typography.Text
                  type="secondary"
                  weight="light"
                  className="font-bold"
                >
                  {title}
                </Typography.Text>
                <Link
                  href={{
                    pathname:
                      id === "stores"
                        ? "/(protected)/stores"
                        : id === "products"
                          ? "/(protected)/stores"
                          : "/(protected)/stores",
                  }}
                  asChild
                >
                  <TouchableOpacity hitSlop={5}>
                    <Typography.Text weight="medium" type="complementary">
                      {t("common.seeAll")}
                    </Typography.Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}
            renderItem={({ item, section }) => {
              switch (item.type) {
                case "store":
                  return (
                    <Link
                      href={{
                        pathname: "/(protected)/stores/[id]",
                        params: { id: item.id },
                      }}
                      asChild
                    >
                      <TouchableOpacity className="py-3 border-b border-neutral-100">
                        <Typography.Text>{item.name}</Typography.Text>
                      </TouchableOpacity>
                    </Link>
                  );
                case "product":
                  return (
                    <Link
                      href={{
                        pathname: "/(protected)/products/[id]",
                        params: { id: item.id },
                      }}
                      asChild
                    >
                      <TouchableOpacity className="py-3 border-b border-neutral-100">
                        <Typography.Text>{item.name}</Typography.Text>
                      </TouchableOpacity>
                    </Link>
                  );
                case "registry":
                  return (
                    <Link
                      href={{
                        pathname: "/(protected)/products/[id]",
                        params: { id: item.id },
                      }}
                      asChild
                    >
                      <TouchableOpacity className="py-3 border-b border-neutral-100">
                        <Typography.Text>{item.name}</Typography.Text>
                      </TouchableOpacity>
                    </Link>
                  );
              }
            }}
            renderSectionFooter={({ section }) =>
              section.data.length === 0 ? (
                <Typography.Text size="base" weight="light" className="py-4">
                  {t("common.noResultsFound")}
                </Typography.Text>
              ) : (
                <View className="pb-4" />
              )
            }
            stickySectionHeadersEnabled
            className="flex-1 px-4"
          />
        ) : (
          <EmptySearch />
        )}
      </SafeAreaView>
    </>
  );
}

const EmptySearch = () => {
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
};

export default SearchScreen;
