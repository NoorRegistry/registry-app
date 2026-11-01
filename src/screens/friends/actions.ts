import {
  respondToFriendRequest,
  sendFriendRequest,
} from "@/services/friends.service";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { refreshFriendData, useFriendsSummary } from "./hooks";
import { getApiErrorMessage } from "@/utils/api-error";

export function useFriendActions() {
  const { t } = useTranslation();
  const summary = useFriendsSummary();
  return useMutation({
    mutationFn: (action: {
      kind: "send" | "accept" | "decline" | "cancel";
      id: string;
    }) =>
      action.kind === "send"
        ? sendFriendRequest(action.id).then((result) => ({
            friendId: result.recipient.id,
          }))
        : respondToFriendRequest(action.id, action.kind),
    onSuccess: async (result, action) => {
      await refreshFriendData();
      if (
        action.kind === "accept" &&
        summary.data?.profileVisibility !== "Public"
      ) {
        Alert.alert(
          t("friends.connectedTitle"),
          t("friends.connectedDescription"),
          [
            { text: t("friends.later"), style: "cancel" },
            {
              text: t("friends.shareNow"),
              onPress: () =>
                router.push({
                  pathname: "/friends/[id]",
                  params: { id: result.friendId, share: "1" },
                }),
            },
          ],
        );
      } else
        Toast.show({
          type: "success",
          text1:
            action.kind === "accept"
              ? t("friends.connectedTitle")
              : t(`friends.${action.kind}Success`),
        });
    },
    onError: async (error) => {
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("common.error")),
      });
      await refreshFriendData();
    },
  });
}
