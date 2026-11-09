import { queryClient } from "@/api/queryClient";
import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import { CommerceText } from "@/components/Commerce";
import QtyButton from "@/components/QtyButton";
import { BrandColors as C } from "@/constants/Colors";
import { Order } from "@/services/orders.service";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  getEnArName,
  getImageUrl,
  getUserEmail,
  getUserFirstLastName,
  getUserSub,
} from "@/utils/helper";
import {
  dismissRegistryOrderGift,
  RegistryGift,
} from "@/utils/registry-purchase-context";
import Feather from "@expo/vector-icons/Feather";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import React, { useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  giftKey,
  loadOrderRegistryGifts,
  OrderRegistryGift,
  orderRegistryGifts,
  saveOrderRegistryGifts,
} from "./registry-purchases";

export type RegistryOrderPurchaseSheetHandle = { present: () => void };
export default function RegistryOrderPurchaseSheet({
  ref,
  order,
  gifts,
  onRemainingChange,
}: {
  ref?: React.Ref<RegistryOrderPurchaseSheetHandle>;
  order: Order;
  gifts: RegistryGift[];
  onRemainingChange: (count: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheet = useRef<BottomSheetModal>(null);
  const busy = useRef(false);
  const [rows, setRows] = useState(() => orderRegistryGifts(order, gifts));
  const [name, setName] = useState(getUserFirstLastName);
  const [email, setEmail] = useState(getUserEmail);
  const [showErrors, setShowErrors] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const load = useMutation({
    mutationFn: () => loadOrderRegistryGifts(order, gifts, rows),
    onSuccess: (next) => {
      setRows(next);
      setLoadError(false);
      next
        .filter((row) => row.status === "saved")
        .forEach((row) =>
          dismissRegistryOrderGift(getUserSub(), order.id, row.itemId),
        );
      if (next.length && next.every((row) => row.status === "saved"))
        setComplete(true);
      onRemainingChange(next.filter((row) => row.status !== "saved").length);
    },
    onError: () => setLoadError(true),
  });
  const save = useMutation({
    mutationFn: () =>
      saveOrderRegistryGifts(order, rows, name, email, getUserSub()),
    onSuccess: (next) => {
      setRows(next);
      const attempted = rows.filter(
        (row) => row.selected && row.status !== "saved",
      );
      const successful = next.filter((row) => row.status === "saved");
      const finished = attempted.every(
        (row) =>
          next.find((entry) => giftKey(entry) === giftKey(row))?.status ===
          "saved",
      );
      setComplete(finished);
      setSaveError(!finished);
      onRemainingChange(next.filter((row) => row.status !== "saved").length);
      if (successful.length)
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: ["registryGuestView"] }),
          ...[...new Set(successful.map((row) => row.registryId))].map((id) =>
            queryClient.invalidateQueries({ queryKey: ["registryById", id] }),
          ),
          ...["registries", "friends", "notifications", "home"].map((key) =>
            queryClient.invalidateQueries({ queryKey: [key] }),
          ),
        ]);
    },
    onError: () => setSaveError(true),
    onSettled: () => {
      busy.current = false;
    },
  });
  useImperativeHandle(ref, () => ({
    present: () => {
      if (busy.current) return;
      setName(getUserFirstLastName());
      setEmail(getUserEmail());
      setShowErrors(false);
      setLoadError(false);
      sheet.current?.present();
      load.mutate();
    },
  }));
  const selected = rows.filter((row) => row.selected && row.status === "ready");
  const saved = rows.filter((row) => row.status === "saved");
  const allSaved = rows.length > 0 && saved.length === rows.length;
  const registryCount = new Set(rows.map((row) => row.registryId)).size;
  const groups = [
    ...new Map(
      rows.map((row) => [row.registryId, row.registryTitle]),
    ).entries(),
  ];
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const pending = save.isPending || load.isPending;
  const inputStyle = {
    fontFamily: i18n.language === "ar" ? "Tajawalregular" : "Poppinsregular",
    fontSize: 15,
    color: C.ink,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    textAlign: i18n.dir() === "rtl" ? ("right" as const) : ("left" as const),
  };
  const issueLabel = (row: OrderRegistryGift) =>
    row.issue === "save"
      ? getApiErrorMessage(row.error, t("registry.giftUpdateFailed"))
      : t(
          row.issue === "access"
            ? "registry.giftAccessError"
            : row.issue === "quantityChanged"
              ? "registry.giftQtyChanged"
              : "registry.giftUnavailable",
        );
  const toggle = (row: OrderRegistryGift) =>
    setRows((current) =>
      current.map((entry) =>
        giftKey(entry) === giftKey(row)
          ? { ...entry, selected: !entry.selected }
          : entry,
      ),
    );
  return (
    <AppBottomSheetModal
      ref={sheet}
      index={0}
      enableDynamicSizing
      maxDynamicContentSize={height * 0.9}
      topInset={insets.top}
      enablePanDownToClose={!save.isPending}
      enableOverDrag={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableBlurKeyboardOnGesture
      android_keyboardInputMode="adjustPan"
      handleIndicatorStyle={{ width: 40, backgroundColor: C.line }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.45}
          pressBehavior={save.isPending ? "none" : "close"}
        />
      )}
      footerComponent={(props) => (
        <BottomSheetFooter {...props} bottomInset={insets.bottom}>
          <View
            style={{
              paddingHorizontal: 22,
              paddingTop: 12,
              paddingBottom: 10,
              backgroundColor: "white",
            }}
          >
            <Pressable
              testID="order-registry-confirm"
              accessibilityRole="button"
              disabled={
                !complete && (pending || loadError || selected.length === 0)
              }
              onPress={() => {
                if (complete) {
                  sheet.current?.dismiss();
                  return;
                }
                setShowErrors(true);
                if (
                  pending ||
                  busy.current ||
                  loadError ||
                  !selected.length ||
                  !name.trim() ||
                  !validEmail
                )
                  return;
                busy.current = true;
                Keyboard.dismiss();
                setSaveError(false);
                save.mutate();
              }}
              style={[
                styles.primary,
                !complete &&
                  (pending || loadError || !selected.length) && {
                    opacity: 0.5,
                  },
              ]}
            >
              {save.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <CommerceText
                  weight="medium"
                  style={{ color: "white", textAlign: "center" }}
                >
                  {complete
                    ? t("registry.backToOrder")
                    : saveError
                      ? t("registry.retryRemaining")
                      : t("registry.markGifts", { count: selected.length })}
                </CommerceText>
              )}
            </Pressable>
            {!complete ? (
              <Pressable
                testID="order-registry-not-now"
                accessibilityRole="button"
                disabled={save.isPending}
                onPress={() => sheet.current?.dismiss()}
                style={styles.textButton}
              >
                <CommerceText size="sm" style={{ color: C.muted }}>
                  {t("registry.notNow")}
                </CommerceText>
              </Pressable>
            ) : (
              !allSaved && (
                <Pressable
                  testID="order-registry-remaining"
                  accessibilityRole="button"
                  onPress={() => {
                    setComplete(false);
                    load.mutate();
                  }}
                  style={styles.textButton}
                >
                  <CommerceText size="sm" style={{ color: C.deep }}>
                    {t("registry.updateRemaining")}
                  </CommerceText>
                </Pressable>
              )
            )}
          </View>
        </BottomSheetFooter>
      )}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 10,
          paddingBottom: insets.bottom + (complete && allSaved ? 90 : 148),
        }}
      >
        {complete ? (
          <View
            style={{
              alignItems: "center",
              gap: 14,
              paddingTop: 12,
              paddingBottom: 22,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#EAF3ED",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="check" size={28} color="#408467" />
            </View>
            <CommerceText
              testID="order-registry-result"
              size="xl"
              weight="bold"
              style={{ textAlign: "center" }}
            >
              {allSaved
                ? t("registry.registriesUpdated", { count: registryCount })
                : t("registry.giftsMarked", { count: saved.length })}
            </CommerceText>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              paddingBottom: 2,
            }}
          >
            <View style={{ flex: 1 }}>
              <CommerceText size="xl" weight="bold">
                {t("registry.updateRegistries")}
              </CommerceText>
              <CommerceText size="xs" style={{ color: C.muted, marginTop: 5 }}>
                {t("registry.giftSummary", {
                  gifts: String(rows.length),
                  registries: String(registryCount),
                })}
              </CommerceText>
            </View>
            <Pressable
              testID="order-registry-close"
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
              disabled={save.isPending}
              onPress={() => sheet.current?.dismiss()}
              style={styles.icon}
            >
              <Feather name="x" size={20} color={C.muted} />
            </Pressable>
          </View>
        )}
        {load.isPending ? (
          <View style={{ paddingVertical: 36, alignItems: "center", gap: 12 }}>
            <ActivityIndicator color={C.primary} />
            <CommerceText size="sm" style={{ color: C.muted }}>
              {t("registry.checkingGifts")}
            </CommerceText>
          </View>
        ) : loadError ? (
          <View style={{ paddingVertical: 24, gap: 12 }}>
            <CommerceText size="sm">
              {t("registry.loadGiftsError")}
            </CommerceText>
            <Pressable
              accessibilityRole="button"
              onPress={() => load.mutate()}
              style={styles.textButton}
            >
              <CommerceText style={{ color: C.deep }}>
                {t("notifications.retry")}
              </CommerceText>
            </Pressable>
          </View>
        ) : (
          groups.map(([id, title], index) => (
            <View
              key={id}
              style={{
                paddingVertical: 18,
                ...(index < groups.length - 1
                  ? {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: C.line,
                    }
                  : {}),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 7,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Feather name="gift" size={15} color={C.deep} />
                <CommerceText
                  size="sm"
                  weight="medium"
                  style={{ flex: 1, color: C.deep }}
                >
                  {title}
                </CommerceText>
              </View>
              <View style={{ gap: 18 }}>
                {rows
                  .filter((row) => row.registryId === id)
                  .map((row) => (
                    <View key={giftKey(row)}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <GiftImage image={row.line.image} />
                        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                          <CommerceText size="sm" numberOfLines={2}>
                            {getEnArName(row.line.nameEn, row.line.nameAr)}
                          </CommerceText>
                          <CommerceText size="xs" style={{ color: C.muted }}>
                            {getEnArName(
                              row.line.storeNameEn,
                              row.line.storeNameAr,
                            )}
                            {" · "}
                            {t("registry.qty")} {row.quantity}
                          </CommerceText>
                          {row.status === "saved" ? (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <Feather
                                name="check-circle"
                                size={15}
                                color="#408467"
                              />
                              <CommerceText
                                testID={`order-gift-saved-${row.itemId}`}
                                size="xs"
                                style={{ color: "#408467" }}
                              >
                                {t("registry.purchasedLabel")}
                              </CommerceText>
                            </View>
                          ) : complete ? (
                            <CommerceText size="xs" style={{ color: C.muted }}>
                              {t("registry.notMarked")}
                            </CommerceText>
                          ) : (
                            row.issue && (
                              <CommerceText
                                testID={`order-gift-error-${row.itemId}`}
                                size="xs"
                                style={{ color: "#B54736" }}
                              >
                                {issueLabel(row)}
                              </CommerceText>
                            )
                          )}
                        </View>
                        {!complete && row.status === "ready" && (
                          <Pressable
                            testID={`order-gift-select-${row.itemId}`}
                            accessibilityRole="checkbox"
                            accessibilityLabel={getEnArName(
                              row.line.nameEn,
                              row.line.nameAr,
                            )}
                            accessibilityState={{
                              checked: row.selected,
                              disabled: pending,
                            }}
                            disabled={pending}
                            onPress={() => toggle(row)}
                            style={styles.icon}
                          >
                            <Feather
                              name={row.selected ? "check-square" : "square"}
                              size={23}
                              color={row.selected ? C.primary : C.muted}
                            />
                          </Pressable>
                        )}
                      </View>
                      {!complete &&
                        row.selected &&
                        row.status === "ready" &&
                        row.maxQuantity > 1 && (
                          <View
                            style={{ marginTop: 10, alignItems: "flex-end" }}
                            pointerEvents={pending ? "none" : "auto"}
                          >
                            <QtyButton
                              qty={row.quantity}
                              updateQty={(value) =>
                                setRows((current) =>
                                  current.map((entry) =>
                                    giftKey(entry) === giftKey(row)
                                      ? {
                                          ...entry,
                                          quantity: Math.max(
                                            1,
                                            Math.min(
                                              Math.floor(value),
                                              row.maxQuantity,
                                            ),
                                          ),
                                        }
                                      : entry,
                                  ),
                                )
                              }
                            />
                          </View>
                        )}
                    </View>
                  ))}
              </View>
            </View>
          ))
        )}
        {!complete && !loadError && !load.isPending && (
          <View
            style={{
              paddingTop: 17,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: C.line,
            }}
          >
            <CommerceText
              size="sm"
              weight="medium"
              style={{ marginBottom: 12 }}
            >
              {t("registry.giftFromQuestion")}
            </CommerceText>
            <View style={{ gap: 12 }}>
              <View>
                <CommerceText size="xs" style={{ color: C.muted }}>
                  {t("registry.guestNameLabel")}
                </CommerceText>
                <BottomSheetTextInput
                  testID="order-registry-name"
                  accessibilityLabel={t("registry.guestNameLabel")}
                  value={name}
                  onChangeText={setName}
                  style={inputStyle}
                  editable={!pending}
                />
                {showErrors && !name.trim() && (
                  <CommerceText size="xs" style={{ color: "#B54736" }}>
                    {t("common.required")}
                  </CommerceText>
                )}
              </View>
              <View>
                <CommerceText size="xs" style={{ color: C.muted }}>
                  {t("registry.guestEmailLabel")}
                </CommerceText>
                <BottomSheetTextInput
                  testID="order-registry-email"
                  accessibilityLabel={t("registry.guestEmailLabel")}
                  value={email}
                  onChangeText={setEmail}
                  style={inputStyle}
                  editable={!pending}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
                {showErrors && !validEmail && (
                  <CommerceText size="xs" style={{ color: "#B54736" }}>
                    {t("registry.validEmail")}
                  </CommerceText>
                )}
              </View>
            </View>
            {saveError && (
              <CommerceText
                accessibilityLiveRegion="polite"
                size="xs"
                style={{ color: "#B54736", marginTop: 14 }}
              >
                {t("registry.giftUpdateFailed")}
              </CommerceText>
            )}
            {rows.some((row) => row.status === "blocked") && (
              <Pressable
                testID="order-registry-refresh"
                accessibilityRole="button"
                disabled={pending}
                onPress={() => load.mutate()}
                style={styles.textButton}
              >
                <CommerceText size="sm" style={{ color: C.deep }}>
                  {t("registry.refreshGifts")}
                </CommerceText>
              </Pressable>
            )}
          </View>
        )}
      </BottomSheetScrollView>
    </AppBottomSheetModal>
  );
}
function GiftImage({ image }: { image: string | null }) {
  const url = getImageUrl(image);
  const [failed, setFailed] = useState(false);
  return (
    <View
      style={{
        width: 56,
        height: 62,
        borderRadius: 7,
        overflow: "hidden",
        backgroundColor: C.soft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {url && !failed ? (
        <Image
          source={url}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
          onError={() => setFailed(true)}
        />
      ) : (
        <Feather name="gift" size={24} color={C.deep} />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  primary: {
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  textButton: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    width: 40,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
