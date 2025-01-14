import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

const RegistrySkeleton: React.FC = () => {
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
    <>
      {/* Skeleton Container */}
      <View className="p-6 w-full mt-12 bg-white rounded-2xl shadow-sm">
        {/* Title Skeleton */}
        <View className="relative h-6 w-4/5 self-center bg-gray-300 rounded-md overflow-hidden mb-4">
          {renderShimmer()}
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between gap-6 mt-4">
          {/* First Column */}
          <View className="flex-1 items-center gap-1">
            <View className="h-8 w-1/2 bg-gray-300 rounded-md relative overflow-hidden">
              {renderShimmer()}
            </View>
            <View className="h-4 w-4/5 bg-gray-300 rounded-md relative overflow-hidden">
              {renderShimmer()}
            </View>
          </View>

          {/* Second Column */}
          <View className="flex-1 items-center gap-1">
            <View className="h-8 w-1/2 bg-gray-300 rounded-md relative overflow-hidden">
              {renderShimmer()}
            </View>
            <View className="h-4 w-4/5 bg-gray-300 rounded-md relative overflow-hidden">
              {renderShimmer()}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default RegistrySkeleton;
