import { queryClient } from "@/api/queryClient";
import GiftItUp from "@/components/GiftItUp";
import { View } from "@/components/Themed";
import Typography from "@/components/Typography";
import { fetchProductCategories } from "@/services/products.service";
import { IProductCategory } from "@/types";
import { getEnArName } from "@/utils/helper";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl } from "react-native";
import {
  HeaderSkeleton,
  ShopSkeletonLoader,
} from "./components/LoaderSkeleton";
import SubCategoryCard from "./components/SubCategoryCard";

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

  const topLevelCategories = (categories?.data ?? [])
    .filter((category: IProductCategory) => category.parentId === null)
    .filter(
      (category: IProductCategory) =>
        Array.isArray(category.children) && category.children.length > 0,
    );

  if (isFetching) {
    return (
      <View>
        <View className="px-4 pt-6">
          <HeaderSkeleton />
        </View>
        <ShopSkeletonLoader isVisible />
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={<Header />}
      data={topLevelCategories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const children = item.children as IProductCategory[];

        return (
          <View className="mb-6">
            <Typography.Text size="base" weight="bold" className="mb-3">
              {getEnArName(item.nameEn, item.nameAr)}
            </Typography.Text>
            <FlatList
              data={children}
              keyExtractor={(child) => child.id}
              renderItem={({ item: child }) => <SubCategoryCard item={child} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View className="w-3" />}
            />
          </View>
        );
      }}
      horizontal={false}
      className="flex-1 px-4 py-6"
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
