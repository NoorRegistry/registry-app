import { BrandColors } from "@/constants/Colors";
import { useEffect } from "react";
import Animated, {
  interpolateColor,
  ReduceMotion,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function PaginationDot({
  index,
  small,
  progress,
}: {
  index: number;
  small: boolean;
  progress: SharedValue<number>;
}) {
  const diameter = useSharedValue(small ? 4 : 6);
  useEffect(() => {
    diameter.value = withTiming(small ? 4 : 6, {
      duration: 180,
      reduceMotion: ReduceMotion.System,
    });
  }, [diameter, small]);
  const style = useAnimatedStyle(() => {
    // Track the finger's position, so adjacent dots trade focus during the swipe.
    const focus = Math.max(0, 1 - Math.abs(progress.value - index));
    return {
      width: diameter.value + (18 - diameter.value) * focus,
      height: diameter.value + (6 - diameter.value) * focus,
      opacity: 0.55 + 0.45 * focus,
      backgroundColor: interpolateColor(
        focus,
        [0, 1],
        ["#CFC3BD", BrandColors.primary],
      ),
    };
  });
  return <Animated.View style={[{ borderRadius: 4 }, style]} />;
}
