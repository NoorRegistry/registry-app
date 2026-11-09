import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import { CommerceText } from "@/components/Commerce";
import QtyButton from "@/components/QtyButton";
import { BrandColors as C } from "@/constants/Colors";
import { postRegistryItemPurchase } from "@/services/registries.service";
import { IRegistryItem } from "@/types";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  formatPrice,
  getEnArName,
  getImageUrl,
  getUserEmail,
  getUserFirstLastName,
} from "@/utils/helper";
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
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export type GuestPurchaseSheetHandle = { present: () => void };
export default function GuestPurchaseSheet({
  ref,
  registryId,
  item,
  initialQty = 1,
  quantityLimit,
  orderId,
  onRecorded,
  onDismiss,
}: {
  ref?: React.Ref<GuestPurchaseSheetHandle>;
  registryId: string;
  item: IRegistryItem;
  initialQty?: number;
  quantityLimit?: number;
  orderId?: string;
  onRecorded: () => void;
  onDismiss: () => void;
}) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheet = useRef<BottomSheetModal>(null);
  const maxQty = Math.max(
    0,
    Math.min(item.qtyLeft, quantityLimit ?? item.qtyLeft),
  );
  const [name, setName] = useState(getUserFirstLastName);
  const [email, setEmail] = useState(getUserEmail);
  const [qty, setQty] = useState(Math.max(1, Math.min(initialQty, maxQty)));
  const [showErrors, setShowErrors] = useState(false);
  useImperativeHandle(
    ref,
    () => ({ present: () => sheet.current?.present() }),
    [],
  );
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const save = useMutation({
    mutationFn: () =>
      postRegistryItemPurchase({
        registryId,
        registryItemsId: item.id,
        name: name.trim(),
        email: email.trim(),
        qty,
        platform: orderId ? "Simplist" : "",
        platformOrderId: orderId ?? "",
      }),
    onSuccess: () => {
      onRecorded();
      sheet.current?.dismiss();
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["registryGuestView"] }),
        queryClient.invalidateQueries({
          queryKey: ["registryById", registryId],
        }),
        queryClient.invalidateQueries({ queryKey: ["registries"] }),
        queryClient.invalidateQueries({ queryKey: ["friends"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
      Toast.show({ type: "success", text1: t("registry.purchaseRecorded") });
    },
    onError: (error: IApiError) => {
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("common.error")),
      });
      // Recheck access and quantities after a stale item or access change.
      if ([400, 401, 403, 404, 409].includes(error.status ?? 0)) {
        sheet.current?.dismiss();
        void queryClient.resetQueries({ queryKey: ["registryGuestView"] });
      }
    },
  });
  const inputStyle = {
    fontFamily: i18n.language === "ar" ? "Tajawalregular" : "Poppinsregular",
    fontSize: 15,
    color: C.ink,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    textAlign: i18n.dir() === "rtl" ? ("right" as const) : ("left" as const),
  };
  return (
    <AppBottomSheetModal
      ref={sheet}
      index={0}
      enableDynamicSizing
      maxDynamicContentSize={height * 0.88}
      topInset={insets.top}
      enablePanDownToClose={!save.isPending}
      enableOverDrag={false}
      onDismiss={onDismiss}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableBlurKeyboardOnGesture
      android_keyboardInputMode="adjustPan"
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={save.isPending ? "none" : "close"}
          opacity={0.45}
        />
      )}
      footerComponent={(props) => (
        <BottomSheetFooter {...props} bottomInset={insets.bottom}>
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <Pressable
              testID="guest-purchase-save"
              accessibilityRole="button"
              disabled={save.isPending || maxQty <= 0}
              onPress={() => {
                setShowErrors(true);
                if (
                  save.isPending ||
                  !name.trim() ||
                  !validEmail ||
                  qty < 1 ||
                  qty > maxQty
                )
                  return;
                Keyboard.dismiss();
                save.mutate();
              }}
              style={{
                minHeight: 52,
                borderRadius: 12,
                backgroundColor: C.primary,
                alignItems: "center",
                justifyContent: "center",
                opacity: save.isPending || maxQty <= 0 ? 0.5 : 1,
              }}
            >
              {save.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <CommerceText weight="medium" style={{ color: "white" }}>
                  {t("registry.markPurchased")}
                </CommerceText>
              )}
            </Pressable>
          </View>
        </BottomSheetFooter>
      )}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 12,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <CommerceText size="xl" weight="bold">
          {t("registry.markPurchased")}
        </CommerceText>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            paddingVertical: 24,
          }}
        >
          <Image
            source={getImageUrl(item.product.images?.[0]?.path)}
            style={{
              width: 80,
              height: 82,
              borderRadius: 6,
              backgroundColor: C.soft,
            }}
            contentFit="cover"
          />
          <View style={{ flex: 1, gap: 6 }}>
            <CommerceText numberOfLines={2}>
              {getEnArName(item.product.nameEn, item.product.nameAr)}
            </CommerceText>
            <CommerceText size="sm">
              {formatPrice(item.product.price, item.product.currencyCode)}
            </CommerceText>
          </View>
        </View>
        <CommerceText size="sm" weight="medium">
          {t("registry.giftFromQuestion")}
        </CommerceText>
        <View style={{ gap: 14, marginTop: 16 }}>
          <View>
            <CommerceText size="xs" style={{ color: C.muted }}>
              {t("registry.guestNameLabel")}
            </CommerceText>
            <BottomSheetTextInput
              testID="guest-purchase-name"
              accessibilityLabel={t("registry.guestNameLabel")}
              value={name}
              onChangeText={setName}
              editable={!save.isPending}
              style={inputStyle}
            />
            {showErrors && !name.trim() && (
              <CommerceText size="xs" style={{ color: "#B42318" }}>
                {t("common.required")}
              </CommerceText>
            )}
          </View>
          <View>
            <CommerceText size="xs" style={{ color: C.muted }}>
              {t("registry.guestEmailLabel")}
            </CommerceText>
            <BottomSheetTextInput
              testID="guest-purchase-email"
              accessibilityLabel={t("registry.guestEmailLabel")}
              value={email}
              onChangeText={setEmail}
              editable={!save.isPending}
              style={inputStyle}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            {showErrors && !validEmail && (
              <CommerceText size="xs" style={{ color: "#B42318" }}>
                {t("registry.validEmail")}
              </CommerceText>
            )}
          </View>
          {maxQty > 1 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 8,
              }}
            >
              <CommerceText size="sm">
                {t("registry.howManyPurchased")}
              </CommerceText>
              <View pointerEvents={save.isPending ? "none" : "auto"}>
                <QtyButton
                  qty={qty}
                  updateQty={(value) =>
                    setQty(Math.max(1, Math.min(Math.floor(value), maxQty)))
                  }
                />
              </View>
            </View>
          )}
        </View>
      </BottomSheetScrollView>
    </AppBottomSheetModal>
  );
}
