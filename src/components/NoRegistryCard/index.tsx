import { Image } from "expo-image";
import { router } from "expo-router";
import { t } from "i18next";
import React from "react";
import { View } from "react-native";
import { Button } from "../Button";
import Typography from "../Typography";

function NoRegistryCard() {
  return (
    <View className="gap-6">
      <View className="flex-row gap-6 items-start">
        <View className="flex-1 gap-3">
          <Typography.Text size="xl" weight="bold">
            {t("home.buildRegistry")}
          </Typography.Text>
          <Typography.Text type="secondary" weight="light">
            {t("home.buildRegistryDesc")}
          </Typography.Text>
        </View>

        <Image
          style={{ width: 50, height: 50 }}
          source={require("@assets/images/home/gift-box1.png")}
        />
      </View>
      <Button
        onPress={() => router.push("/(protected)/registry/create")}
        title={t("home.getStarted")}
        size="large"
        type="primary"
      />
    </View>
  );
}

export default NoRegistryCard;
