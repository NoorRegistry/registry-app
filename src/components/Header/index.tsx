import { useGlobalStore } from "@/store";
import { getUserFirstName, getUserGender } from "@/utils/helper";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import clsx from "clsx";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Typography from "../Typography";

const getGreetingKey = () => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "common.goodMorning";
  }

  if (currentHour >= 12 && currentHour < 17) {
    return "common.goodAfternoon";
  }

  if (currentHour >= 17 && currentHour < 22) {
    return "common.goodEvening";
  }

  return "common.niceToSeeYou";
};

const Header = ({ props }: { props?: BottomTabHeaderProps }) => {
  const { t } = useTranslation();
  const isHeaderScrolled = useGlobalStore.use.isHeaderScrolled();
  const firstName = getUserFirstName();
  const gender = getUserGender();
  const greetingKey = getGreetingKey();
  const avatarSource =
    gender === "Male"
      ? require("@assets/images/login/male.png")
      : require("@assets/images/login/female.png");

  return (
    <SafeAreaView edges={["top"]} className="w-full bg-white">
      <View
        className={clsx(
          "h-[78px] w-full flex-row items-center justify-between gap-12 border-b px-4",
          isHeaderScrolled ? "border-neutral-200" : "border-transparent",
        )}
      >
        <View className="min-w-0 flex-1 gap-1">
          <Typography.Text
            numberOfLines={1}
            ellipsizeMode="tail"
            weight="bold"
            size="xl"
            className="w-full max-w-full"
          >
            {t(greetingKey, { name: firstName })}
          </Typography.Text>
          <Typography.Text
            numberOfLines={1}
            ellipsizeMode="tail"
            size="sm"
            weight="regular"
            type="primary"
            className="w-full max-w-full"
          >
            {t("common.welcomeBack")}
          </Typography.Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.me")}
          onPress={() => router.push("/(protected)/profile")}
          className="h-[54px] w-[54px] items-center justify-center rounded-full bg-primary-200"
        >
          <Image
            source={avatarSource}
            style={{ width: 54, height: 54 }}
            contentFit="cover"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Header;
