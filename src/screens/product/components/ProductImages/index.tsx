import { Colors } from "@/constants/Colors";
import { IProduct } from "@/types";
import { getImageUrl } from "@/utils/helper";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, View, useColorScheme } from "react-native";
import Animated, {
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

function ProductImages({ images }: { images: IProduct["images"] }) {
  const colorScheme = useColorScheme();
  const currentPage = useSharedValue(0);
  const dots = images?.length || 0;

  const activeDotColor = Colors[colorScheme ?? "light"].dotsColorActive;
  const dotColor = Colors[colorScheme ?? "light"].dotsColor;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      currentPage.value = event.contentOffset.x / width;
    },
  });

  return (
    <View className="absolute top-0 w-full bg-gray-300">
      <Animated.FlatList
        data={images}
        horizontal
        pagingEnabled
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Image
            source={
              item.path
                ? getImageUrl(item.path)
                : require("@assets/images/icon.png") // Fallback to app icon
            }
            style={{ width: width, height: 288 }}
            contentFit="cover"
          />
        )}
      />
      <View className="absolute bottom-4 w-full flex-row justify-center items-center">
        <View className="px-4 py-2 bg-black/50 rounded-full flex-row bg-gray-400/40">
          {Array.from({ length: dots }).map((_, index) => (
            <Dot
              key={index}
              index={index}
              currentPage={currentPage}
              dotColor={dotColor}
              activeDotColor={activeDotColor}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default ProductImages;

// Separate component for individual dots
const Dot = ({
  index,
  currentPage,
  dotColor,
  activeDotColor,
}: {
  index: number;
  currentPage: SharedValue<number>;
  dotColor: string;
  activeDotColor: string;
}) => {
  const dotStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      currentPage.value,
      [index - 1, index, index + 1],
      [0.6, 1, 0.6],
      "clamp",
    ),
    width: interpolate(
      currentPage.value,
      [index - 1, index, index + 1],
      [10, 24, 10],
      "clamp",
    ),
    height: 10,
    borderRadius: interpolate(
      currentPage.value,
      [index - 1, index, index + 1],
      [5, 10, 5],
      "clamp",
    ),
    backgroundColor: interpolateColor(
      currentPage.value,
      [index - 1, index, index + 1],
      [dotColor, activeDotColor, dotColor],
    ),
    transform: [
      {
        scale: interpolate(
          currentPage.value,
          [index - 1, index, index + 1],
          [0.8, 1, 0.8],
          "clamp",
        ),
      },
    ],
  }));

  const staticStyle = {
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  };

  return <Animated.View className="mx-1" style={[staticStyle, dotStyle]} />;
};
