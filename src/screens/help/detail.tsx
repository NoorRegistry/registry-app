import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import { ListSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors as C } from "@/constants/Colors";
import {
  fetchSupportDetail,
  readSupportRequest,
  sendSupportReply,
  setSupportStatus,
} from "@/services/support.service";
import { getUserSub } from "@/utils/helper";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Status, styles, SupportButton, SupportInput } from "./components";
import { Retry } from "./index";
export default function SupportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const account = getUserSub();
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const [message, setMessage] = useState("");
  const pending = useRef<{ text: string; id: string } | null>(null);
  const readThrough = useRef({ id, through: 0 });
  const query = useInfiniteQuery({
    queryKey: ["support", account, "detail", id],
    queryFn: ({ pageParam }) => fetchSupportDetail(id, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (p) => p.nextBefore || undefined,
    refetchInterval: focused ? 10000 : false,
  });
  const data = query.data?.pages[0];
  const messages = [
    ...new Map(
      (query.data?.pages.flatMap((p) => [...p.messages].reverse()) || []).map(
        (m) => [m.id, m],
      ),
    ).values(),
  ];
  const newest = data?.messages.at(-1)?.id || 0;
  useEffect(() => {
    if (
      !focused ||
      !newest ||
      (readThrough.current.id === id && newest <= readThrough.current.through)
    )
      return;
    let cancelled = false;
    void readSupportRequest(id, newest)
      .then(() => {
        if (!cancelled) {
          readThrough.current = { id, through: newest };
          void client.invalidateQueries({
            queryKey: ["support", account, "recent"],
          });
          void client.invalidateQueries({
            queryKey: ["support", account, "list"],
          });
          void client.invalidateQueries({
            queryKey: ["notifications", account],
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [account, client, focused, id, newest]);
  const refresh = async () => {
    await query.refetch();
    void client.invalidateQueries({ queryKey: ["support", account, "recent"] });
    void client.invalidateQueries({ queryKey: ["support", account, "list"] });
  };
  const send = useMutation({
    mutationFn: () => {
      const text = message.trim();
      if (!pending.current || pending.current.text !== text)
        pending.current = { text, id: randomUUID() };
      return sendSupportReply(id, {
        clientId: pending.current.id,
        message: text,
      });
    },
    onSuccess: async () => {
      setMessage("");
      pending.current = null;
      await refresh();
    },
  });
  const status = useMutation({
    mutationFn: () =>
      setSupportStatus(id, data?.status === "OPEN" ? "RESOLVED" : "OPEN"),
    onSuccess: refresh,
    onError: () =>
      Toast.show({ type: "error", text1: t("support.updateError") }),
  });
  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      <CommerceTopBar
        title={t("support.request")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/help/requests")
        }
        action={
          data
            ? t(data.status === "OPEN" ? "support.resolve" : "support.reopen")
            : undefined
        }
        onAction={() => {
          if (!status.isPending && !send.isPending) status.mutate();
        }}
      />
      {query.isPending && query.fetchStatus !== "paused" ? (
        <ListSkeleton kind="orders" />
      ) : !data ? (
        <Retry onPress={() => void query.refetch()} />
      ) : (
        <>
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 15,
              gap: 9,
              borderBottomWidth: 1,
              borderBottomColor: C.line,
            }}
          >
            <CommerceText weight="bold" size="lg">
              {data.subject}
            </CommerceText>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Status status={data.status} />
              {data.orderId && (
                <Pressable
                  accessibilityRole="link"
                  onPress={() =>
                    router.push({
                      pathname: "/orders/[id]",
                      params: { id: data.orderId! },
                    })
                  }
                >
                  <CommerceText style={{ color: C.deep }}>
                    {data.orderReference}
                  </CommerceText>
                </Pressable>
              )}
            </View>
          </View>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <FlatList
              inverted
              data={messages}
              keyExtractor={(m) => String(m.id)}
              contentContainerStyle={{ padding: 20, gap: 14, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              onEndReached={() => {
                if (query.hasNextPage && !query.isFetchingNextPage)
                  void query.fetchNextPage();
              }}
              ListFooterComponent={
                query.isFetchingNextPage ? (
                  <ListSkeleton kind="orders" rows={1} />
                ) : query.isFetchNextPageError ? (
                  <Retry onPress={() => void query.fetchNextPage()} />
                ) : null
              }
              renderItem={({ item: m }) =>
                m.sender === "SYSTEM" ? (
                  <CommerceText
                    size="xs"
                    style={{
                      textAlign: "center",
                      color: C.muted,
                      paddingVertical: 6,
                    }}
                  >
                    {t(
                      m.body === "RESOLVED"
                        ? "support.events.RESOLVED"
                        : "support.events.OPEN",
                    )}{" "}
                    · {new Date(m.createdAt).toLocaleDateString(i18n.language)}
                  </CommerceText>
                ) : (
                  <View
                    style={{
                      alignSelf:
                        m.sender === "REQUESTER" ? "flex-end" : "flex-start",
                      maxWidth: "88%",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          m.sender === "REQUESTER" ? C.soft : "#F4F4F3",
                        borderRadius: 13,
                        padding: 12,
                        gap: 6,
                      }}
                    >
                      {m.sender === "SUPPORT" && (
                        <CommerceText
                          size="xs"
                          weight="bold"
                          style={{ color: C.deep }}
                        >
                          {t("support.team")}
                        </CommerceText>
                      )}
                      <CommerceText selectable>{m.body}</CommerceText>
                    </View>
                    <CommerceText size="xs" style={{ color: C.muted }}>
                      {new Date(m.createdAt).toLocaleString(i18n.language, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </CommerceText>
                  </View>
                )
              }
            />
            {query.isRefetchError && (
              <Pressable
                accessibilityRole="button"
                onPress={() => void query.refetch()}
                style={{ padding: 10 }}
              >
                <CommerceText
                  size="xs"
                  style={{ textAlign: "center", color: C.deep }}
                >
                  {t("support.refreshError")}
                </CommerceText>
              </Pressable>
            )}
            <View style={[styles.footer, { gap: 8 }]}>
              {send.isError && (
                <CommerceText
                  accessibilityRole="alert"
                  size="xs"
                  style={{ color: "#B33F36" }}
                >
                  {t("support.sendError")}
                </CommerceText>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 10,
                }}
              >
                <SupportInput
                  testID="support-reply"
                  accessibilityLabel={t("support.reply")}
                  placeholder={t("support.reply")}
                  multiline
                  value={message}
                  maxLength={4000}
                  editable={!send.isPending}
                  onChangeText={setMessage}
                  style={{ flex: 1, maxHeight: 130 }}
                />
                <View style={{ minWidth: 72 }}>
                  <SupportButton
                    title={t(
                      send.isPending ? "support.sending" : "support.send",
                    )}
                    testID="send-support-reply"
                    disabled={
                      !message.trim() || send.isPending || status.isPending
                    }
                    onPress={() => send.mutate()}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
}
