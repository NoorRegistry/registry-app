import RegistryAvatar from "@/components/RegistryAvatar";
import { BrandColors } from "@/constants/Colors";
import { useRegistryPhoto } from "@/hooks/useRegistryPhoto";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { IconButton } from "@/components/Button";
import Typography from "@/components/Typography";
import { EyeIcon } from "@/components/icons/eye";
import InfoCircleIcon from "@/components/icons/infoCircle";
import { LockIcon } from "@/components/icons/lockIcon";
import { PlusCircleIcon } from "@/components/icons/pluscircle";
import { ShareIcon } from "@/components/icons/share";
import { UnlockIcon } from "@/components/icons/unlockIcon";
import { IRegistryDetails } from "@/types";
import { buildRegistryShareLink } from "@/utils/registry-share";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  Share,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import SwitchRegistry from "./SwitchRegistrySheet";
import VisibilityPrivacySheet from "./VisibilityPrivacySheet";
import RegistryDetailsSheet, {
  RegistryDetailsSheetHandle,
} from "./RegistryDetailsSheet";

const RegistryHeader = ({ registry }: { registry: IRegistryDetails }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const visibilitySheetModalRef = useRef<BottomSheetModal>(null);
  const detailsSheetRef = useRef<RegistryDetailsSheetHandle>(null);
  const photo = useRegistryPhoto(registry);
  const { t } = useTranslation();
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleVisibilityPress = useCallback(() => {
    visibilitySheetModalRef.current?.present();
  }, []);
  const handleGuestViewPress = useCallback(() => {
    router.push({
      pathname: "/(protected)/registry/guest-view",
      params: {
        id: registry.id,
        code: registry.code ?? "",
      },
    });
  }, [registry.code, registry.id]);
  const handleSharePress = useCallback(async () => {
    try {
      const shareLink = buildRegistryShareLink(registry.id);
      const message = `${t("registry.shareMessage", {
        title: registry.title,
      })}\n${shareLink}`;

      await Share.share({
        title: registry.title,
        message,
        url: shareLink,
      });
    } catch (error) {
      console.error("Error sharing registry", error);
      Toast.show({ type: "error", text1: t("common.error") });
    }
  }, [registry.id, registry.title, t]);

  return (
    <View className="px-4 pt-2 pb-3 mb-6 border-b border-neutral-200">
      <View className="gap-4 items-center">
        <Pressable
          testID="registry-photo"
          accessibilityRole="button"
          accessibilityLabel={t(
            registry.logo ? "registry.changePhoto" : "registry.uploadPhoto",
          )}
          onPress={photo.selectPhoto}
          disabled={photo.isUploading}
        >
          {photo.previewUri ? (
            <Image
              source={photo.previewUri}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              contentFit="cover"
            />
          ) : registry.logo ? (
            <RegistryAvatar
              title={registry.title}
              logo={registry.logo}
              size={80}
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: BrandColors.soft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="camera-outline"
                size={28}
                color={BrandColors.deep}
              />
            </View>
          )}
          {photo.isUploading ? (
            <View
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 40,
                backgroundColor: "rgba(255,255,255,0.65)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color={BrandColors.primary} />
            </View>
          ) : registry.logo ? (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 24,
                height: 24,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: BrandColors.primary,
                borderWidth: 2,
                borderColor: "white",
              }}
            >
              <Ionicons name="camera" size={13} color="white" />
            </View>
          ) : null}
        </Pressable>
        <View className="flex-row gap-1 items-center">
          <Typography.Text weight="medium" size="lg">
            {registry.title}
          </Typography.Text>
          <IconButton
            icon={<PlusCircleIcon />}
            onPress={handlePresentModalPress}
            testID="registry-switch"
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row w-full justify-evenly gap-2 mb-2">
          <TouchableOpacity
            className="flex-row gap-2 items-center"
            onPress={handleGuestViewPress}
          >
            <EyeIcon size={20} />
            <Typography.Text type="secondary">
              {t("registry.guestView")}
            </Typography.Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row gap-2 items-center"
            onPress={handleVisibilityPress}
            testID="registry-visibility"
          >
            {registry.visibility === "Private" ? (
              <LockIcon size={18} />
            ) : (
              <UnlockIcon size={18} />
            )}
            <Typography.Text type="secondary">
              {registry.visibility === "Private"
                ? t("common.private")
                : t("common.public")}
            </Typography.Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row gap-2 items-center"
            onPress={handleSharePress}
          >
            <ShareIcon size={18} />
            <Typography.Text type="secondary">
              {t("common.share")}
            </Typography.Text>
          </TouchableOpacity>
        </View>

        {/* Display item count and info button */}
        <View className="flex-row items-center justify-between w-full">
          <Typography.Text size="base" weight="medium">
            {t("registry.items", { count: registry._count.totalItems })}
          </Typography.Text>
          <TouchableOpacity
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t("registry.details")}
            testID="registry-details"
            onPress={() => detailsSheetRef.current?.present()}
          >
            <InfoCircleIcon />
          </TouchableOpacity>
        </View>
      </View>
      <SwitchRegistry ref={bottomSheetModalRef} />
      <RegistryDetailsSheet ref={detailsSheetRef} registry={registry} />
      <VisibilityPrivacySheet
        ref={visibilitySheetModalRef}
        registry={registry}
      />
    </View>
  );
};

export default RegistryHeader;
