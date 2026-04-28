import ProductCard from "@/components/ProductCard";
import { fetchMostAddedProducts } from "@/services/products.service";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import React from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import SectionTitle from "../SectionTitle";

function MostAddedProducts() {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const { data: mostAddedProducts, isFetching } = useQuery({
    queryKey: ["products", "mostAdded"],
    queryFn: fetchMostAddedProducts,
  });

  if (isFetching || !mostAddedProducts?.length) {
    return null;
  }

  const viewportWidth = width - 32;
  const visibleCardCount = width >= 390 ? 2.2 : 1.7;
  const productCardWidth = viewportWidth / visibleCardCount;

  return (
    <View className="px-4 pt-2 pb-4 bg-white">
      <View className="mb-4">
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
