import { CommerceText } from "@/components/Commerce";
import { BrandColors as colors } from "@/constants/Colors";
import { IProductCategory } from "@/types";
import { getEnArName } from "@/utils/helper";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, ScrollView, View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function CategoryTabs({
  categories,
  selectedId,
  onSelect,
}: {
  categories: IProductCategory[];
  selectedId?: string;
  onSelect: (id?: string) => void;
}) {
  const { t } = useTranslation();
  const [layouts, setLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const initialized = useRef(false);
  const [contentWidth, setContentWidth] = useState(0);
  const offset = useSharedValue(0);
  const width = useSharedValue(0);
  const selectedLayout = layouts[selectedId ?? "all"];

  useEffect(() => {
    if (!selectedLayout || !contentWidth) return;
    const config = {
      damping: 26,
      stiffness: 260,
      mass: 0.8,
      overshootClamping: true,
      reduceMotion: ReduceMotion.System,
    };
    const x = I18nManager.isRTL
      ? selectedLayout.x + selectedLayout.width - contentWidth
      : selectedLayout.x;
    offset.value = initialized.current ? withSpring(x, config) : x;
    width.value = initialized.current
      ? withSpring(selectedLayout.width, config)
      : selectedLayout.width;
    initialized.current = true;
  }, [contentWidth, offset, selectedLayout, width]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{ translateX: offset.value }],
  }));
  const tabs = [
    { id: undefined, label: t("store.all") },
    ...categories.map((category) => ({
      id: category.id,
      label: getEnArName(category.nameEn, category.nameAr),
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        flexGrow: 0,
        flexShrink: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}
    >
      <View
        onLayout={({ nativeEvent: { layout } }) =>
          setContentWidth(layout.width)
        }
        style={{ flexDirection: "row", paddingHorizontal: 16, gap: 20 }}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.id ?? "all"}
            testID={`category-tab-${tab.id ?? "all"}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab.id === selectedId }}
            onPress={() => onSelect(tab.id)}
            onLayout={({ nativeEvent: { layout } }) => {
              const { x, width } = layout;
              setLayouts((previous) => ({
                ...previous,
                [tab.id ?? "all"]: { x, width },
              }));
            }}
            style={{ minHeight: 46, justifyContent: "center" }}
          >
            <CommerceText
              size="xs"
              numberOfLines={1}
              style={{
                color: tab.id === selectedId ? colors.deep : colors.muted,
              }}
            >
              {tab.label}
            </CommerceText>
          </Pressable>
        ))}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              start: 0,
              bottom: 0,
              height: 2,
              backgroundColor: colors.primary,
            },
            indicatorStyle,
          ]}
        />
      </View>
    </ScrollView>
  );
}
