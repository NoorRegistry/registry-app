import AnimatedHeaderText from "@/components/AnimatedHeaderText";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { View } from "@/components/Themed";
import Typography from "@/components/Typography";
import {
  fetchProductCategoryById,
  fetchProductsByCategoryId,
} from "@/services/products.service";
import { getEnArName } from "@/utils/helper";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SkeletonLoader, {
  HeaderSkeleton,
} from "../shop/components/LoaderSkeleton";

// Header component
const Header = ({
  categoryName,
  categoryDesc,
  showCategoriesText,
}: {
  categoryName: string;
  categoryDesc: string;
  showCategoriesText: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <View className="mb-6">
      <Typography.Text size="lg" weight="bold">
        {categoryName}
      </Typography.Text>
      <Typography.Text
        className="mt-1"
        size="sm"
        weight="light"
        type="secondary"
      >
        {categoryDesc}
      </Typography.Text>
      {showCategoriesText && (
        <Typography.Text className="mt-6" weight="medium">
          {t("common.categories")}
        </Typography.Text>
      )}
    </View>
  );
};

export default function CategoryScreen() {
  const { id, children } = useLocalSearchParams<{
    id: string;
    children: "true" | "false";
  }>();

  const { data: category, isFetching } = useQuery({
    queryKey: ["categories", id],
    queryFn: () => fetchProductCategoryById(id),
    placeholderData: keepPreviousData,
  });

  const { data: products, isFetching: isFetchingProducts } = useQuery({
    queryKey: ["products", "categories", id],
    queryFn: () => fetchProductsByCategoryId(id),
    enabled:
      children === "false" || Boolean(category && category.children === false),
    placeholderData: keepPreviousData,
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [50, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (isFetching || isFetchingProducts) {
    return (
      <View>
        <Stack.Screen
          options={{
            headerTitle: "",
          }}
        />
        <View className="px-4 pt-6">
          <HeaderSkeleton />
        </View>
        <SkeletonLoader isVisible />
      </View>
    );
  }
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <AnimatedHeaderText
              opacity={headerOpacity}
              title={getEnArName(category?.nameEn!, category?.nameAr!)}
            />
          ),
        }}
      />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        {Array.isArray(category?.children) ? (
          <Animated.FlatList
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            ListHeaderComponent={
              <Header
                categoryName={getEnArName(category?.nameEn!, category?.nameAr!)}
                categoryDesc={getEnArName(
                  category?.descriptionEn!,
                  category?.descriptionAr!,
                )}
                showCategoriesText={true}
              />
            }
            data={Array.isArray(category?.children) ? category?.children : []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CategoryCard item={item} />}
            numColumns={2}
            horizontal={false}
            className="flex-1 px-4 py-6"
            columnWrapperClassName="justify-between"
          />
        ) : (
          <Animated.FlatList
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            ListHeaderComponent={
              <Header
                categoryName={getEnArName(category?.nameEn!, category?.nameAr!)}
                categoryDesc={getEnArName(
                  category?.descriptionEn!,
                  category?.descriptionAr!,
                )}
                showCategoriesText={false}
              />
            }
            data={products?.data ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard product={item} />}
            numColumns={2}
            horizontal={false}
            className="flex-1 px-4 py-6"
            columnWrapperClassName="justify-between"
          />
        )}
      </SafeAreaView>
    </>
  );
}
