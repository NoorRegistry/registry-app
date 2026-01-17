import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import constants from "@/constants";
import { setStorageItem } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  LayoutChangeEvent,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const OnBoard = () => {
  const ref = React.useRef<ICarouselInstance>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const slideProgress = useSharedValue(0);
  const { t } = useTranslation();
  const slideDurationMs = 5000;

  const onboardSteps = [
    {
      title: t("onboard.title1"),
      description: t("onboard.description1"),
      image: require("@assets/images/onboard/wedding.png"),
    },
    {
      title: t("onboard.title2"),
      description: t("onboard.description2"),
      image: require("@assets/images/onboard/birthday.jpg"),
    },
    {
      title: t("onboard.title3"),
      description: t("onboard.description3"),
      image: require("@assets/images/onboard/graduation.jpg"),
    },
  ];

  const handleAutoAdvance = useCallback(() => {
    ref.current?.scrollTo({ count: 1, animated: true });
  }, []);

  const startSlideProgress = useCallback(() => {
    cancelAnimation(slideProgress);
    slideProgress.value = 0;
    slideProgress.value = withTiming(
      1,
      { duration: slideDurationMs },
      (finished) => {
        if (finished) {
          runOnJS(handleAutoAdvance)();
        }
      },
    );
  }, [handleAutoAdvance, slideProgress]);

  const goToLogin = () => {
    setStorageItem(constants.ONBOARDING_STORAGE_KEY, "1");
    router.replace("/login");
  };

  const handleBarLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!barWidth) {
        setBarWidth(event.nativeEvent.layout.width);
      }
    },
    [barWidth],
  );

  useEffect(() => {
    startSlideProgress();
    return () => cancelAnimation(slideProgress);
  }, [currentIndex, startSlideProgress, slideProgress]);

  const paginationTop = useMemo(() => insets.top + 12, [insets.top]);

  return (
    <View className="flex-1">
      <View
        className="absolute left-6 right-6 z-10"
        style={{ top: paginationTop }}
      >
        <View className="flex-row gap-2">
          {onboardSteps.map((step, index) => (
            <ProgressBar
              key={step.title}
              barWidth={barWidth}
              isActive={index === currentIndex}
              isCompleted={index < currentIndex}
              onLayout={index === 0 ? handleBarLayout : undefined}
              progress={slideProgress}
            />
          ))}
        </View>
      </View>
      <Carousel
        width={width}
        loop={true}
        ref={ref}
        style={{ width: "100%" }}
        data={onboardSteps}
        onConfigurePanGesture={(g) => g.enabled(false)}
        pagingEnabled={true}
        onSnapToItem={(index) => {
          setCurrentIndex(index);
        }}
        renderItem={({ index, item }) => (
          <View key={index} className="flex-1">
            <ImageBackground
              source={item.image}
              resizeMode="cover"
              className="flex-1"
            >
              <View className="absolute inset-0 bg-[#100E0E]/30" />
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0)",
                  "rgba(0,0,0,0.01)",
                  "rgba(0,0,0,0.1)",
                  "rgba(0,0,0,0.2)",
                  "rgba(0,0,0,0.4)",
                  "#000000",
                ]}
                locations={[0, 0.2, 0.3, 0.4, 0.5, 1]}
                style={{ flex: 1 }}
                className="absolute inset-0"
              >
                <SafeAreaView
                  edges={["bottom"]}
                  className="flex-1 justify-end px-[22px] pb-[32px]"
                >
                  <View className="gap-4 pb-2">
                    <Typography.Text
                      weight="bold"
                      className="!text-[#FAF2F0]"
                      style={{
                        fontSize: 30,
                        letterSpacing: 3.9,
                        lineHeight: 34,
                      }}
                    >
                      {item.title}
                    </Typography.Text>
                    <View className="h-[1px] w-full bg-[#FAF2F0]/80" />
                    <Typography.Text
                      className="!text-[#FAF2F0]"
                      style={{ fontSize: 16, lineHeight: 22 }}
                    >
                      {item.description}
                    </Typography.Text>
                  </View>
                  <Button
                    className="mt-8 w-full"
                    type="primary"
                    size="large"
                    rounded={false}
                    labelClass="normal-case"
                    title={t("onboard.letsStart")}
                    onPress={goToLogin}
                  />
                </SafeAreaView>
              </LinearGradient>
            </ImageBackground>
          </View>
        )}
      />
    </View>
  );
};

export default OnBoard;

type ProgressBarProps = {
  isActive: boolean;
  isCompleted: boolean;
  barWidth: number;
  progress: SharedValue<number>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const ProgressBar = ({
  isActive,
  isCompleted,
  barWidth,
  progress,
  onLayout,
}: ProgressBarProps) => {
  const trackColor = "rgba(255, 255, 255, 0.4)";
  const animatedStyle = useAnimatedStyle(() => {
    if (isActive) {
      return { width: barWidth * progress.value };
    }
    return { width: isCompleted ? barWidth : 0 };
  }, [barWidth, isActive, isCompleted]);

  return (
    <View
      onLayout={onLayout}
      className="flex-1 overflow-hidden rounded-full"
      style={{ height: 4, backgroundColor: trackColor }}
    >
      <Animated.View
        style={[{ height: "100%", backgroundColor: "#FFFFFF" }, animatedStyle]}
      />
    </View>
  );
};
