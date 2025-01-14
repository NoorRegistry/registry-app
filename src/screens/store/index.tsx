import { queryClient } from "@/api/queryClient";
import AnimatedHeaderText from "@/components/AnimatedHeaderText";
import HeaderRightButtons from "@/components/Header/HeaderRightButtons";
import ProductCard from "@/components/ProductCard";
import Typography from "@/components/Typography";
import Wave from "@/components/Wave";
import { fetchStore } from "@/services/stores.service";
import { IProduct, TProductCard } from "@/types";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Animated, FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StoreSkeletonLoader from "./components/StoreSkeletonLoader";

// Wrap FlatList with Animated.createAnimatedComponent
const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<TProductCard>,
);

export default function StoreScreen() {
  const { id, storeName } = useLocalSearchParams<{
    id: string;
    storeName?: string;
  }>();

  const {
    data: store,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["store", id],
    queryFn: () => fetchStore(id),
  });

  const scrollY = new Animated.Value(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }, // Enable native thread animation
  );

  const headerOpacity =
    headerHeight > 150
      ? scrollY.interpolate({
          inputRange: [150, headerHeight - 150],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0;

  const StoreHeader = () => (
    <View
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setHeaderHeight(height);
      }}
    >
      <View className="bg-background-dark relative p-4 pb-0 items-center gap-3">
        <Image
          source={{ uri: getImageUrl(store!.storeLogo) }}
          style={{ width: 150, height: 150, borderRadius: 999 }}
          contentFit="contain"
        />
        <Typography.Text weight="bold" size="xl" className="mt-2">
          {getEnArName(store?.nameEn ?? "", store?.nameAr ?? "")}
        </Typography.Text>
        <Typography.Text weight="light" type="secondary">
          {getEnArName(store?.descriptionEn ?? "", store?.descriptionAr ?? "")}
        </Typography.Text>
      </View>
      <Wave />
    </View>
  );

  if (isFetching) return <StoreSkeletonLoader />;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitleAlign: "left",
          headerTitle: () => (
            <AnimatedHeaderText
              opacity={headerOpacity}
              title={
                storeName ??
                getEnArName(store?.nameEn ?? "", store?.nameAr ?? "")
              }
            />
          ),
          headerRight: () => <HeaderRightButtons />,
        }}
      />
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["bottom", "left", "right"]}
      >
        <AnimatedFlatList
          ListHeaderComponent={<StoreHeader />}
          data={store?.products ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item as IProduct} />}
          numColumns={2}
          horizontal={false}
          className="flex-1"
          columnWrapperClassName="justify-between px-4"
          onScroll={handleScroll}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching} // Use isRefetching from React Query
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ["store", id] });
              }} // Call refetch directly
            />
          }
          ListFooterComponent={<View className="pb-32" />}
        />
      </SafeAreaView>
    </>
  );
}
