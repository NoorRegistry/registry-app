import { useGlobalStore } from "@/store";
import { useNotificationSummary } from "@/hooks/useNotifications";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getUserFirstName } from "@/utils/helper";
import { BottomTabHeaderProps } from "expo-router/js-tabs";
import { clsx } from "clsx";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
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
  const greetingKey = getGreetingKey();
  const notifications = useNotificationSummary();

  return (
    <SafeAreaView edges={["top"]} className="w-full bg-white">
      <View
        className={clsx(
          "h-[78px] w-full flex-row items-center justify-between gap-3 border-b px-4",
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
          accessibilityLabel={t("notifications.title")}
          onPress={() => router.push("/notifications")}
          style={{
            width: 42,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="notifications-outline" size={23} color="#202421" />
          {!!notifications.data?.unreadCount && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: 3,
                top: 4,
                minWidth: 16,
                height: 16,
                paddingHorizontal: 3,
                borderRadius: 8,
                backgroundColor: "#C78063",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                maxFontSizeMultiplier={1.2}
                style={{
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: "600",
                  lineHeight: 16,
                  textAlign: "center",
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
              >
                {notifications.data.unreadCount > 99
                  ? "99+"
                  : notifications.data.unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Header;
