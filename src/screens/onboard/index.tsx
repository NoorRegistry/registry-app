import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import constants from "@/constants";
import { Colors } from "@/constants/Colors";
import { setStorageItem } from "@/utils/storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, View, useColorScheme, useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

const OnBoard = () => {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const [onLastStep, setOnLastStep] = useState(false);
  const { t } = useTranslation();

  const onboardSteps = [
    {
      title: t("onboard.title1"),
      description: t("onboard.description1"),
      image: require("@assets/images/onboard/onboard1.png"),
    },
    {
      title: t("onboard.title2"),
      description: t("onboard.description2"),
      image: require("@assets/images/onboard/onboard2.png"),
    },
    {
      title: t("onboard.title3"),
      description: t("onboard.description3"),
      image: require("@assets/images/onboard/onboard3.png"),
    },
  ];

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  const goToLogin = () => {
    setStorageItem(constants.ONBOARDING_STORAGE_KEY, "1");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["right", "bottom", "left"]}>
      <View className="flex-1">
        <View className="flex-1">
          <Carousel
            width={width}
            loop={false}
            ref={ref}
            onProgressChange={progress}
            style={{
              width: "100%",
            }}
            data={onboardSteps}
            onConfigurePanGesture={(g) => g.enabled(false)}
            pagingEnabled={true}
            onSnapToItem={(index) => {
              if (index === onboardSteps.length - 1) {
                setOnLastStep(true);
              } else {
                setOnLastStep(false);
              }
            }}
            renderItem={({ index, item }) => (
              <View className="flex-1 items-center justify-end">
                <View key={index} className="items-center">
                  <Image source={item.image} className="mb-4" />
                  <View className="px-6 py-3">
                    <Typography.Text
                      size="lg"
                      weight="bold"
                      className="mb-2 text-center"
                    >
                      {item.title}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      size="lg"
                      className="text-center"
                    >
                      {item.description}
                    </Typography.Text>
                  </View>
                </View>
              </View>
            )}
          />
          <View className="my-6">
            <Pagination.Basic
              progress={progress}
              data={onboardSteps}
              dotStyle={{
                backgroundColor: Colors[colorScheme ?? "light"].dotsColor,
                borderRadius: 999,
                width: 12,
                height: 12,
              }}
              activeDotStyle={{
                backgroundColor: Colors[colorScheme ?? "light"].dotsColorActive,
              }}
              containerStyle={{ gap: 5, marginBottom: 10 }}
              onPress={onPressPagination}
            />
          </View>
        </View>
        <View className="flex-row justify-center gap-12 p-12">
          {onLastStep ? (
            <Button
              className="!w-full"
              type="primary"
              size="large"
              title={t("onboard.letsStart")}
              onPress={goToLogin}
            />
          ) : (
            <>
              <Button
                size="large"
                title={t("common.skip")}
                type="text"
                onPress={goToLogin}
              />
              <Button
                type="primary"
                size="large"
                title={t("common.next")}
                onPress={() => {
                  ref.current?.scrollTo({ count: 1, animated: true });
                }}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnBoard;
