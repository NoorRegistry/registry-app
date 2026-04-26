import Typography from "@/components/Typography";
import constants from "@/constants";
import i18n from "@/i18n";
import { useGlobalStore } from "@/store";
import {
  clearSessionData,
  getUserEmail,
  getUserFirstLastName,
  getUserGender,
} from "@/utils/helper";
import { setStorageItem } from "@/utils/storage";
import clsx from "clsx";
import { reloadAppAsync } from "expo";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LanguageCode = "en" | "ar";

const appVersion = Constants.expoConfig?.version ?? "1.0.2";
const appBuild =
  Constants.expoConfig?.ios?.buildNumber ??
  Constants.expoConfig?.android?.versionCode?.toString() ??
  appVersion;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const logout = useGlobalStore.use.signOut();
  const name = getUserFirstLastName() || getUserEmail();
  const email = getUserEmail();
  const gender = getUserGender();
  const avatarSource =
    gender === "Male"
      ? require("@assets/images/login/male.png")
      : require("@assets/images/login/female.png");

  const handleLogout = () => {
    clearSessionData();
    logout();
    router.replace("/login");
  };

  const handleLanguageChange = async (language: LanguageCode) => {
    if (i18n.language === language) return;

    setStorageItem(constants.USER_SELECTED_LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);

    const shouldUseRTL = language === "ar";
    if (I18nManager.isRTL !== shouldUseRTL) {
      I18nManager.allowRTL(shouldUseRTL);
      I18nManager.forceRTL(shouldUseRTL);
      await reloadAppAsync();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center gap-4 rounded-xl bg-primary-50 p-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-200">
            <Image
              source={avatarSource}
              style={{ width: 64, height: 64 }}
              contentFit="cover"
            />
          </View>
          <View className="flex-1 gap-1">
            <Typography.Text size="lg" weight="bold" numberOfLines={1}>
              {name}
            </Typography.Text>
            <Typography.Text
              size="sm"
              weight="regular"
              type="secondary"
              numberOfLines={1}
            >
              {email}
            </Typography.Text>
          </View>
        </View>

        <SettingsSection title={t("profile.preferences")}>
          <LanguageOption
            label={t("profile.english")}
            selected={i18n.language === "en"}
            onPress={() => handleLanguageChange("en")}
          />
          <LanguageOption
            label={t("profile.arabic")}
            selected={i18n.language === "ar"}
            onPress={() => handleLanguageChange("ar")}
          />
        </SettingsSection>

        <SettingsSection title={t("profile.account")}>
          <SettingsRow
            label={t("common.logout")}
            labelType="danger"
            onPress={handleLogout}
          />
        </SettingsSection>
      </ScrollView>

      <View className="border-t border-neutral-100 px-4 py-3">
        <Typography.Text size="xs" type="secondary" className="text-center">
          {t("profile.versionBuild", {
            version: appVersion,
            build: appBuild,
          })}
        </Typography.Text>
      </View>
    </SafeAreaView>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <Typography.Text
        size="sm"
        weight="medium"
        type="secondary"
        className="mb-2"
      >
        {title}
      </Typography.Text>
      <View className="overflow-hidden rounded-xl border border-neutral-100 bg-white">
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  label,
  labelType = "default",
  trailing,
  onPress,
}: {
  label: string;
  labelType?: React.ComponentProps<typeof Typography.Text>["type"];
  trailing?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-14 flex-row items-center justify-between border-b border-neutral-100 px-4 py-3 last:border-b-0"
    >
      <View className="min-w-0 flex-1">
        <Typography.Text
          size="base"
          weight="regular"
          type={labelType}
          numberOfLines={1}
        >
          {label}
        </Typography.Text>
      </View>
      {trailing ? <View className="shrink-0">{trailing}</View> : null}
    </Pressable>
  );
}

function LanguageOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <SettingsRow
      label={label}
      onPress={onPress}
      trailing={
        <View
          className={clsx(
            "h-5 w-5 items-center justify-center rounded-full border-2",
            selected ? "border-primary-500" : "border-neutral-300",
          )}
        >
          {selected ? (
            <View className="h-2.5 w-2.5 rounded-full bg-primary-500" />
          ) : null}
        </View>
      }
    />
  );
}
