import RegistryAvatar from "@/components/RegistryAvatar";
import { BrandColors } from "@/constants/Colors";
import { useRegistryPhoto } from "@/hooks/useRegistryPhoto";
import Feather from "@expo/vector-icons/Feather";
import { CommerceText } from "@/components/Commerce";
import { Image } from "expo-image";
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
  StyleSheet,
  useWindowDimensions,
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
  const { width, fontScale } = useWindowDimensions();
  const actionsBelow = width < 390 || fontScale > 1.15;
  const total = registry._count.totalItems;
  const purchased = Math.min(
    total,
    Math.max(0, registry._count.totalPurchased),
  );
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

  const actions = (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
      <HeaderAction
        id="registry-guest-view"
        icon="eye"
        title={t("registry.guestView")}
        onPress={handleGuestViewPress}
      />
      <View style={styles.actionDivider} />
      <HeaderAction
        id="registry-visibility"
        icon={registry.visibility === "Private" ? "lock" : "unlock"}
        title={t(
          registry.visibility === "Private"
            ? "common.private"
            : "common.public",
        )}
        onPress={handleVisibilityPress}
      />
      <View style={styles.actionDivider} />
      <HeaderAction
        id="registry-share"
        icon="share-2"
        title={t("common.share")}
        onPress={handleSharePress}
      />
    </View>
  );
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
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
              style={{ width: 84, height: 84, borderRadius: 42 }}
              contentFit="cover"
            />
          ) : (
            <RegistryAvatar
              title={registry.title}
              logo={registry.logo}
              size={84}
            />
          )}
          <View style={styles.camera}>
            <Feather name="camera" size={15} color="white" />
          </View>
          {photo.isUploading && (
            <View style={styles.uploading}>
              <ActivityIndicator color={BrandColors.primary} />
            </View>
          )}
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Pressable
              testID="registry-switch"
              accessibilityRole="button"
              accessibilityLabel={t("registry.switch")}
              onPress={handlePresentModalPress}
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 40,
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
              }}
            >
              <CommerceText
                size="xl"
                weight="bold"
                numberOfLines={1}
                style={{ flexShrink: 1 }}
              >
                {registry.title}
              </CommerceText>
              <Feather name="chevron-down" size={21} color={BrandColors.ink} />
            </Pressable>
            <Pressable
              testID="registry-details"
              accessibilityRole="button"
              accessibilityLabel={t("registry.details")}
              onPress={() => detailsSheetRef.current?.present()}
              style={{
                width: 36,
                height: 40,
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <Feather name="info" size={21} color={BrandColors.ink} />
            </Pressable>
          </View>
          <CommerceText size="xs" style={{ color: BrandColors.muted }}>
            {t("home.registryItems", { count: total })}
            {" · "}
            {t("home.registryPurchased", { count: purchased })}
          </CommerceText>
          {!actionsBelow && actions}
        </View>
      </View>
      {actionsBelow && actions}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginTop: 18,
        }}
      >
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={t("registry.purchases")}
          accessibilityValue={{
            min: 0,
            max: Math.max(1, total),
            now: purchased,
          }}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: BrandColors.line,
          }}
        >
          <View
            style={{
              width: `${total ? (purchased / total) * 100 : 0}%`,
              height: "100%",
              borderRadius: 4,
              backgroundColor: BrandColors.primary,
            }}
          />
        </View>
        <CommerceText size="xs" style={{ color: BrandColors.muted }}>
          {t("registry.purchasedCount", {
            purchased: String(purchased),
            total: String(total),
          })}
        </CommerceText>
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
function HeaderAction({
  id,
  icon,
  title,
  onPress,
}: {
  id: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={id}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={styles.action}
    >
      <Feather name={icon} size={18} color={BrandColors.ink} />
      <CommerceText
        size="xs"
        numberOfLines={1}
        style={{ color: BrandColors.muted, flexShrink: 1 }}
      >
        {title}
      </CommerceText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionDivider: {
    height: 18,
    width: 1,
    backgroundColor: "#DED7D3",
    marginHorizontal: 7,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: "white",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BrandColors.line,
  },
  camera: {
    position: "absolute",
    bottom: 0,
    end: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  uploading: {
    position: "absolute",
    inset: 0,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
});
export default RegistryHeader;
