import React, { useImperativeHandle, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import Typography from "@/components/Typography";
import { BrandColors } from "@/constants/Colors";
import { updateRegistry } from "@/services/registries.service";
import { IRegistryDetails } from "@/types";
import { getApiErrorMessage } from "@/utils/api-error";
import { cacheRegistryUpdate } from "@/utils/registry-cache";

export type RegistryDetailsSheetHandle = { present: () => void };

export default function RegistryDetailsSheet({
  registry,
  ref,
}: {
  registry: IRegistryDetails;
  ref?: React.Ref<RegistryDetailsSheetHandle>;
}) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheet = useRef<BottomSheetModal>(null);
  const [title, setTitle] = useState(registry.title);
  const [greeting, setGreeting] = useState(registry.greeting ?? "");
  const [showError, setShowError] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setTitle(registry.title);
        setGreeting(registry.greeting ?? "");
        setShowError(false);
        sheet.current?.present();
      },
    }),
    [registry],
  );
  const save = useMutation({
    mutationFn: () =>
      updateRegistry(registry.id, {
        title: title.trim(),
        greeting: greeting.trim(),
      }),
    onSuccess: (updated) => {
      cacheRegistryUpdate(updated);
      sheet.current?.dismiss();
      Toast.show({ type: "success", text1: t("common.saved") });
    },
    onError: (error) =>
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("common.error")),
      }),
  });
  const unchanged =
    title.trim() === registry.title &&
    greeting.trim() === (registry.greeting ?? "");
  const invalid = !title.trim();
  const inputStyle = {
    fontFamily: i18n.language === "ar" ? "Tajawalregular" : "Poppinsregular",
    fontSize: 15,
    lineHeight: 22,
    color: BrandColors.ink,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.line,
    textAlign: i18n.dir() === "rtl" ? ("right" as const) : ("left" as const),
  };
  return (
    <AppBottomSheetModal
      ref={sheet}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      enableOverDrag={false}
      topInset={insets.top}
      maxDynamicContentSize={height * 0.85}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableBlurKeyboardOnGesture
      android_keyboardInputMode="adjustPan"
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={0.45}
        />
      )}
      handleIndicatorStyle={{ backgroundColor: BrandColors.line, width: 48 }}
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
              testID="registry-details-save"
              accessibilityRole="button"
              disabled={unchanged || invalid || save.isPending}
              onPress={() => {
                Keyboard.dismiss();
                setShowError(true);
                if (!invalid) save.mutate();
              }}
              style={{
                height: 44,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: BrandColors.primary,
                opacity: unchanged || invalid || save.isPending ? 0.5 : 1,
              }}
            >
              {save.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Typography.Text weight="medium" style={{ color: "white" }}>
                  {t("common.save")}
                </Typography.Text>
              )}
            </Pressable>
          </View>
        </BottomSheetFooter>
      )}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 90,
          gap: 18,
        }}
      >
        <Typography.Text size="lg" weight="medium">
          {t("registry.details")}
        </Typography.Text>
        <View style={{ gap: 4 }}>
          <Typography.Text weight="medium">
            {t("registry.title")}
          </Typography.Text>
          <BottomSheetTextInput
            testID="registry-details-title"
            accessibilityLabel={t("registry.title")}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            editable={!save.isPending}
            onBlur={() => setShowError(true)}
            style={[inputStyle, { height: 46 }]}
          />
          {showError && invalid && (
            <Typography.Text size="xs" type="danger">
              {t("registry.titleRequired")}
            </Typography.Text>
          )}
        </View>
        <View style={{ gap: 4 }}>
          <Typography.Text weight="medium">
            {t("registry.greeting")}
          </Typography.Text>
          <BottomSheetTextInput
            testID="registry-details-greeting"
            accessibilityLabel={t("registry.greeting")}
            value={greeting}
            onChangeText={setGreeting}
            maxLength={500}
            multiline
            editable={!save.isPending}
            style={[inputStyle, { height: 112, textAlignVertical: "top" }]}
          />
        </View>
      </BottomSheetScrollView>
    </AppBottomSheetModal>
  );
}
