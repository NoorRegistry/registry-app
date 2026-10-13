import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const widths = ["64%", "48%", "72%", "56%", "62%"] as const;

export default function ResultRowsSkeleton({
  kind = "people",
  showAction = false,
}: {
  kind?: "people" | "products" | "stores";
  showAction?: boolean;
}) {
  const { t } = useTranslation();
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.set(
      withRepeat(
        withTiming(0.55, {
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          reduceMotion: ReduceMotion.System,
        }),
        -1,
        true,
        undefined,
        ReduceMotion.System,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const people = kind === "people";
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessibilityLabel={t("common.loading")}
    >
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={pulse}
      >
        {widths.map((width, index) => (
          <View
            key={index}
            style={[
              styles.row,
              {
                marginHorizontal: people ? 22 : 20,
                paddingVertical: people ? 10 : 12,
              },
            ]}
          >
            <View
              style={[
                styles.placeholder,
                {
                  width: people ? 52 : 58,
                  height: people ? 52 : 58,
                  borderRadius: people ? 26 : 10,
                },
              ]}
            />
            <View style={styles.identity}>
              <View style={[styles.placeholder, styles.title, { width }]} />
              {kind !== "stores" && (
                <View
                  style={[
                    styles.subtitle,
                    { width: index % 2 ? "38%" : "46%" },
                  ]}
                />
              )}
            </View>
            {people && showAction && (
              <View style={[styles.placeholder, styles.action]} />
            )}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 13 },
  placeholder: { backgroundColor: "#E9EBEE" },
  identity: { flex: 1, gap: 9 },
  title: { height: 12, borderRadius: 4 },
  subtitle: { height: 9, borderRadius: 3, backgroundColor: "#F0F1F3" },
  action: { width: 78, height: 44, borderRadius: 10 },
});
