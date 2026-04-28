import NoRegistryCard from "@/components/NoRegistryCard";
import Typography from "@/components/Typography";
import { fetchRegistries } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { IRegistry } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import RegistrySkeleton, {
  resolveRegistrySkeletonVariant,
} from "./RegistryCardSkeleton";

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
  const selectedRegistry =
    registries?.find((registry) => registry.id === selectedRegistryId) ??
    registries?.[0];

  const registryCardBackgroundSource = require("@assets/images/home/create-registry-background.jpg");

  const registryCardGradientColors = [
    "rgba(0,0,0,0.05)",
    "rgba(0,0,0,0.5)",
    "rgba(0,0,0,0.9)",
  ] as const;

  return (
    <View className="relative">
      <View className="w-full mb-6 items-center px-4">
        {isFetchingRegistries ? (
          <RegistrySkeleton
            variant={resolveRegistrySkeletonVariant(registries)}
          />
        ) : (
          <View className="w-full mt-6 rounded-2xl shadow-sm overflow-hidden">
            <ImageBackground
              source={registryCardBackgroundSource}
              contentFit="cover"
              className="flex-1 relative"
              style={{ width: "100%" }}
            >
              <LinearGradient
                colors={registryCardGradientColors}
                locations={[0, 0.55, 1]}
                start={{ x: 0, y: 0.05 }}
                end={{ x: 1, y: 0.95 }}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
              <View className="p-6">
                {registries?.length ? (
                  <DisplaySelectedRegistryInfo registry={selectedRegistry} />
                ) : (
                  <NoRegistryCard />
                )}
              </View>
            </ImageBackground>
          </View>
        )}
      </View>
    </View>
  );
}

const DisplaySelectedRegistryInfo = ({
  registry,
}: {
  registry?: IRegistry;
}) => {
  const { t } = useTranslation();
  if (!registry) return null;

  return (
    <View className="gap-8">
      <View className="flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-full bg-[#d8efff] items-center justify-center">
          <Text style={{ fontSize: 30 }}>👦🏻</Text>
        </View>
        <View className="flex-1">
          <Typography.Text
            size="xl"
            numberOfLines={2}
            ellipsizeMode="tail"
            weight="bold"
            className="!text-white"
            style={{ lineHeight: 30 }}
          >
            {registry.title}
          </Typography.Text>
        </View>
      </View>
      <View className="flex-row gap-8">
        <View className="flex-1 gap-2">
          <Typography.Text
            size="sm"
            weight="bold"
            className="uppercase !text-white"
            style={{ opacity: 0.9, letterSpacing: 0.5 }}
          >
            {t("registry.itemsAdded")}
          </Typography.Text>
          <Typography.Text
            weight="bold"
            className="!text-white"
            style={{ fontSize: 56, lineHeight: 58 }}
          >
            {formatCount(registry._count.totalItems)}
          </Typography.Text>
        </View>
        <View className="flex-1 gap-2">
          <Typography.Text
            size="sm"
            weight="bold"
            className="uppercase !text-white"
            style={{ opacity: 0.9, letterSpacing: 0.5 }}
          >
            {t("registry.giftsPurchased")}
          </Typography.Text>
          <Typography.Text
            weight="bold"
            className="!text-white"
            style={{ fontSize: 56, lineHeight: 58 }}
          >
            {formatCount(registry._count.totalPurchased)}
          </Typography.Text>
        </View>
      </View>
    </View>
  );
};

const formatCount = (value: number) => value.toString().padStart(2, "0");
