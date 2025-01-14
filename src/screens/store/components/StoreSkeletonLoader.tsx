import Wave from "@/components/Wave";
import { Stack } from "expo-router";
import React from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Shimmer Animation Component
const Shimmer = () => {
  const shimmerAnim = React.useRef(new Animated.Value(-1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <Animated.View
      style={{
        ...StyleSheet.absoluteFillObject,
        transform: [{ translateX }],
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        opacity: 0.6,
      }}
    />
  );
};

// Skeleton Loader for Store Header
const StoreHeaderSkeleton = () => (
  <View>
    <View className="bg-background-dark relative p-4 pb-0 items-center gap-3">
      {/* Logo Placeholder */}
      <View className="w-36 h-36 bg-neutral-300 rounded-full overflow-hidden">
        <Shimmer />
      </View>

      {/* Name Placeholder */}
      <View className="w-3/4 h-6 bg-neutral-300 rounded-md mt-2 overflow-hidden">
        <Shimmer />
      </View>

      {/* Description Placeholder */}
      <View className="w-1/2 h-4 bg-neutral-300 rounded-md overflow-hidden mt-1">
        <Shimmer />
      </View>
    </View>

    {/* Wave Component */}
    <Wave />
  </View>
);

// Skeleton Loader for Product Card
const ProductCardSkeleton = () => {
  const cardWidth = width / 2 - 16 - 8;

  return (
    <View
      style={{ width: cardWidth }}
      className="bg-white rounded-lg items-center border border-neutral-200 mb-4"
    >
      <View
        style={{
          width: cardWidth - 2,
          height: cardWidth - 2,
        }}
        className="bg-neutral-300 rounded-t-lg overflow-hidden"
      >
        <Shimmer />
      </View>
      <View className="px-3 py-3 border-t w-full border-neutral-200 rounded-b-lg">
        <View className="w-full h-4 bg-neutral-300 rounded-md overflow-hidden">
          <Shimmer />
        </View>
        <View className="w-1/2 h-4 bg-neutral-300 rounded-md mt-2 overflow-hidden">
          <Shimmer />
        </View>
      </View>
    </View>
  );
};

// Skeleton Loader for Store Page
const StoreSkeletonLoader = () => (
  <SafeAreaView className="flex-1 bg-white" edges={["bottom", "left", "right"]}>
    <Stack.Screen options={{ headerTitle: "" }} />
    <Animated.FlatList
      ListHeaderComponent={<StoreHeaderSkeleton />}
      data={Array.from({ length: 6 })} // Create dummy data for skeletons
      keyExtractor={(_, index) => `skeleton-${index}`}
      renderItem={() => <ProductCardSkeleton />}
      numColumns={2}
      horizontal={false}
      className="flex-1 pb-6"
      columnWrapperClassName="justify-between px-4"
    />
  </SafeAreaView>
);

export default StoreSkeletonLoader;
