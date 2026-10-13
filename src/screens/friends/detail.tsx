import { queryClient } from "@/api/queryClient";
import Typography from "@/components/Typography";
import {
  fetchFriendDetails,
  FriendDetails,
  removeFriend,
  shareFriendRegistry,
  SharedRegistry,
} from "@/services/friends.service";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { getApiErrorMessage } from "@/utils/api-error";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  EmptyState,
  ErrorState,
  FriendsTopBar,
  MotionButton,
  PersonAvatar,
  palette,
  personName,
  styles,
} from "./components";
import { refreshFriendData, useFriendsKey, useRefreshOnFocus } from "./hooks";

function RegistryRow({
  registry,
  checked,
  onPress,
  showDivider = true,
  disabled = false,
  busy = false,
  visibility,
}: {
  registry: SharedRegistry;
  checked?: boolean;
  onPress: () => void;
  showDivider?: boolean;
  disabled?: boolean;
  busy?: boolean;
  visibility?: "shared" | "hidden";
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole={checked === undefined ? "button" : "checkbox"}
      accessibilityState={checked === undefined ? undefined : { checked }}
      accessibilityLabel={registry.title}
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: "row",
        gap: 13,
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: palette.line,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 15,
          backgroundColor: palette.peach,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {registry.logo ? (
          <Image
            source={getImageUrl(registry.logo)}
            style={{ width: 48, height: 48 }}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="gift-outline" size={22} color={palette.accent} />
        )}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Typography.Text weight="medium">{registry.title}</Typography.Text>
        <Typography.Text size="xs" style={{ color: palette.muted }}>
          {getEnArName(registry.category.nameEn, registry.category.nameAr)}
        </Typography.Text>
      </View>
      {visibility && (
        <Typography.Text
          size="xs"
          style={{
            color: visibility === "shared" ? palette.accent : palette.muted,
          }}
        >
          {t(`friends.${visibility}`)}
        </Typography.Text>
      )}
      {busy ? (
        <ActivityIndicator color={palette.accent} />
      ) : (
        <Ionicons
          name={
            checked === undefined
              ? I18nManager.isRTL
                ? "chevron-back"
                : "chevron-forward"
              : checked
                ? "checkbox"
                : "square-outline"
          }
          size={checked === undefined ? 18 : 23}
          color={checked ? palette.accent : palette.muted}
        />
      )}
    </Pressable>
  );
}

