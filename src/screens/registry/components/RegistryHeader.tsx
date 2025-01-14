import { IconButton } from "@/components/Button";
import Typography from "@/components/Typography";
import { EyeIcon } from "@/components/icons/eye";
import InfoCircleIcon from "@/components/icons/infoCircle";
import { LockIcon } from "@/components/icons/lockIcon";
import { PlusCircleIcon } from "@/components/icons/pluscircle";
import { ShareIcon } from "@/components/icons/share";
import { UnlockIcon } from "@/components/icons/unlockIcon";
import { IRegistry } from "@/types";
import { getImageUrl } from "@/utils/helper";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import SwitchRegistry from "./SwitchRegistrySheet";

const RegistryHeader = ({ registry }: { registry: IRegistry }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { t } = useTranslation();
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <View className="px-4 pt-2 pb-3 mb-6 border-b border-neutral-200">
      <View className="gap-4 items-center">
        <Image
          source={getImageUrl(registry.logo)}
          style={{ width: 80, height: 80 }}
          contentFit="cover"
        />
        <View className="flex-row gap-1 items-center">
          <Typography.Text weight="medium" size="lg">
            {registry.title}
          </Typography.Text>
          <IconButton
            icon={<PlusCircleIcon />}
            onPress={handlePresentModalPress}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row w-full justify-evenly gap-2 mb-2">
          <TouchableOpacity className="flex-row gap-2 items-center">
            <EyeIcon size={20} />
            <Typography.Text type="secondary">
              {t("registry.guestView")}
            </Typography.Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row gap-2 items-center">
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
          <TouchableOpacity className="flex-row gap-2 items-center">
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
          <TouchableOpacity hitSlop={10}>
            <InfoCircleIcon />
          </TouchableOpacity>
        </View>
      </View>
      <SwitchRegistry ref={bottomSheetModalRef} />
    </View>
  );
};

export default RegistryHeader;
