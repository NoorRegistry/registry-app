import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

const { width } = Dimensions.get("window");
const SHIMMER_COLORS = ["#E0E0E0", "#F0F0F0"] as const;

const useShimmerColor = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnim]);

  return shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: SHIMMER_COLORS,
  });
};

const SkeletonLoader = ({ isVisible }: { isVisible: boolean }) => {
  const shimmerColor = useShimmerColor();

  if (!isVisible) {
    return null;
  }

  const skeletonItems = Array.from({ length: 6 }, (_, index) => index); // 6 skeletons for the cards
  const cardWidth = width / 2 - 16 - 8; // Same width calculation as CategoryCard

  return (
    <View className="flex flex-row flex-wrap justify-between px-4">
      {skeletonItems.map((_, index) => (
        <View
          key={index}
          className="bg-white rounded-xl shadow shadow-neutral-300 mb-4"
          style={{
            width: cardWidth,
          }}
        >
          {/* Top image skeleton */}
          <Animated.View
            className="rounded-t-xl"
            style={{
              width: cardWidth,
              height: cardWidth,
              backgroundColor: shimmerColor,
            }}
          />

          {/* Bottom text and icon skeleton */}
          <View className="flex-row items-center px-3 py-3 border-t border-neutral-200 rounded-b-xl">
            {/* Text skeleton */}
            <Animated.View
              className="rounded-md mr-2"
              style={{
                width: cardWidth * 0.6, // Approximate width for the text
                height: 16,
                backgroundColor: shimmerColor,
              }}
            />
            {/* Icon skeleton */}
            <Animated.View
              className="rounded-full"
              style={{
                width: 16,
                height: 16,
                backgroundColor: shimmerColor,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export default SkeletonLoader;

export const HeaderSkeleton = () => {
  const shimmerColor = useShimmerColor();

  return (
    <View className="mb-6">
      {/* Title Skeleton */}
      <Animated.View
        className="h-6 w-3/5 mb-1 rounded bg-gray-300"
        style={{
          backgroundColor: shimmerColor,
        }}
      />

      {/* Subtitle Skeleton */}
      <Animated.View
        className="h-4 w-4/5 rounded bg-gray-300"
        style={{
          backgroundColor: shimmerColor,
        }}
      />

      {/* Categories Skeleton */}
      <Animated.View
        className="h-5 w-2/5 mt-6 rounded bg-gray-300"
        style={{
          backgroundColor: shimmerColor,
        }}
      />
    </View>
  );
};

export const ShopSkeletonLoader = ({ isVisible }: { isVisible: boolean }) => {
  const shimmerColor = useShimmerColor();

  if (!isVisible) {
    return null;
  }

  const sectionItems = Array.from({ length: 4 }, (_, index) => index);
  const subCategoryItems = Array.from({ length: 5 }, (_, index) => index);

  return (
    <View className="px-4">
      {sectionItems.map((sectionIndex) => (
        <View key={sectionIndex} className="mb-6">
          <Animated.View
            className="h-5 rounded mb-3"
            style={{
              width: sectionIndex % 2 === 0 ? 120 : 160,
              backgroundColor: shimmerColor,
            }}
          />
          <View className="flex-row">
            {subCategoryItems.map((itemIndex) => (
              <View key={itemIndex} className="items-center mr-3">
                <Animated.View
                  className="rounded-xl"
                  style={{
                    width: 80,
                    height: 96,
                    backgroundColor: shimmerColor,
                  }}
                />
                <Animated.View
                  className="mt-2 h-3 rounded"
                  style={{
                    width: 72,
                    backgroundColor: shimmerColor,
                  }}
                />
                <Animated.View
                  className="mt-1 h-3 rounded"
                  style={{
                    width: 52,
                    backgroundColor: shimmerColor,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};
