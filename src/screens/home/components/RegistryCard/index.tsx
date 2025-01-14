import NoRegistryCard from "@/components/NoRegistryCard";
import Typography from "@/components/Typography";
import { fetchRegistries } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { IRegistry } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import RegistrySkeleton from "./RegistryCardSkeleton";

export default function RegistryCard() {
  const selectedRegistryId = useGlobalStore(
    (state) => state.selectedRegistryId,
  );
  const setSelectedRegistryId = useGlobalStore(
    (state) => state.setSelectedRegistryId,
  );

  const { data: registries, isFetching: isFetchingRegistries } = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });

  useEffect(() => {
    if (registries && registries.length) {
      if (selectedRegistryId !== registries?.[0]?.id)
        setSelectedRegistryId(registries?.[0]?.id);
    }
  }, [registries]);

  // if (isFetchingRegistries) return <LoadingScreen />;

  return (
    <View className="relative">
      <WiderHalfOval boxHeight={150} />
      <View className="w-full mb-6 items-center px-4">
        {isFetchingRegistries ? (
          <RegistrySkeleton />
        ) : (
          <View className="p-6 w-full mt-12 bg-white rounded-2xl shadow-sm">
            {registries && registries.length ? (
              <DisplaySelectedRegistryInfo registry={registries?.[0]} />
            ) : (
              <NoRegistryCard />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const WiderHalfOval = ({ boxHeight }: { boxHeight: number }) => {
  const extendedWidth = width; // Use screen width
  const ovalHeight = 100; // Fixed height for the curved part

  return (
    <View className="absolute">
      <Svg
        width={extendedWidth}
        height={boxHeight + ovalHeight} // Combine the square height and the fixed curved height
        viewBox={`0 0 ${extendedWidth} ${boxHeight + ovalHeight}`}
      >
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#c3ccdd" />
            <Stop offset="50%" stopColor="#788aad" />
            <Stop offset="100%" stopColor="#3e598e" />
          </LinearGradient>
        </Defs>

        {/* Gradient-Filled Square */}
        <Rect
          x="0"
          y="0"
          width={extendedWidth}
          height={boxHeight}
          fill="url(#gradient)"
        />

        {/* Transparent Curved Part */}
        <Path
          d={`M 0 ${boxHeight} 
              L 0 ${boxHeight + ovalHeight}
              Q ${extendedWidth / 2} ${boxHeight}, 
              ${extendedWidth} ${boxHeight + ovalHeight}
              L ${extendedWidth} ${boxHeight}
              Z`}
          fill="white" // Background color (transparent area)
        />

        {/* Gradient-Filled Overlay */}
        <Path
          d={`M 0 ${boxHeight} 
              Q ${extendedWidth / 2} ${boxHeight + ovalHeight}, 
              ${extendedWidth} ${boxHeight}
              L ${extendedWidth} 0
              L 0 0
              Z`}
          fill="url(#gradient)"
        />
      </Svg>
    </View>
  );
};

const DisplaySelectedRegistryInfo = ({ registry }: { registry: IRegistry }) => {
  const { t } = useTranslation();
  return (
    <View>
      <Typography.Text
        size="xl"
        numberOfLines={2}
        ellipsizeMode="tail"
        weight="bold"
        className="text-center mb-4"
      >
        {registry.title}
      </Typography.Text>
      <View className="flex-row gap-6">
        <View className="flex-1 gap-1">
          <Typography.Text
            size="2xl"
            numberOfLines={2}
            ellipsizeMode="tail"
            weight="bold"
            className="text-center"
            type="complementary"
          >
            {registry._count.totalItems}
          </Typography.Text>
          <Typography.Text
            size="lg"
            numberOfLines={2}
            ellipsizeMode="tail"
            weight="medium"
            className="text-center"
          >
            {t("registry.itemsAdded")}
          </Typography.Text>
        </View>
        <View className="flex-1 gap-1">
          <Typography.Text
            size="2xl"
            numberOfLines={2}
            ellipsizeMode="tail"
            weight="bold"
            className="text-center"
            type="complementary"
          >
            {registry._count.totalPurchased}
          </Typography.Text>
          <Typography.Text
            size="lg"
            numberOfLines={2}
            ellipsizeMode="tail"
            weight="medium"
            className="text-center"
          >
            {t("registry.giftsPurchased")}
          </Typography.Text>
        </View>
      </View>
    </View>
  );
};
