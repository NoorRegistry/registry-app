import { queryClient } from "@/api/queryClient";
import Checkbox from "@/components/Checkbox";
import Radio from "@/components/Radio";
import Typography from "@/components/Typography";
import { Colors } from "@/constants/Colors";
import { updateRegistry } from "@/services/registries.service";
import { IRegistry, IRegistryDetails, IUpdateRegistryPayload } from "@/types";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
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
  Dimensions,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
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

  const snapPoints = useMemo(() => ["70%"], []);

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

  return (
    <BottomSheetModal
      ref={localRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={resetState}
      topInset={insets.top}
      enableOverDrag={false}
      enablePanDownToClose
      enableDynamicSizing
      maxDynamicContentSize={0.8 * Dimensions.get("screen").height}
      style={{
        borderRadius: 24,
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 6,
      }}
      backdropComponent={renderBackdrop}
      {...props}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom ? insets.bottom + 24 : 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pt-4">
          <View className="flex-row items-center justify-between mb-6">
            <Typography.Text size="lg" weight="medium">
              {t("registry.visibilityPrivacy")}
            </Typography.Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saveDisabled}
              className={saveDisabled ? "opacity-50" : ""}
            >
              <Typography.Text type="primary" weight="medium">
                {t("common.save")}
              </Typography.Text>
            </TouchableOpacity>
          </View>

          <View className="gap-5">
            <Radio.Radio
              value="Public"
              selectedValue={visibility}
              onChange={setVisibility}
              size="large"
              label={
                <View className="gap-1">
                  <Typography.Text size="base" weight="medium">
                    {t("common.public")}
                  </Typography.Text>
                  <Typography.Text size="xs" type="secondary">
                    {t("registry.visibilityPublicDescription")}
                  </Typography.Text>
                </View>
              }
            />
            <Radio.Radio
              value="Private"
              selectedValue={visibility}
              onChange={setVisibility}
              size="large"
              label={
                <View className="gap-1">
                  <Typography.Text size="base" weight="medium">
                    {t("common.private")}
                  </Typography.Text>
                  <Typography.Text size="xs" type="secondary">
                    {t("registry.visibilityPrivateDescription")}
                  </Typography.Text>
                </View>
              }
            />
          </View>

          <View className="h-px bg-neutral-200 my-6" />

          <View className="gap-3">
            <Checkbox.Checkbox
              value="password"
              checked={isProtected}
              onChange={handleProtectedChange}
              label={
                <Typography.Text>
                  {t("registry.passwordRequired")}
                </Typography.Text>
              }
            />
            {isProtected && (
              <View className="gap-2 pl-6">
                <Typography.Text size="xs" type="secondary">
                  {t("registry.registryPassword")}
                </Typography.Text>
                <TextInput
                  placeholder={t("registry.registryPasswordPlaceholder")}
                  value={password}
                  onChangeText={setPassword}
                  className="h-12 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
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
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export default VisibilityPrivacySheet;
