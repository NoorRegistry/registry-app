import { ErrorState } from "@/screens/friends/components";
import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors } from "@/constants/Colors";
import BackButton from "@/components/BackButton";
import LoadingSpinner from "@/components/Loader/customLoader";
import ProductPopularityStats from "@/components/ProductPopularityStats";
import RelatedProducts from "@/components/RelatedProducts";
import Typography from "@/components/Typography";
import { useAddProductToRegistry } from "@/hooks/useAddProductToRegistry";
import { useCart, useCartActions } from "@/hooks/useCart";
import { useCartAddedAnimation } from "@/hooks/useCartAddedAnimation";
import { fetchProductById } from "@/services/products.service";
import { formatPrice, getEnArName } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductImages from "./components/ProductImages";

function ProductScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cart = useCart();
  const { iconStyle: cartIconStyle } = useCartAddedAnimation(
    cart.data?.itemCount,
  );
  const cartAction = useCartActions();
  const {
    data: product,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductById(id),
  });
  const {
    addProductToRegistry,
    addedToRegistryOverlay,
    isAddingProductToRegistry,
  } = useAddProductToRegistry(product);

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

  if (isLoading)
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen
          options={{
            headerTransparent: true,
            headerTitle: "",
            header: () => (
              <SafeAreaView edges={["top"]}>
                <View style={{ paddingHorizontal: 16 }}>
                  <BackButton filled />
                </View>
              </SafeAreaView>
            ),
          }}
        />
        <ScreenSkeleton kind="product" />
      </View>
    );

  if (!product)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ paddingHorizontal: 16 }}>
          <BackButton />
        </View>
        <ErrorState retry={() => void refetch()} />
      </SafeAreaView>
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
                  <Animated.View style={[titleStyle, { flex: 1 }]}>
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
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("cart.viewCart")}
                    onPress={() => router.push("/cart")}
                    style={{
                      width: 44,
                      height: 44,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Animated.View style={cartIconStyle}>
                      <Ionicons name="bag-outline" size={22} color="#202421" />
                    </Animated.View>
                    {!!cart.data?.itemCount && (
                      <View
                        style={{
                          position: "absolute",
                          top: 1,
                          right: 0,
                          minWidth: 17,
                          height: 17,
                          borderRadius: 9,
                          backgroundColor: BrandColors.primary,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 3,
                        }}
                      >
                        <Typography.Text
                          size="xs"
                          weight="medium"
                          style={{ color: "#fff", fontSize: 10 }}
                        >
                          {cart.data.itemCount > 9 ? "9+" : cart.data.itemCount}
                        </Typography.Text>
                      </View>
                    )}
                  </Pressable>
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
            <View className="gap-2">
              <Link
                href={{
                  pathname: "/stores/[id]",
                  params: { id: product?.store?.id! },
                }}
                asChild
              >
                <TouchableOpacity>
                  <Typography.Text
                    size="sm"
                    className="underline"
                    style={{ color: "#CF8169", lineHeight: 22 }}
                  >
                    {t("shop.visitStore", {
                      store: getEnArName(
                        product?.store?.nameEn ?? "",
                        product?.store?.nameAr ?? "",
                      ),
                    })}
                  </Typography.Text>
                </TouchableOpacity>
              </Link>

              {product?.addedInRegistryItemCount && (
                <View className="mt-1 mb-2">
                  <ProductPopularityStats
                    addedInRegistryItemCount={product.addedInRegistryItemCount}
                  />
                </View>
              )}

              <View className="gap-3">
                <Typography.Text
                  size="xl"
                  weight="bold"
                  style={{ lineHeight: 22 }}
                >
                  {getEnArName(product?.nameEn ?? "", product?.nameAr ?? "")}
                </Typography.Text>
                <Typography.Text
                  size="xl"
                  weight="bold"
                  style={{ lineHeight: 22 }}
                >
                  {formatPrice(product?.price, product?.currencyCode)}
                </Typography.Text>
              </View>

              <Typography.Text
                size="sm"
                className="mt-1"
                style={{ color: "#000000", lineHeight: 22 }}
              >
                {getEnArName(
                  product?.descriptionEn ?? "",
                  product?.descriptionAr ?? "",
                )}
              </Typography.Text>
            </View>
          </View>

          {/* Related Products Carousel */}
          <RelatedProducts productId={id} />
        </Animated.ScrollView>
        <SafeAreaView
          edges={["bottom", "left", "right"]}
          className="px-4 pt-3 bg-white"
        >
          <View style={{ flexDirection: "row", gap: 10, paddingBottom: 6 }}>
            <Pressable
              accessibilityRole="button"
              disabled={isAddingProductToRegistry || !product}
              onPress={() => addProductToRegistry()}
              style={{
                flex: 1,
                minHeight: 52,
                borderRadius: 11,
                backgroundColor: "#F1F2EE",
                alignItems: "center",
                justifyContent: "center",
                opacity: isAddingProductToRegistry ? 0.6 : 1,
              }}
            >
              {isAddingProductToRegistry ? (
                <LoadingSpinner size="small" />
              ) : (
                <Typography.Text
                  weight="medium"
                  style={{ textAlign: "center" }}
                >
                  {t("cart.addToRegistry")}
                </Typography.Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={cartAction.isPending || !product || product.qty <= 0}
              onPress={() =>
                cartAction.mutate({ kind: "add", productId: product!.id })
              }
              style={{
                flex: 1,
                minHeight: 52,
                borderRadius: 11,
                backgroundColor: BrandColors.primary,
                alignItems: "center",
                justifyContent: "center",
                opacity: cartAction.isPending || !product?.qty ? 0.55 : 1,
              }}
            >
              {cartAction.isPending ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <Typography.Text
                  weight="medium"
                  style={{ color: "#fff", textAlign: "center" }}
                >
                  {t(product?.qty === 0 ? "cart.outOfStock" : "cart.addToCart")}
                </Typography.Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
      {addedToRegistryOverlay}
    </View>
  );
}

export default ProductScreen;
