import Typography from "@/components/Typography";
import { HeartIcon } from "@/components/icons/heart";
import { UserIcon } from "@/components/icons/user";
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

  // Don't show if no data or all counts are zero
  if (
    !addedInRegistryItemCount ||
    (addedInRegistryItemCount.lifetime === 0 &&
      addedInRegistryItemCount.days === 0 &&
      addedInRegistryItemCount.recentlyAdded === 0)
  ) {
    return null;
  }

  const { lifetime, days, recentlyAdded } = addedInRegistryItemCount;

  return (
    <View className="py-4">
      <View className="bg-green-50 border border-green-200 rounded-lg p-3">
        <View className="flex-row items-center mb-2">
          <HeartIcon width={16} height={16} color="#16a34a" />
          <Typography.Text
            size="sm"
            weight="medium"
            className="ml-2 text-green-700"
          >
            {t("shop.addedToRegistries")}
          </Typography.Text>
        </View>

        <View className="gap-1">
          {/* Show most relevant stat first - prioritize recent activity only if it's significant (>=10) */}
          {recentlyAdded >= 10 && days > 0 ? (
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Typography.Text size="xs" className="text-green-700">
                {t("shop.popularityStats", { count: recentlyAdded, days })}
              </Typography.Text>
            </View>
          ) : lifetime > 0 ? (
            <View className="flex-row items-center">
              <UserIcon width={12} height={12} color="#16a34a" />
              <Typography.Text size="xs" className="ml-2 text-green-700">
                {t("shop.totalTimesAdded", { count: lifetime })}
              </Typography.Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default ProductPopularityStats;
