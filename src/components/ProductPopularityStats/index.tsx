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

  // Don't show if no data
  if (!addedInRegistryItemCount) {
    return null;
  }

  const { lifetime, days, recentlyAdded } = addedInRegistryItemCount;

  // Determine what we'll actually show - prioritize recent stats
  const showRecentStats = recentlyAdded >= 10 && days > 0;
  const showLifetimeStats = !showRecentStats && lifetime > 0;

  // Don't show the component at all if we have nothing meaningful to display
  if (!showRecentStats && !showLifetimeStats) {
    return null;
  }

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
          {/* Show recent stats if significant */}
          {showRecentStats && (
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Typography.Text size="xs" className="text-green-700">
                {t("shop.popularityStats", { count: recentlyAdded, days })}
              </Typography.Text>
            </View>
          )}

          {/* Show lifetime stats only when recent stats are not significant */}
          {showLifetimeStats && (
            <View className="flex-row items-center">
              <UserIcon width={12} height={12} color="#16a34a" />
              <Typography.Text size="xs" className="ml-2 text-green-700">
                {t("shop.totalTimesAdded", { count: lifetime })}
              </Typography.Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ProductPopularityStats;
