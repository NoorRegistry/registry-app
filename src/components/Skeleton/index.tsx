import { BrandColors } from "@/constants/Colors";
import { PropsWithChildren, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useAnimatedValue,
} from "react-native";

export function Skeleton({
  children,
  style,
  testID,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>) {
  const { t } = useTranslation();
  const opacity = useAnimatedValue(1);
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    const update = (reduceMotion: boolean) => {
      if (!active) return;
      animation?.stop();
      opacity.setValue(1);
      if (reduceMotion) return;
      const timing = (toValue: number) =>
        Animated.timing(opacity, {
          toValue,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== "web",
          isInteraction: false,
        });
      animation = Animated.loop(Animated.sequence([timing(0.55), timing(1)]));
      animation.start();
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(update, () =>
      update(true),
    );
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      update,
    );
    return () => {
      active = false;
      subscription.remove();
      animation?.stop();
    };
  }, [opacity]);
  return (
    <View
      testID={testID}
      style={[{ width: "100%" }, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessibilityLabel={t("common.loading")}
    >
      <Animated.View
        pointerEvents="none"
        style={{ flexGrow: 1, opacity }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {children}
      </Animated.View>
    </View>
  );
}

export function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.block, style]} />;
}
const styles = StyleSheet.create({
  block: { height: 14, borderRadius: 4, backgroundColor: BrandColors.line },
});
