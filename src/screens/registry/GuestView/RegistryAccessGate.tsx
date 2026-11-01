import { RegistryAccessDenied } from "@/api/http";
import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import { useFriendActions } from "@/screens/friends/actions";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function RegistryAccessGate({
  access,
  retry,
}: {
  access?: RegistryAccessDenied;
  retry: () => void;
}) {
  const { t } = useTranslation();
  const action = useFriendActions();
  return (
    <View className="flex-1 justify-center px-6 gap-5">
      <Typography.Text weight="medium">
        {t(
          access?.reason === "NOT_SHARED"
            ? "privacy.notShared"
            : access
              ? "privacy.privateRegistry"
              : "common.error",
        )}
      </Typography.Text>
      {access?.requestDirection === "sent" && (
        <Typography.Text type="secondary">{t("friends.sent")}</Typography.Text>
      )}
      {access?.owner && (
        <Button
          title={t("search.profile")}
          onPress={() =>
            router.push({
              pathname: "/people/[id]",
              params: { id: access.owner!.id },
            })
          }
        />
      )}
      {access?.canRequest && access.owner && (
        <Button
          title={t("friends.addFriend")}
          loading={action.isPending}
          onPress={() => action.mutate({ kind: "send", id: access.owner!.id })}
        />
      )}
      {access?.requestDirection === "incoming" && access.requestId && (
        <>
          <Button
            title={t("friends.acceptShort")}
            disabled={action.isPending}
            onPress={() =>
              action.mutate({ kind: "accept", id: access.requestId! })
            }
          />
          <Button
            title={t("friends.decline")}
            disabled={action.isPending}
            onPress={() =>
              action.mutate({ kind: "decline", id: access.requestId! })
            }
          />
        </>
      )}
      {access?.requestDirection === "sent" && access.requestId && (
        <Button
          title={t("friends.cancelRequest")}
          disabled={action.isPending}
          onPress={() =>
            action.mutate({ kind: "cancel", id: access.requestId! })
          }
        />
      )}
      <Button title={t("friends.retry")} onPress={retry} />
    </View>
  );
}
