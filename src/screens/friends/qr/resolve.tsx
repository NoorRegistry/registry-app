import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors as C } from "@/constants/Colors";
import { fetchPersonByCode } from "@/services/friends.service";
import { getUserSub } from "@/utils/helper";
import { normalizeProfileCode } from "@/utils/profile-qr";
import { useQuery } from "@tanstack/react-query";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton } from "../components";
export default function ResolveProfileCode() {
  const { code: raw } = useLocalSearchParams<{ code: string }>();
  const code = typeof raw === "string" ? normalizeProfileCode(raw) : null;
  const { t } = useTranslation();
  const account = getUserSub();
  const query = useQuery({
    queryKey: ["friends", account, "code", code],
    queryFn: async () => {
      const person = await fetchPersonByCode(code!);
      return person;
    },
    enabled: !!code,
    staleTime: 0,
    retry: false,
  });
  if (query.data) {
    if (query.data.relationship === "SELF") return <Redirect href="/profile" />;
    return (
      <Redirect
        href={{
          pathname:
            query.data.relationship === "FRIEND"
              ? "/friends/[id]"
              : "/people/[id]",
          params: { id: query.data.person.id },
        }}
      />
    );
  }
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "bottom", "left", "right"]}
    >
      <CommerceTopBar
        title={t("qr.profile")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/friends")
        }
      />
      {query.isPending && code && query.fetchStatus !== "paused" ? (
        <ScreenSkeleton kind="person" />
      ) : (
        <View
          style={{
            flex: 1,
            padding: 28,
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CommerceText style={{ textAlign: "center", color: C.muted }}>
            {t(
              (query.error as { status?: number })?.status === 404 || !code
                ? "qr.unavailable"
                : "qr.loadError",
            )}
          </CommerceText>
          {code && (
            <ActionButton
              title={t("notifications.retry")}
              onPress={() => void query.refetch()}
            />
          )}
          <ActionButton
            title={t("qr.scanAgain")}
            secondary
            onPress={() =>
              router.replace({
                pathname: "/friends/qr",
                params: { tab: "scan" },
              })
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}
