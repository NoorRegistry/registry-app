import Typography from "@/components/Typography";
import { LightningIcon } from "@/components/icons/lightningIcon";
import { IProductDetails } from "@/types";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface ProductPopularityStatsProps {
  addedInRegistryItemCount: IProductDetails["addedInRegistryItemCount"];
}

const ProductPopularityStats = ({
  addedInRegistryItemCount,
}: ProductPopularityStatsProps) => {
  const { t } = useTranslation();

  // Don't show if no data
  if (!addedInRegistryItemCount) {
    return null;
  }

  const { lifetime, recentlyAdded } = addedInRegistryItemCount;
  const registryCount = lifetime || recentlyAdded;

  if (!registryCount) {
    return null;
  }

  return (
    <View
      className="h-[31px] self-start rounded-lg border px-2 flex-row items-center justify-center"
      style={{
        backgroundColor: "#EBFFEE",
        borderColor: "#75C492",
      }}
    >
      <LightningIcon size={24} color="#14AE5C" />
      <Typography.Text
        size="xs"
        className="ml-0.5"
        style={{ color: "#14AE5C", lineHeight: 18 }}
      >
        {t("shop.addedToRegistriesCount", { count: registryCount })}
      </Typography.Text>
    </View>
  );
};

export default ProductPopularityStats;
