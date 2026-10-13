import Typography from "@/components/Typography";
import { updateFriendDiscoverability } from "@/services/friends.service";
import { getApiErrorMessage } from "@/utils/api-error";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ErrorState, FriendsTopBar, palette, styles } from "./components";
import {
  refreshFriendData,
  useFriendsSummary,
  useRefreshOnFocus,
} from "./hooks";

export default function FriendSettingsScreen() {
  const { t } = useTranslation();
  const summary = useFriendsSummary();
  useRefreshOnFocus(summary.refetch);
  const mutation = useMutation({
    mutationFn: updateFriendDiscoverability,
    onSuccess: async () => {
      await refreshFriendData();
      Toast.show({ type: "success", text1: t("common.saved") });
    },
    onError: (error) =>
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("common.error")),
      }),
  });
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("friends.settings")} />
      {summary.isPending ? (
        <ActivityIndicator style={{ marginTop: 80 }} color={palette.accent} />
      ) : summary.isError ? (
        <ErrorState retry={() => void summary.refetch()} />
      ) : (
        <View style={styles.sectionContent}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
            <Typography.Text weight="medium" size="lg" style={{ flex: 1 }}>
              {t("friends.discoverableTitle")}
            </Typography.Text>
            <Switch
              accessibilityLabel={t("friends.discoverableTitle")}
              value={
                mutation.isPending
                  ? mutation.variables
                  : summary.data?.discoverable
              }
              disabled={mutation.isPending}
              onValueChange={(value) => mutation.mutate(value)}
              trackColor={{ true: palette.accent, false: palette.line }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
