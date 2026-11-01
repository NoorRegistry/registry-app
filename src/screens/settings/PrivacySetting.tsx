import Typography from "@/components/Typography";
import { BrandColors } from "@/constants/Colors";
import {
  useFriendsSummary,
  useRefreshOnFocus,
  refreshFriendData,
} from "@/screens/friends/hooks";
import {
  updateFriendSettings,
  ProfileVisibility,
} from "@/services/friends.service";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";

export default function PrivacySetting() {
  const { t } = useTranslation();
  const summary = useFriendsSummary();
  useRefreshOnFocus(summary.refetch);
  const mutation = useMutation({
    mutationFn: (profileVisibility: ProfileVisibility) =>
      updateFriendSettings({ profileVisibility }),
    onSuccess: async () => {
      await refreshFriendData();
      Toast.show({ type: "success", text1: t("common.saved") });
    },
    onError: () => Toast.show({ type: "error", text1: t("common.error") }),
  });
  const value = mutation.isPending
    ? mutation.variables
    : summary.data?.profileVisibility;
  return (
    <View style={{ gap: 10, marginBottom: 28 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Typography.Text weight="medium" style={{ flex: 1 }}>
          {t("privacy.accountPrivacy")}
        </Typography.Text>
        {(summary.isLoading || mutation.isPending) && (
          <ActivityIndicator
            accessibilityLabel={t("privacy.saving")}
            color={BrandColors.primary}
          />
        )}
      </View>
      {summary.isError ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void summary.refetch()}
        >
          <Typography.Text type="danger">{t("friends.retry")}</Typography.Text>
        </Pressable>
      ) : (
        (["Public", "Private"] as const).map((option, index) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityLabel={t(
              option === "Public" ? "common.public" : "common.private",
            )}
            accessibilityState={{
              checked: value === option,
              disabled: mutation.isPending || !value,
            }}
            disabled={mutation.isPending || !value}
            onPress={() => value !== option && mutation.mutate(option)}
            style={{
              flexDirection: "row",
              gap: 16,
              alignItems: "center",
              paddingVertical: 14,
              borderBottomWidth: index === 0 ? 0.5 : 0,
              borderBottomColor: BrandColors.line,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Typography.Text>
                {t(option === "Public" ? "common.public" : "common.private")}
              </Typography.Text>
              <Typography.Text size="xs" type="secondary">
                {t(
                  option === "Public"
                    ? "privacy.publicDescription"
                    : "privacy.privateDescription",
                )}
              </Typography.Text>
            </View>
            <Typography.Text type="primary">
              {value === option ? "●" : "○"}
            </Typography.Text>
          </Pressable>
        ))
      )}
    </View>
  );
}
