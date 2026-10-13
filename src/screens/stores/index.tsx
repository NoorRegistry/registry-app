import { ChevronRightIcon } from "@/components/icons/chevron";
import { Colors } from "@/constants/Colors";
import { fetchStores } from "@/services/stores.service";
import { IStore } from "@/types";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link, Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  I18nManager,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const RenderStore = ({ store }: { store: IStore }) => {
  const cardWidth = width / 2 - 16 - 8;
  return (
    <Link
      href={{
        pathname: "/stores/[id]",
        params: {
          id: store.id,
          storeName: getEnArName(store.nameEn, store.nameAr),
        },
      }}
      key={store.id}
      asChild
    >
      <Pressable
        key={store.id}
        style={{ width: cardWidth, height: cardWidth }}
        className="p-2 mb-4 items-center justify-center border border-neutral-200 rounded-3xl"
      >
        <View className="flex-1 w-full">
          <Image
            source={{ uri: getImageUrl(store.storeLogo) }}
            style={{ flex: 1 }}
            contentFit="contain"
          />
        </View>
      </Pressable>
    </Link>
  );
};

const StoresScreen = () => {
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const { data: stores } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
  });

  const filteredStores = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return (stores?.data ?? []).filter(
      (store) =>
        store.nameEn.toLowerCase().includes(search) ||
        store.nameAr.toLowerCase().includes(search),
    );
  }, [stores?.data, searchText]);

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <SafeAreaView edges={["top"]}>
              <View className="flex-row items-center bg-white shadow shadow-neutral-200  px-4 py-2 mx-4 rounded-lg">
                {/* Back Button */}
                <TouchableOpacity
                  className="rotate-180"
                  onPress={() => {
                    router.back();
                  }}
                >
                  <ChevronRightIcon
                    color={Colors[colorScheme ?? "light"].placeholderTextColor}
                  />
                </TouchableOpacity>

                {/* Search Bar */}
                <View className="flex-1 rounded-lg">
                  <TextInput
                    placeholder={t("shop.searchStoresPlaceholder")}
                    value={searchText}
                    onChangeText={setSearchText}
                    className="h-8 rounded  px-4 font-Poppinsregular text-black"
                    textAlign={I18nManager.isRTL ? "right" : "left"}
                    placeholderTextColor={
                      Colors[colorScheme ?? "light"].placeholderTextColor
                    }
                  />
                </View>
              </View>
            </SafeAreaView>
          ),
          headerTitleAlign: "left",
        }}
      />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <FlatList
          data={filteredStores}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RenderStore store={item} />}
          horizontal={false}
          className="flex-1 px-4 py-6"
          columnWrapperClassName="justify-between"
        />
      </SafeAreaView>
    </>
  );
};

/* const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchBar: {
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
  },
  storeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  storeText: {
    fontSize: 16,
    color: "#333",
  },
}); */

export default StoresScreen;
