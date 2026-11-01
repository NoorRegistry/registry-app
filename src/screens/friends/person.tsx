import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import Typography from "@/components/Typography";
import { fetchPersonProfile } from "@/services/friends.service";
import { useQuery } from "@tanstack/react-query";
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActionButton,
  ErrorState,
  FriendsTopBar,
  PersonAvatar,
  palette,
  personName,
  styles,
} from "./components";
import { useFriendsKey, useRefreshOnFocus } from "./hooks";
import { useFriendActions } from "./actions";

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const key = useFriendsKey();
  const query = useQuery({
    queryKey: [...key, "person", id],
    queryFn: () => fetchPersonProfile(id),
    staleTime: 10000,
  });
  useRefreshOnFocus(query.refetch);
  const action = useFriendActions();
  const profile = query.data;
  if (profile?.relationship === "FRIEND")
    return <Redirect href={{ pathname: "/friends/[id]", params: { id } }} />;
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <FriendsTopBar title={t("search.profile")} />
      {query.isLoading ? (
        <ScreenSkeleton kind="person" />
      ) : query.isError || !profile ? (
        <ErrorState retry={() => void query.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={{ alignItems: "center", gap: 14, paddingVertical: 30 }}>
            <PersonAvatar person={profile.person} large />
            <Typography.Text size="xl" weight="medium">
              {personName(profile.person, t("friends.member"))}
            </Typography.Text>
            <Typography.Text style={{ color: palette.muted }}>
              {profile.person.profileCode}
              {" · "}
              {t(
                profile.profileVisibility === "Public"
                  ? "common.public"
                  : "common.private",
              )}
            </Typography.Text>
            {profile.memberSince && (
              <Typography.Text size="xs" style={{ color: palette.muted }}>
                {t("search.memberSince", {
                  date: new Date(profile.memberSince).toLocaleDateString(
                    I18nManager.isRTL ? "ar" : "en",
                    { month: "short", year: "numeric" },
                  ),
                })}
              </Typography.Text>
            )}
          </View>
          <View style={{ marginHorizontal: 20, marginTop: 30 }}>
            {profile.relationship === "NONE" && profile.canRequest ? (
              <ActionButton
                title={t("search.request")}
                busy={action.isPending}
                onPress={() => action.mutate({ kind: "send", id })}
              />
            ) : profile.relationship === "INCOMING" && profile.requestId ? (
              <View style={{ gap: 10 }}>
                <ActionButton
                  title={t("friends.acceptShort")}
                  disabled={action.isPending}
                  busy={action.isPending && action.variables?.kind === "accept"}
                  onPress={() =>
                    action.mutate({ kind: "accept", id: profile.requestId! })
                  }
                />
                <ActionButton
                  title={t("friends.decline")}
                  secondary
                  disabled={action.isPending}
                  onPress={() =>
                    action.mutate({ kind: "decline", id: profile.requestId! })
                  }
                />
              </View>
            ) : profile.relationship === "SENT" && profile.requestId ? (
              <View style={{ gap: 15 }}>
                <Typography.Text
                  style={{ textAlign: "center", color: palette.muted }}
                >
                  {t("friends.sent")}
                </Typography.Text>
                <ActionButton
                  title={t("friends.cancelRequest")}
                  secondary
                  busy={action.isPending}
                  onPress={() =>
                    action.mutate({ kind: "cancel", id: profile.requestId! })
                  }
                />
              </View>
            ) : profile.relationship === "SELF" ? (
              <ActionButton
                title={t("profile.account")}
                secondary
                onPress={() => router.push("/profile")}
              />
            ) : null}
          </View>
          <View style={{ marginHorizontal: 20, marginTop: 24 }}>
            <Typography.Text weight="medium">
              {t("privacy.registries")}
            </Typography.Text>
            {profile.registries.map((registry, index) => (
              <Pressable
                key={registry.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/registry/guest-view",
                    params: { id: registry.id },
                  })
                }
                style={{
                  paddingVertical: 18,
                  borderBottomWidth:
                    index < profile.registries.length - 1 ? 0.5 : 0,
                  borderBottomColor: palette.line,
                }}
              >
                <Typography.Text>{registry.title}</Typography.Text>
              </Pressable>
            ))}
            {!profile.registries.length && (
              <Typography.Text type="secondary" style={{ marginTop: 14 }}>
                {t(
                  profile.profileVisibility === "Private"
                    ? "privacy.noShared"
                    : "privacy.noRegistries",
                )}
              </Typography.Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
