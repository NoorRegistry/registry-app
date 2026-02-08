import NoRegistryCard from "@/components/NoRegistryCard";
import Typography from "@/components/Typography";
import {
  fetchRegistries,
  fetchRegistriesCategories,
} from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { IRegistry } from "@/types";
import { getImageUrl } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { ImageBackground } from "expo-image";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
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
  const { data: registryCategories, isFetching: isFetchingRegistryCategories } =
    useQuery({
      queryKey: ["registryCategories"],
      queryFn: fetchRegistriesCategories,
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

  const selectedCategoryImagePath = registryCategories?.find(
    (category) =>
      category.id ===
      (selectedRegistry?.category?.id ?? selectedRegistry?.categoryId),
  )?.registryBackground;

  const registryCardBackgroundSource =
    selectedCategoryImagePath && getImageUrl(selectedCategoryImagePath)
      ? { uri: getImageUrl(selectedCategoryImagePath) }
      : require("@assets/images/home/create-registry-background.jpg");

  return (
    <View className="relative">
      <View className="w-full mb-6 items-center px-4">
        {isFetchingRegistries || isFetchingRegistryCategories ? (
          <RegistrySkeleton />
        ) : (
          <View className="w-full mt-6 rounded-2xl shadow-sm overflow-hidden">
            <ImageBackground
              source={registryCardBackgroundSource}
              contentFit="cover"
              className="flex-1"
              style={{ width: "100%" }}
            >
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
