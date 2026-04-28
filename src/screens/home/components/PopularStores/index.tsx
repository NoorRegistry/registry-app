import { Button } from "@/components/Button";
import { ChevronRightMDIcon } from "@/components/icons/chevron_md";
import { Colors } from "@/constants/Colors";
import { fetchStores } from "@/services/stores.service";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Pressable, View, useColorScheme } from "react-native";
import SectionTitle from "../SectionTitle";

/// Skeleton Component
const SkeletonLoader = ({ isVisible }: { isVisible: boolean }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    };

    startShimmer();
  }, [shimmerAnim]);

  if (!isVisible) {
    return null;
  }

  const shimmerColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0E0E0", "#F0F0F0"], // Light shimmer effect colors
  });

  const skeletonItems = Array.from({ length: 9 }, (_, index) => index);

  return (
    <View className="flex flex-wrap flex-row justify-between gap-y-4">
      {skeletonItems.map((_, index) => (
        <Animated.View
          className="rounded-3xl h-24"
          key={index}
          style={{
            width: "30%",
            backgroundColor: shimmerColor,
          }}
        />
      ))}
    </View>
  );
};

function PopularStores() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const { data: stores, isFetching } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    placeholderData: keepPreviousData,
  });

  return (
    <View className="px-4 pt-0 pb-4 bg-white gap-5">
      <SectionTitle>{t("home.browsePopularStores")}</SectionTitle>
      <SkeletonLoader isVisible={isFetching && !stores} />
      {stores && (
        <>
          <View className="flex flex-wrap flex-row justify-between gap-y-4">
            {stores?.data.map((store) => (
              <Link
                href={{
                  pathname: "/stores/[id]",
                  params: {
                    id: store.id,
                    storeName: getEnArName(store.nameEn, store.nameAr),
                  },
                }}
                key={store.id}
                asChild
              >
                <Pressable
                  key={store.id}
                  className="w-[30%] h-24 p-2 items-center justify-center border border-neutral-200 rounded-3xl"
                >
                  <View className="flex-1 w-full">
                    <Image
                      source={{ uri: getImageUrl(store.storeLogo) }}
                      style={{ flex: 1 }}
                      contentFit="contain"
                    />
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
          <Button
            type="text"
            title={t("common.viewAll")}
            onPress={() => {
              router.push("/(protected)/stores");
            }}
            iconRight={
              <ChevronRightMDIcon color={Colors[colorScheme ?? "light"].tint} />
            }
          />
        </>
      )}
    </View>
  );
}

export default PopularStores;
