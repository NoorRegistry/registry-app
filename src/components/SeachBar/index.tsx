import Typography from "@/components/Typography";
import { SearchIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, TouchableOpacity, View, useColorScheme } from "react-native";

const SearchBar = ({ onSearchPress }: { onSearchPress: () => void }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const words = [
    t("common.stores"),
    t("common.products"),
    t("common.people"),
    t("search.code"),
  ];
  const [animatedValues] = useState(() =>
    Array.from(
      { length: 4 },
      (_, index) => new Animated.Value(index === 0 ? 1 : 0),
    ),
  ); // Initialize first word as visible

  useEffect(() => {
    let currentIndex = 0;
    let active = true;
    const interval = setInterval(() => {
      // Animate current word out
      Animated.timing(animatedValues[currentIndex], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !active) return;
        const nextIndex = (currentIndex + 1) % words.length;
        currentIndex = nextIndex;

        // Animate next word in
        Animated.timing(animatedValues[nextIndex], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
      animatedValues.forEach((value) => value.stopAnimation());
    };
  }, [animatedValues, words.length]);

  return (
    <TouchableOpacity
      onPress={onSearchPress}
      className="flex-row items-center gap-2 bg-neutral-200 rounded-lg px-4 h-12 my-2"
    >
      <SearchIcon
        width={16}
        color={Colors[colorScheme ?? "light"].tabIconDefault}
      />
      <View className="flex-row items-center">
        <Typography.Text type="secondary">{t("common.search")}</Typography.Text>
        <View className="relative overflow-hidden h-5 justify-center min-w-[80px] ml-1">
          {words.map((word, index) => (
            <Typography.AnimatedText
              key={index}
              animatedStyle={{
                opacity: animatedValues[index],
                transform: [
                  {
                    translateY: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0], // Slide in from below
                    }),
                  },
                ],
              }}
              type="secondary"
              weight="regular"
              // eslint-disable-next-line react/no-children-prop
              children={word}
              className="absolute top-0"
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchBar;
