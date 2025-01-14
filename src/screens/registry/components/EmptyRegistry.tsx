import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

function EmptyRegistry() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white p-10">
      <Typography.Text type="secondary" className="text-center">
        {t("registry.emptyRegistry")}
      </Typography.Text>
      <Button
        title={t("registry.startAddingItems")}
        onPress={() => {
          router.navigate("/(protected)/(tabs)/shop");
        }}
        // ghost
        type="primary"
      />
    </View>
  );
}

export default EmptyRegistry;
