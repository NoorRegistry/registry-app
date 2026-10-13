import { BrandColors } from "@/constants/Colors";
import { View } from "@/components/Themed";
import LoadingSpinner from "@/components/Loader/customLoader";
import Typography from "@/components/Typography";
import { useAddProductToRegistry } from "@/hooks/useAddProductToRegistry";
import { useCartActions } from "@/hooks/useCart";
import { IProduct } from "@/types";
import { formatPrice, getEnArName, getImageUrl } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useCallback, useRef } from "react";
import { Dimensions, Pressable, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { GreenPlusCircleIcon } from "../icons/greenplusCircle";
const { width } = Dimensions.get("window");
/* 16px per card for side padding and 12px as half of 24px for space in-between */
const cardWidth = width / 2 - 16 - 8;

function ProductActionSheet({
  outOfStock,
  onAddToRegistry,
  onAddToCart,
}: {
  outOfStock: boolean;
  onAddToRegistry: () => void;
  onAddToCart: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetView
      style={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("cart.addToRegistry")}
        onPress={onAddToRegistry}
        style={{
          minHeight: 54,
          borderRadius: 13,
          backgroundColor: "#F2F3EF",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <Ionicons name="list-outline" size={21} color="#202421" />
        <Typography.Text weight="medium">
          {t("cart.addToRegistry")}
        </Typography.Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(
          outOfStock ? "cart.outOfStock" : "cart.addToCart",
        )}
        disabled={outOfStock}
        onPress={onAddToCart}
        style={{
          minHeight: 54,
          borderRadius: 13,
          backgroundColor: BrandColors.primary,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: outOfStock ? 0.45 : 1,
        }}
      >
        <Ionicons name="bag-outline" size={20} color="#fff" />
        <Typography.Text weight="medium" style={{ color: "#fff" }}>
          {t(outOfStock ? "cart.outOfStock" : "cart.addToCart")}
        </Typography.Text>
      </Pressable>
    </BottomSheetView>
  );
}

// Product Card component
const ProductCard = ({
  product,
  width: customWidth,
  reserveNameSpace = false,
}: {
  product: IProduct;
  width?: number;
  reserveNameSpace?: boolean;
}) => {
  const finalWidth = customWidth || cardWidth;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const actionSheetRef = useRef<BottomSheetModal>(null);
  const cartAction = useCartActions();
  const {
    addProductToRegistry,
    addedToRegistryOverlay,
    isAddingProductToRegistry,
  } = useAddProductToRegistry(product);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        pressBehavior="close"
      />
    ),
    [],
  );

  const openActions = () => actionSheetRef.current?.present();
  const closeActions = () => actionSheetRef.current?.dismiss();

  return (
    <>
      <View
        style={{ width: finalWidth }}
        className="bg-white rounded-lg items-center"
      >
        <Link
          href={{
            pathname: "/(protected)/products/[id]",
            params: {
              id: product.id,
            },
          }}
          asChild
        >
          <TouchableOpacity className="w-full">
            <View className="w-full rounded-lg">
              <Image
                source={
                  product.images?.[0]?.path
                    ? getImageUrl(product.images[0].path)
                    : require("@assets/images/icon.png") // Fallback to app icon
                }
                style={{
                  flex: 1,
                  borderRadius: 8,
                  width: finalWidth, // subtract 2 for border now
                  height: finalWidth,
                }}
                contentFit="cover"
              />
            </View>
            <View className="pt-3 w-full gap-1">
              {product?.store && (
                <Typography.Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  weight="medium"
                  size="xs"
                  type="complementary"
                >
                  {getEnArName(product.store.nameEn, product.store.nameAr)}
                </Typography.Text>
              )}
              <Typography.Text
                numberOfLines={2}
                ellipsizeMode="tail"
                weight="light"
                size="xs"
                className={reserveNameSpace ? "h-8" : ""}
              >
                {getEnArName(product.nameEn, product.nameAr)}
              </Typography.Text>
            </View>
          </TouchableOpacity>
        </Link>
        <View className="w-full mt-2 pb-3 flex-row items-center">
          <Typography.Text
            numberOfLines={2}
            ellipsizeMode="tail"
            weight="medium"
            className="flex-1"
          >
            {formatPrice(product.price, product.currencyCode)}
          </Typography.Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("cart.addOptions")}
            className="h-8 w-8 items-center justify-center"
            disabled={isAddingProductToRegistry || cartAction.isPending}
            onPress={openActions}
          >
            {isAddingProductToRegistry || cartAction.isPending ? (
              <LoadingSpinner size="small" />
            ) : (
              <GreenPlusCircleIcon size={30} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheetModal
        ref={actionSheetRef}
        accessible={false}
        index={0}
        topInset={insets.top}
        enableOverDrag={false}
        enablePanDownToClose
        enableDynamicSizing
        maxDynamicContentSize={0.5 * Dimensions.get("screen").height}
        style={{
          borderRadius: 32,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
          elevation: 6,
        }}
        backgroundStyle={{ backgroundColor: "#FAFAFA" }}
        handleIndicatorStyle={{
          backgroundColor: "#EFE7E2",
          width: 51,
          height: 3,
          borderRadius: 999,
        }}
        backdropComponent={renderBackdrop}
      >
        <ProductActionSheet
          outOfStock={product.qty <= 0}
          onAddToRegistry={() => {
            closeActions();
            addProductToRegistry();
          }}
          onAddToCart={() => {
            closeActions();
            cartAction.mutate({ kind: "add", productId: product.id });
          }}
        />
      </BottomSheetModal>
      {addedToRegistryOverlay}
    </>
  );
};

export default ProductCard;
