import Typography from "@/components/Typography";
import { fetchFriendRequest } from "@/services/friends.service";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActionButton,
  EmptyState,
  ErrorState,
  FriendsTopBar,
  PersonAvatar,
  palette,
  personName,
  styles,
} from "./components";
import { useFriendsKey, useRefreshOnFocus } from "./hooks";
import { useFriendActions } from "./actions";

export default function FriendRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const key = useFriendsKey();
  const query = useQuery({
    queryKey: [...key, "request", id],
    queryFn: () => fetchFriendRequest(id),
    staleTime: 10000,
  });
  useRefreshOnFocus(query.refetch);
  const action = useFriendActions();
  const request = query.data;
  const person =
    request?.direction === "incoming" ? request.sender : request?.recipient;
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("friends.requestTitle")} />
      {query.isPending ? (
        <ActivityIndicator style={{ marginTop: 80 }} color={palette.accent} />
      ) : query.isError || !request || !person ? (
        <>
          <EmptyState title={t("friends.requestUnavailable")} />
          <ErrorState retry={() => void query.refetch()} />
        </>
      ) : (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 28,
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            paddingBottom: 60,
          }}
        >
          <PersonAvatar person={person} large />
          <Typography.Text
            size="2xl"
            weight="medium"
            style={{ textAlign: "center" }}
          >
            {personName(person, t("friends.member"))}
          </Typography.Text>
          <Typography.Text
            style={{
              color: palette.muted,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            {t(
              request.status === "PENDING"
                ? request.direction === "incoming"
                  ? "friends.requestIncomingDescription"
                  : "friends.requestSentDescription"
                : `friends.request${request.status}`,
            )}
          </Typography.Text>
          {request.status === "PENDING" ? (
            request.direction === "incoming" ? (
              <View style={{ gap: 12, width: "100%", marginTop: 12 }}>
                <ActionButton
                  title={t("friends.accept")}
                  icon="checkmark"
                  busy={action.isPending && action.variables?.kind === "accept"}
                  disabled={action.isPending}
                  onPress={() => action.mutate({ kind: "accept", id })}
                />
                <ActionButton
                  title={t("friends.decline")}
                  secondary
                  busy={
                    action.isPending && action.variables?.kind === "decline"
                  }
                  disabled={action.isPending}
                  onPress={() => action.mutate({ kind: "decline", id })}
                />
              </View>
            ) : (
              <ActionButton
                title={t("friends.cancelRequest")}
                secondary
                busy={action.isPending}
                onPress={() => action.mutate({ kind: "cancel", id })}
              />
            )
          ) : request.isFriend && request.friendId ? (
            <ActionButton
              title={t("friends.viewFriend")}
              onPress={() =>
                router.push({
                  pathname: "/friends/[id]",
                  params: { id: request.friendId! },
                })
              }
            />
          ) : (
            <ActionButton
              title={t("friends.backToFriends")}
              secondary
              onPress={() => router.replace("/friends")}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
