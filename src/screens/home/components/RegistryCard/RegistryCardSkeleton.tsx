import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

type RegistrySkeletonVariant = "registry" | "noRegistry";

const RegistrySkeleton: React.FC<{ variant?: RegistrySkeletonVariant }> = ({
  variant = "registry",
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-1, 1],
  });

  const renderShimmer = () => (
    <Animated.View
      className="absolute inset-0 bg-white/30"
      style={{
        transform: [
          {
            translateX: shimmerTranslate.interpolate({
              inputRange: [-1, 1],
              outputRange: [-300, 300], // Adjust to match skeleton width
            }),
          },
        ],
      }}
    />
  );

  return (
    <View className="p-6 w-full mt-6 rounded-2xl shadow-sm bg-[#F3F3F3]">
      {variant === "registry" ? (
        <>
          <View className="flex-row items-center gap-4">
            <View className="relative w-14 h-14 rounded-full bg-gray-300 overflow-hidden">
              {renderShimmer()}
            </View>
            <View className="flex-1 gap-2">
              <View className="relative h-7 w-4/5 bg-gray-300 rounded-md overflow-hidden">
                {renderShimmer()}
              </View>
              <View className="relative h-4 w-2/3 bg-gray-300 rounded-md overflow-hidden">
                {renderShimmer()}
              </View>
            </View>
          </View>

          <View className="flex-row gap-8 mt-8">
            <View className="flex-1 gap-2">
              <View className="relative h-4 w-3/4 bg-gray-300 rounded-md overflow-hidden">
                {renderShimmer()}
              </View>
              <View className="relative h-14 w-2/3 bg-gray-300 rounded-md overflow-hidden">
                {renderShimmer()}
              </View>
            </View>
            <View className="flex-1 gap-2">
              <View className="relative h-4 w-3/4 bg-gray-300 rounded-md overflow-hidden">
                {renderShimmer()}
              </View>
              <View className="relative h-14 w-2/3 bg-gray-300 rounded-md overflow-hidden">
                {renderShimmer()}
              </View>
            </View>
          </View>
        </>
      ) : (
        <View className="gap-6">
          <View className="gap-3">
            <View className="relative h-7 w-4/5 bg-gray-300 rounded-md overflow-hidden">
              {renderShimmer()}
            </View>
            <View className="relative h-4 w-full bg-gray-300 rounded-md overflow-hidden">
              {renderShimmer()}
            </View>
            <View className="relative h-4 w-5/6 bg-gray-300 rounded-md overflow-hidden">
              {renderShimmer()}
            </View>
          </View>
          <View className="relative h-12 w-full bg-gray-300 rounded-lg overflow-hidden">
            {renderShimmer()}
          </View>
        </View>
      )}
    </View>
  );
};

export const resolveRegistrySkeletonVariant = (
  registries?: unknown[],
): RegistrySkeletonVariant => {
  if (Array.isArray(registries) && registries.length === 0) {
    return "noRegistry";
  }

  return "registry";
};

export default RegistrySkeleton;
