import { ListSkeleton } from "@/components/Skeleton/layouts";
import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import { fetchOrder, fetchOrders } from "@/services/orders.service";
import {
  createSupportRequest,
  supportTopics,
  SupportTopic,
} from "@/services/support.service";
import { getUserSub } from "@/utils/helper";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles, SupportButton, SupportInput } from "./components";
export default function NewSupportScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ orderId?: string; topic?: string }>();
  const client = useQueryClient();
  const account = getUserSub();
  const id = useRef(randomUUID());
  const initialTopic: SupportTopic = supportTopics.includes(
    params.topic as SupportTopic,
  )
    ? (params.topic as SupportTopic)
    : params.orderId
      ? "ORDERS"
      : "APP";
  const [topic, setTopic] = useState<SupportTopic>(initialTopic);
  const topicOptions = [
    initialTopic,
    ...supportTopics.filter((value) => value !== initialTopic),
  ];
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(params.orderId);
  const [chooseOrder, setChooseOrder] = useState(false);
  const selected = useQuery({
    queryKey: ["orders", account, orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
  });
  const orders = useInfiniteQuery({
    queryKey: ["orders", account, "support-picker"],
    queryFn: ({ pageParam }) => fetchOrders(pageParam),
    initialPageParam: 1,
    getNextPageParam: (p) => (p.page < p.totalPages ? p.page + 1 : undefined),
    enabled: chooseOrder,
  });
  const create = useMutation({
    mutationFn: () =>
      createSupportRequest({
        id: id.current,
        topic,
        subject: subject.trim(),
        message: message.trim(),
        ...(orderId ? { orderId } : {}),
      }),
    onSuccess: (data) => {
      void client.invalidateQueries({ queryKey: ["support", account] });
      router.replace({ pathname: "/help/[id]", params: { id: data.id } });
    },
  });
  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      <CommerceTopBar
        title={t("support.contact")}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.content, { gap: 18, paddingTop: 15 }]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {topicOptions.map((value) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: topic === value }}
                key={value}
                disabled={create.isPending}
                onPress={() => setTopic(value)}
                style={{
                  backgroundColor: topic === value ? C.soft : "#F5F4F2",
                  borderRadius: 20,
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                }}
              >
                <CommerceText
                  size="sm"
                  weight={topic === value ? "bold" : "regular"}
                  style={{ color: topic === value ? C.deep : C.muted }}
                >
                  {t(`support.topics.${value}`)}
                </CommerceText>
              </Pressable>
            ))}
          </ScrollView>
          <View style={{ gap: 8 }}>
            <CommerceText weight="medium">{t("support.subject")}</CommerceText>
            <SupportInput
              testID="support-subject"
              accessibilityLabel={t("support.subject")}
              value={subject}
              onChangeText={setSubject}
              maxLength={120}
              editable={!create.isPending}
            />
          </View>
          <View style={{ gap: 8 }}>
            <CommerceText weight="medium">{t("support.message")}</CommerceText>
            <SupportInput
              testID="support-message"
              accessibilityLabel={t("support.message")}
              value={message}
              onChangeText={setMessage}
              maxLength={4000}
              editable={!create.isPending}
              multiline
              textAlignVertical="top"
              style={{ minHeight: 150 }}
            />
          </View>
          <View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setChooseOrder(!chooseOrder)}
              disabled={create.isPending}
              style={styles.row}
            >
              <CommerceText style={{ flex: 1 }}>
                {selected.data?.reference || t("support.linkOrder")}
              </CommerceText>
              <CommerceText style={{ color: C.deep }}>
                {t("support.change")}
              </CommerceText>
            </Pressable>
            {orderId && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setOrderId(undefined)}
              >
                <CommerceText size="xs" style={{ color: C.muted }}>
                  {t("support.unlinkOrder")}
                </CommerceText>
              </Pressable>
            )}
            {chooseOrder && (
              <View>
                {orders.data?.pages
                  .flatMap((p) => p.data)
                  .map((o) => (
                    <Pressable
                      accessibilityRole="button"
                      key={o.id}
                      onPress={() => {
                        setOrderId(o.id);
                        setTopic("ORDERS");
                        setChooseOrder(false);
                      }}
                      style={styles.row}
                    >
                      <CommerceText>{o.reference}</CommerceText>
                      <CommerceText size="xs" style={{ color: C.muted }}>
                        {t(`orders.status.${o.status}`)}
                      </CommerceText>
                    </Pressable>
                  ))}
                {orders.isError ? (
                  <Pressable onPress={() => void orders.refetch()}>
                    <CommerceText>{t("notifications.retry")}</CommerceText>
                  </Pressable>
                ) : orders.isPending ? (
                  <ListSkeleton kind="orders" rows={2} />
                ) : !orders.data?.pages[0].data.length ? (
                  <CommerceText style={{ color: C.muted }}>
                    {t("orders.empty")}
                  </CommerceText>
                ) : null}
                {orders.hasNextPage && (
                  <Pressable
                    disabled={orders.isFetchingNextPage}
                    onPress={() => void orders.fetchNextPage()}
                    style={styles.row}
                  >
                    <CommerceText style={{ color: C.deep }}>
                      {t("support.loadMore")}
                    </CommerceText>
                  </Pressable>
                )}
              </View>
            )}
          </View>
          {create.isError && (
            <CommerceText
              accessibilityRole="alert"
              style={{ color: "#B33F36" }}
            >
              {t("support.sendError")}
            </CommerceText>
          )}
        </ScrollView>
        <View style={styles.footer}>
          <SupportButton
            title={t(
              create.isPending ? "support.sending" : "support.sendRequest",
            )}
            testID="send-support-request"
            disabled={
              create.isPending || subject.trim().length < 2 || !message.trim()
            }
            onPress={() => create.mutate()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
