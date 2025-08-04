import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/Button";
import ProductPopularityStats from "@/components/ProductPopularityStats";
import RelatedProducts from "@/components/RelatedProducts";
import Typography from "@/components/Typography";
import { fetchProductById } from "@/services/products.service";
import { addItemToRegistry } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { ICreateRegistryItem } from "@/types";
import { formatPrice, getEnArName } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ProductImages from "./components/ProductImages";

function ProductScreen() {
  const { t } = useTranslation();
  const selectedRegistryId = useGlobalStore(
    (state) => state.selectedRegistryId,
  );
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: product, isFetching } = useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductById(id),
  });

  const scrollY = useSharedValue(0); // Shared value for scrolling
  const headerHeight = 288; // Height of the image slider

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Header background animation
  const headerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollY.value,
      [0, headerHeight],
      ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"],
    ),
  }));

  // Header title opacity animation
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, headerHeight / 2, headerHeight],
      [0, 0.5, 1],
    ),
  }));

  const backButtonStyle = useAnimatedStyle(() => ({
    shadowColor: "rgba(0, 0, 0, 0.2)", // A subtle black shadow with reduced opacity
    shadowOpacity: interpolate(
      scrollY.value,
      [0, headerHeight],
      [0.2, 0], // Start with low shadow opacity, fade to 0
    ),
    shadowRadius: interpolate(
      scrollY.value,
      [0, headerHeight],
      [2, 0], // Smaller radius for a softer shadow
    ),
    shadowOffset: { width: 0, height: 1 }, // Subtle vertical offset
    elevation: interpolate(
      scrollY.value,
      [0, headerHeight],
      [2, 0], // Lower elevation for subtle shadow effect
    ),
  }));

  const createRegistryItemMutation = useMutation({
    mutationFn: (data: ICreateRegistryItem) => addItemToRegistry(data),
    onSuccess: (data, variables) => {
      try {
        queryClient.invalidateQueries({
          queryKey: ["registryById", selectedRegistryId],
        });
        Toast.show({
          text1: t("registry.itemAddedToregistry"),
          visibilityTime: 2000,
        });
      } catch (error) {
        console.error(error);
      }
    },
    onError: (err: IApiError) => {
      /* messageApi.error({
        content: err.detail,
      }); */
    },
  });

  if (isFetching)
    return (
      <View className="flex-1 justify-center items-center">
        <Stack.Screen options={{ headerTransparent: true, headerTitle: "" }} />
        <Typography.Text className="text-gray-500">Loading</Typography.Text>
      </View>
    );

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerTransparent: true,
          header: () => (
            <Animated.View
              className="z-10"
              style={headerStyle} // Apply animated background style
            >
              <SafeAreaView edges={["top"]}>
                <View className="flex-row px-4 gap-4 items-center pb-2">
                  <Animated.View style={backButtonStyle}>
                    <BackButton filled />
                  </Animated.View>
                  <Animated.View style={[titleStyle]}>
                    <Typography.Text
                      weight="medium"
                      size="base"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {getEnArName(
                        product?.nameEn || "",
                        product?.nameAr || "",
                      )}
                    </Typography.Text>
                  </Animated.View>
                </View>
              </SafeAreaView>
            </Animated.View>
          ),
        }}
      />
      <View className="flex-1">
        {/* Scrollable Content */}
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: headerHeight,
          }}
          onScroll={scrollHandler} // Use scroll handler
          scrollEventThrottle={16}
        >
          <ProductImages images={product?.images ?? []} />
          <View className="px-4 py-6">
            <View className="gap-1">
              <Link
                href={{
                  pathname: "/stores/[id]",
                  params: { id: product?.store?.id! },
                }}
                asChild
              >
                <TouchableOpacity>
                  <Typography.Text
                    size="base"
                    type="complementary"
                    weight="medium"
                  >
                    {getEnArName(
                      product?.store?.nameEn ?? "",
                      product?.store?.nameAr ?? "",
                    )}
                  </Typography.Text>
                </TouchableOpacity>
              </Link>
              <Typography.Text size="base">
                {getEnArName(product?.nameEn ?? "", product?.nameAr ?? "")}
              </Typography.Text>
              <Typography.Text className="mt-2" type="secondary" weight="light">
                {getEnArName(
                  product?.descriptionEn ?? "",
                  product?.descriptionAr ?? "",
                )}
              </Typography.Text>
            </View>

            {/* Product Popularity Stats */}
            {product?.addedInRegistryItemCount && (
              <ProductPopularityStats
                addedInRegistryItemCount={product.addedInRegistryItemCount}
              />
            )}

            <View className="py-4">
              <Typography.Text weight="medium" size="lg">
                {formatPrice(product?.price, product?.currencyCode)}
              </Typography.Text>
            </View>
          </View>

          {/* Related Products Carousel */}
          <RelatedProducts productId={id} />
        </Animated.ScrollView>
        <SafeAreaView
          style={{ paddingBottom: insets.bottom }}
          edges={["bottom", "left", "right"]}
          className="px-4 pt-4"
        >
          <Button
            onPress={() => {
              createRegistryItemMutation.mutate({
                productId: id,
                qty: 1,
                registryId: selectedRegistryId!,
              });
            }}
            size="large"
            type="primary"
            title={t("registry.addtoShiftGift")}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

export default ProductScreen;
