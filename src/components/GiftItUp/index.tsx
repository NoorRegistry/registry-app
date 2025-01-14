import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Typography from "../Typography";
import { HeartIcon } from "../icons/heart";

function GiftItUp() {
  const { t } = useTranslation();
  return (
    <View className="px-8 py-12 bg-neutral-100">
      <Typography.Text
        weight="bold"
        size="2xl"
        className="text-5xl text-neutral-500 leading-[60px]"
      >
        {t("common.giftItUp1")}
      </Typography.Text>
      <Typography.Text
        weight="bold"
        size="2xl"
        className="text-5xl text-neutral-500 leading-[60px]"
      >
        {t("common.giftItUp2")}
      </Typography.Text>
      <View className="flex-row gap-2 items-center mt-6">
        <Typography.Text weight="extralight">
          {t("common.craftedWithLove1")}
        </Typography.Text>
        <HeartIcon />
        <Typography.Text weight="extralight">
          {t("common.craftedWithLove2")}
        </Typography.Text>
      </View>
    </View>
  );
}

export default GiftItUp;
