import ProductCard from "@/components/ProductCard";
import { fetchMostAddedProducts } from "@/services/products.service";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import React, { useEffect, useRef } from "react";
import { Animated, FlatList, View, useWindowDimensions } from "react-native";
import SectionTitle from "../SectionTitle";

const MostAddedProductsSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const shimmerColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0E0E0", "#F0F0F0"],
  });

  const skeletonItems = Array.from({ length: 2 }, (_, index) => index);

  return (
    <View className="px-4 pb-4 bg-white">
      <View className="mb-5">
        <Animated.View
          className="h-7 w-2/3 rounded-md"
          style={{ backgroundColor: shimmerColor }}
        />
      </View>

      <View className="flex-row gap-3">
        {skeletonItems.map((item) => (
          <Animated.View
            key={item}
            className="flex-1 rounded-lg"
            style={{
              height: 220,
              backgroundColor: shimmerColor,
            }}
          />
        ))}
      </View>
    </View>
  );
};

function MostAddedProducts() {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const { data: mostAddedProducts, isFetching } = useQuery({
    queryKey: ["products", "mostAdded"],
    queryFn: fetchMostAddedProducts,
  });

  if (isFetching && !mostAddedProducts) {
    return <MostAddedProductsSkeleton />;
  }

  if (!mostAddedProducts?.length) {
    return null;
  }

  const viewportWidth = width - 32;
  const visibleCardCount = width >= 390 ? 2.2 : 1.7;
  const productCardWidth = viewportWidth / visibleCardCount;

  return (
    <View className="px-4 pb-4 bg-white">
      <View className="mb-5">
        <SectionTitle>{t("home.mostAddedProducts")}</SectionTitle>
      </View>

      <FlatList
        horizontal
        data={mostAddedProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={{
              ...item,
              store: item.store ?? undefined,
            }}
            width={productCardWidth}
            reserveNameSpace
          />
        )}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="w-3" />}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </View>
  );
}

export default MostAddedProducts;
