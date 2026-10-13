import Typography from "@/components/Typography";
import constants from "@/constants";
import { BrandColors } from "@/constants/Colors";
import i18n from "@/i18n";
import { FriendsTopBar } from "@/screens/friends/components";
import { AccountRow } from "@/screens/profile/components";
import { updateNotificationSettings } from "@/services/notifications.service";
import { setStorageItem } from "@/utils/storage";
import Feather from "@expo/vector-icons/Feather";
import { reloadAppAsync } from "expo";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export default function SettingsScreen() {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const changeLanguage = async (language: "en" | "ar") => {
    if (i18n.language === language || saving) return;
    setSaving(true);
    const previous = i18n.language;
    try {
      await i18n.changeLanguage(language);
      setStorageItem(constants.USER_SELECTED_LANGUAGE_STORAGE_KEY, language);
      void updateNotificationSettings({ language }).catch(() => undefined);
      const rtl = language === "ar";
      if (I18nManager.isRTL !== rtl) {
        I18nManager.allowRTL(rtl);
        I18nManager.forceRTL(rtl);
        await reloadAppAsync();
      }
    } catch {
      await i18n.changeLanguage(previous);
      setStorageItem(constants.USER_SELECTED_LANGUAGE_STORAGE_KEY, previous);
      Toast.show({ type: "error", text1: t("common.error") });
    } finally {
      setSaving(false);
    }
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "bottom"]}
    >
      <FriendsTopBar
        title={t("profile.settings")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/profile")
        }
      />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Typography.Text
          size="xs"
          weight="medium"
          style={{ color: BrandColors.muted, marginBottom: 10 }}
        >
          {t("profile.language")}
        </Typography.Text>
        {(["en", "ar"] as const).map((language, index) => (
          <Pressable
            key={language}
            accessibilityRole="radio"
            accessibilityLabel={t(
              language === "en" ? "profile.english" : "profile.arabic",
            )}
            accessibilityState={{
              checked: i18n.language === language,
              disabled: saving,
            }}
            disabled={saving}
            onPress={() => void changeLanguage(language)}
            style={{
              minHeight: 60,
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: index === 0 ? 1 : 0,
              borderBottomColor: BrandColors.line,
              gap: 14,
            }}
          >
            <Feather name="globe" size={18} color={BrandColors.ink} />
            <Typography.Text size="base" style={{ flex: 1 }}>
              {t(language === "en" ? "profile.english" : "profile.arabic")}
            </Typography.Text>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor:
                  i18n.language === language ? BrandColors.primary : "#CCC2BC",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i18n.language === language && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: BrandColors.primary,
                  }}
                />
              )}
            </View>
          </Pressable>
        ))}
        <View style={{ marginTop: 26 }}>
          <AccountRow
            label={t("notifications.settings")}
            icon="notifications"
            last
            onPress={() => router.push("/notifications/settings")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
