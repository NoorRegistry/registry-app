import { queryClient } from "@/api/queryClient";
import CategoryCard from "@/components/CategoryCard";
import GiftItUp from "@/components/GiftItUp";
import { View } from "@/components/Themed";
import Typography from "@/components/Typography";
import { fetchProductCategories } from "@/services/products.service";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl } from "react-native";
import SkeletonLoader, { HeaderSkeleton } from "./components/LoaderSkeleton";

// Header component
const Header = () => {
  const { t } = useTranslation();
  return (
    <View className="mb-6">
      <Typography.Text size="lg" weight="bold" className="mb-1">
        {t("shop.title")}
      </Typography.Text>
      <Typography.Text size="sm" weight="light" type="secondary">
        {t("shop.subtitle")}
      </Typography.Text>
      <Typography.Text className="mt-6" weight="medium">
        {t("common.categories")}
      </Typography.Text>
    </View>
  );
};

export default function ShopScreen() {
  const {
    data: categories,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
    placeholderData: keepPreviousData,
  });

  if (isFetching) {
    return (
      <View>
        <View className="px-4 pt-6">
          <HeaderSkeleton />
        </View>
        <SkeletonLoader isVisible />
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={<Header />}
      data={categories?.data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <CategoryCard item={item} />}
      numColumns={2}
      horizontal={false}
      className="flex-1 px-4 py-6"
      columnWrapperClassName="justify-between"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching} // Use isRefetching from React Query
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
          }} // Call refetch directly
        />
      }
      ListFooterComponent={
        <View className="-mx-4">
          <GiftItUp />
        </View>
      }
    />
  );
}
