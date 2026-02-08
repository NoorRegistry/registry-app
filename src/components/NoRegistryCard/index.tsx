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
          <View className="me-10">
            <Typography.Text size="xl" weight="bold" className="!text-white">
              {t("home.buildRegistry")}
            </Typography.Text>
          </View>
          <Typography.Text
            type="secondary"
            weight="light"
            className="!text-white"
          >
            {t("home.buildRegistryDesc")}
          </Typography.Text>
        </View>
      </View>
      <Button
        onPress={() => router.push("/(protected)/registry/create")}
        title={t("home.getStarted")}
      />
    </View>
  );
}

export default NoRegistryCard;
