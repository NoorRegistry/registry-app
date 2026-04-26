import { queryClient } from "@/api/queryClient";
import Typography from "@/components/Typography";
import { LightningIcon } from "@/components/icons/lightningIcon";
import { LockIcon } from "@/components/icons/lockIcon";
import { Colors } from "@/constants/Colors";
import { updateRegistry } from "@/services/registries.service";
import { IRegistry, IRegistryDetails, IUpdateRegistryPayload } from "@/types";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useMutation } from "@tanstack/react-query";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface VisibilityPrivacySheetProps
  extends Omit<BottomSheetModalProps, "children"> {
  ref?: React.Ref<BottomSheetModal>;
  registry: IRegistryDetails;
}

function VisibilityPrivacySheet({
  ref,
  registry,
  ...props
}: VisibilityPrivacySheetProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const localRef = useRef<BottomSheetModal>(null);
  const [visibility, setVisibility] = useState<IRegistryDetails["visibility"]>(
    registry.visibility,
  );
  const [isProtected, setIsProtected] = useState(registry.isProtected);
  const [password, setPassword] = useState(
    registry.isProtected ? (registry.code ?? "") : "",
  );
  const [showErrors, setShowErrors] = useState(false);

  // Compose the passed ref with the local ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(localRef.current);
    } else if (ref && "current" in ref) {
      ref.current = localRef.current;
    }
  }, [ref]);

  const resetState = useCallback(() => {
    setVisibility(registry.visibility);
    setIsProtected(registry.isProtected);
    setPassword(registry.isProtected ? (registry.code ?? "") : "");
    setShowErrors(false);
  }, [registry.visibility, registry.isProtected, registry.code]);

  useEffect(() => {
    resetState();
  }, [registry.id, resetState]);

  const snapPoints = useMemo(() => ["95%"], []);

  const renderBackdrop = (backdropProps: any) => (
    <BottomSheetBackdrop
      {...backdropProps}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.7}
      pressBehavior="close"
    />
  );

  const updateRegistryMutation = useMutation({
    mutationFn: (payload: IUpdateRegistryPayload) =>
      updateRegistry(registry.id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["registryById", registry.id], data);
      queryClient.setQueryData<IRegistry[] | undefined>(
        ["registries"],
        (old) => {
          if (!old) return old;
          return old.map((item) =>
            item.id === data.id
              ? {
                  ...item,
                  title: data.title,
                  logo: data.logo,
                  visibility: data.visibility,
                  _count: data._count,
                  category: data.category,
                }
              : item,
          );
        },
      );
      localRef.current?.dismiss();
      Toast.show({ type: "success", text1: t("common.saved") });
    },
    onError: () => {
      Toast.show({ type: "error", text1: t("common.error") });
    },
  });

  const passwordRequired = isProtected && !registry.isProtected;
  const missingPassword = passwordRequired && password.trim().length === 0;
  const normalizedOriginalPassword = (
    registry.isProtected ? (registry.code ?? "") : ""
  ).trim();
  const hasChanges =
    visibility !== registry.visibility ||
    isProtected !== registry.isProtected ||
    password.trim() !== normalizedOriginalPassword;

  const handleProtectedChange = (checked: boolean) => {
    setIsProtected(checked);
    if (!checked) {
      setPassword("");
      setShowErrors(false);
    }
  };

  const handleSave = () => {
    setShowErrors(true);
    if (missingPassword) return;
    const payload: IUpdateRegistryPayload = {
      visibility,
      isProtected,
    };
    if (isProtected && password.trim().length > 0) {
      payload.code = password.trim();
    }
    updateRegistryMutation.mutate(payload);
  };

  const saveDisabled = !hasChanges || updateRegistryMutation.isPending;
  const isPrivateVisibility = visibility === "Private";
  const isPublicVisibility = visibility === "Public";
  const maxSheetHeight = windowHeight - insets.top - 12;

  const cardShadowStyle = Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
  });

  const sheetShadowStyle = Platform.select({
    ios: {
      borderRadius: 28,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 22,
    },
    android: {
      borderRadius: 28,
      elevation: 8,
    },
    default: {
      borderRadius: 28,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 22,
    },
  });

  return (
    <BottomSheetModal
      ref={localRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={resetState}
      topInset={insets.top}
      enableOverDrag={false}
      enablePanDownToClose
      enableDynamicSizing
      maxDynamicContentSize={maxSheetHeight}
      style={sheetShadowStyle}
      handleIndicatorStyle={{
        backgroundColor: "#EFE7E2",
        width: 52,
        height: 3,
        borderRadius: 999,
      }}
      backdropComponent={renderBackdrop}
      {...props}
    >
      <BottomSheetView
        style={{ paddingBottom: insets.bottom + 20 }}
        className="px-4 pt-6"
      >
        <View>
          <View className="items-center">
            <Typography.Text size="xl" weight="bold">
              {t("registry.visibilityPrivacy")}
            </Typography.Text>
          </View>

          <View className="mt-6 gap-4">
            <TouchableOpacity
              onPress={() => setVisibility("Public")}
              className="bg-white rounded-[24px] px-5 py-4 flex-row items-center justify-between gap-4"
              style={cardShadowStyle}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <LightningIcon size={24} color="#100E0E" />
                <View className="flex-1">
                  <Typography.Text size="sm" weight="medium">
                    {t("common.public")}
                  </Typography.Text>
                  <Typography.Text size="xs" className="text-[#403e3e]">
                    {t("registry.visibilityPublicDescription")}
                  </Typography.Text>
                </View>
              </View>
              <View
                className={
                  isPublicVisibility
                    ? "h-4 w-4 rounded-full bg-[#cf8169] items-center justify-center"
                    : "h-4 w-4 rounded-full bg-[#0000000d]"
                }
              >
                {isPublicVisibility && (
                  <View className="h-[6px] w-[6px] rounded-full bg-white" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVisibility("Private")}
              className="bg-white rounded-[24px] px-5 py-4 flex-row items-center justify-between gap-4"
              style={cardShadowStyle}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <LockIcon size={24} color="#100E0E" />
                <View className="flex-1">
                  <Typography.Text size="sm" weight="medium">
                    {t("common.private")}
                  </Typography.Text>
                  <Typography.Text size="xs" className="text-[#403e3e]">
                    {t("registry.visibilityPrivateDescription")}
                  </Typography.Text>
                </View>
              </View>
              <View
                className={
                  isPrivateVisibility
                    ? "h-4 w-4 rounded-full bg-[#cf8169] items-center justify-center"
                    : "h-4 w-4 rounded-full bg-[#0000000d]"
                }
              >
                {isPrivateVisibility && (
                  <View className="h-[6px] w-[6px] rounded-full bg-white" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Typography.Text size="sm" weight="medium" className="flex-1">
                {t("registry.passwordRequired")}
              </Typography.Text>
              <Switch
                value={isProtected}
                onValueChange={handleProtectedChange}
                trackColor={{ false: "#e5e7eb", true: "#cf8169" }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e5e7eb"
                style={{ transform: [{ scale: 0.86 }] }}
              />
            </View>

            {isProtected && (
              <View className="gap-2">
                <Typography.Text size="sm" type="secondary">
                  {t("registry.registryPassword")}
                </Typography.Text>
                <TextInput
                  placeholder={t("registry.registryPasswordPlaceholder")}
                  value={password}
                  onChangeText={setPassword}
                  className="h-14 rounded bg-[#fbfbfb] px-4 font-Poppinsregular text-black border border-[#cf8169]"
                  placeholderTextColor={
                    Colors[colorScheme ?? "light"].placeholderTextColor
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={6}
                />
                {showErrors && missingPassword && (
                  <Typography.Text size="xs" type="danger">
                    {t("common.required")}
                  </Typography.Text>
                )}
              </View>
            )}
          </View>
        </View>

        <View className="mt-6 border-t border-[#EFE7E2] pt-3">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saveDisabled}
            className="h-14 items-center justify-center rounded-md"
            style={{
              backgroundColor: "#cf8169",
              opacity: saveDisabled ? 0.5 : 1,
            }}
          >
            <Typography.Text size="base" weight="medium" className="text-white">
              {t("common.save")}
            </Typography.Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export default VisibilityPrivacySheet;