export default function FriendDetailScreen() {
  const { id, share } = useLocalSearchParams<{ id: string; share?: string }>();
  const { t } = useTranslation();
  const key = useFriendsKey();
  const [tab, setTab] = useState<"received" | "sharing">(
    share === "1" ? "sharing" : "received",
  );
  const detailKey = [...key, "detail", id];
  const query = useQuery({
    queryKey: detailKey,
    queryFn: () => fetchFriendDetails(id),
    staleTime: 10000,
  });
  useRefreshOnFocus(query.refetch);
  const mutation = useMutation({
    mutationFn: () => removeFriend(id),
    onSuccess: async () => {
      router.replace("/friends");
      await refreshFriendData();
      Toast.show({ type: "success", text1: t("friends.unfriendSuccess") });
    },
    onError: async (error) => {
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("common.error")),
      });
      await query.refetch();
    },
  });
  const sharing = useMutation({
    mutationFn: ({
      registryId,
      shared,
    }: {
      registryId: string;
      shared: boolean;
    }) => shareFriendRegistry(id, registryId, shared),
    onMutate: async ({ registryId, shared }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<FriendDetails>(detailKey);
      queryClient.setQueryData<FriendDetails>(detailKey, (current) =>
        current
          ? {
              ...current,
              yourRegistries: current.yourRegistries.map((registry) =>
                registry.id === registryId
                  ? { ...registry, isShared: shared }
                  : registry,
              ),
            }
          : current,
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous)
        queryClient.setQueryData(detailKey, context.previous);
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("common.error")),
      });
    },
    onSettled: refreshFriendData,
  });
  const data = query.data;
  const name = data
    ? personName(data.friend, t("friends.member"))
    : t("friends.friend");
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("friends.friend")} />
      {query.isPending ? (
        <ActivityIndicator style={{ marginTop: 80 }} color={palette.accent} />
      ) : !data ? (
        <>
          <EmptyState title={t("friends.friendUnavailable")} />
          <ErrorState retry={() => void query.refetch()} />
        </>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View
              style={{ alignItems: "center", gap: 13, paddingVertical: 26 }}
            >
              <PersonAvatar person={data.friend} large />
              <Typography.Text size="2xl" weight="medium">
                {name}
              </Typography.Text>
              <Typography.Text size="xs" style={{ color: palette.muted }}>
                {t("friends.friendSince", {
                  date: new Date(data.since).toLocaleDateString(
                    I18nManager.isRTL ? "ar" : "en",
                    { month: "long", year: "numeric" },
                  ),
                })}
              </Typography.Text>
            </View>
            <View style={styles.tabs}>
              {(["received", "sharing"] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === value }}
                  onPress={() => setTab(value)}
                  style={[styles.tab, tab === value && styles.activeTab]}
                >
                  <View
                    style={{
                      minWidth: 22,
                      height: 22,
                      paddingHorizontal: 5,
                      borderRadius: 11,
                      backgroundColor:
                        tab === value ? palette.peach : "#F5F3F1",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography.Text
                      size="xs"
                      weight="medium"
                      style={{
                        color: tab === value ? palette.accent : palette.muted,
                      }}
                    >
                      {value === "received"
                        ? data.sharedWithYou.length
                        : data.yourRegistries.filter(
                            (registry) => registry.isShared,
                          ).length}
                    </Typography.Text>
                  </View>
                  <Typography.Text
                    size="sm"
                    weight="medium"
                    style={{
                      color: tab === value ? palette.ink : palette.muted,
                      flexShrink: 1,
                    }}
                  >
                    {t(
                      value === "received"
                        ? "friends.sharedWithYou"
                        : "friends.sharedByYou",
                    )}
                  </Typography.Text>
                </Pressable>
              ))}
            </View>
            {tab === "received" ? (
              <View style={styles.sectionContent}>
                {data.sharedWithYou.length ? (
                  data.sharedWithYou.map((registry, index) => (
                    <RegistryRow
                      key={registry.id}
                      registry={registry}
                      showDivider={index < data.sharedWithYou.length - 1}
                      onPress={() =>
                        router.push({
                          pathname: "/registry/guest-view",
                          params: { id: registry.id },
                        })
                      }
                    />
                  ))
                ) : (
                  <Typography.Text
                    style={{
                      color: palette.muted,
                      marginTop: 12,
                      lineHeight: 23,
                    }}
                  >
                    {t("friends.noSharedWithYou")}
                  </Typography.Text>
                )}
              </View>
            ) : (
              <View style={styles.sectionContent}>
                {data.yourRegistries.map((registry, index) => (
                  <RegistryRow
                    key={registry.id}
                    registry={registry}
                    visibility={registry.isShared ? "shared" : "hidden"}
                    checked={!!registry.isShared}
                    disabled={sharing.isPending || mutation.isPending}
                    busy={
                      sharing.isPending &&
                      sharing.variables?.registryId === registry.id
                    }
                    showDivider={index < data.yourRegistries.length - 1}
                    onPress={() =>
                      sharing.mutate({
                        registryId: registry.id,
                        shared: !registry.isShared,
                      })
                    }
                  />
                ))}
                {!data.yourRegistries.length && (
                  <Typography.Text
                    style={{ color: palette.muted, marginTop: 12 }}
                  >
                    {t("friends.noYourRegistries")}
                  </Typography.Text>
                )}
              </View>
            )}
          </ScrollView>
          <View
            style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 8 }}
          >
            <MotionButton
              label={t("friends.unfriend")}
              disabled={mutation.isPending || sharing.isPending}
              style={{
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
              onPress={() =>
                Alert.alert(
                  t("friends.unfriendTitle", { name }),
                  t("friends.unfriendDescription"),
                  [
                    { text: t("common.cancel"), style: "cancel" },
                    {
                      text: t("friends.unfriend"),
                      style: "destructive",
                      onPress: () => mutation.mutate(),
                    },
                  ],
                )
              }
            >
              {mutation.isPending ? (
                <ActivityIndicator color={palette.danger} />
              ) : (
                <>
                  <Ionicons
                    name="person-remove-outline"
                    size={18}
                    color={palette.danger}
                  />
                  <Typography.Text
                    size="sm"
                    weight="medium"
                    style={{ color: palette.danger }}
                  >
                    {t("friends.unfriend")}
                  </Typography.Text>
                </>
              )}
            </MotionButton>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
