import { useEffect, useRef } from "react";
import {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function useCartAddedAnimation(itemCount: number | undefined) {
  const previousCount = useRef(itemCount);
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const increased =
      itemCount !== undefined &&
      previousCount.current !== undefined &&
      itemCount > previousCount.current;
    previousCount.current = itemCount;

    // Loading an existing cart should not look like a new addition.
    if (!increased || reducedMotion) return;

    cancelAnimation(progress);
    progress.set(0);
    progress.set(
      withSequence(
        withTiming(1, { duration: 180 }),
        withTiming(0, { duration: 420 }),
      ),
    );
  }, [itemCount, progress, reducedMotion]);

  useEffect(() => () => cancelAnimation(progress), [progress]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -4 * progress.get() },
      { scale: 1 + 0.025 * progress.get() },
    ],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -2 * progress.get() },
      { scale: 1 + 0.2 * progress.get() },
    ],
  }));

  return { barStyle, iconStyle };
}
