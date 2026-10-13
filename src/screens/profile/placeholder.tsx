import Typography from "@/components/Typography";
import { BrandColors } from "@/constants/Colors";
import { FriendsTopBar } from "@/screens/friends/components";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AccountPlaceholder({
  kind,
}: {
  kind: "help" | "partner";
}) {
  const { t } = useTranslation();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "bottom"]}
    >
      <FriendsTopBar
        title={t(`profile.${kind}`)}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/profile")
        }
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Typography.Text style={{ color: BrandColors.muted }}>
          {t("profile.comingSoon")}
        </Typography.Text>
      </View>
    </SafeAreaView>
  );
}
