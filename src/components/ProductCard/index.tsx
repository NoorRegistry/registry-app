import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import { BrandColors } from "@/constants/Colors";
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
import { useCallback, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { GreenPlusCircleIcon } from "../icons/greenplusCircle";

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

const ProductCard = ({
  product,
  width: customWidth,
  onPress,
}: {
  product: IProduct;
  width?: number;
  onPress?: () => void;
}) => {
  const { width, height, fontScale } = useWindowDimensions();
  const finalWidth = customWidth ?? (width - 44) / 2;
  const imageUri = product.images?.[0]?.path
    ? getImageUrl(product.images[0].path)
    : null;
  const [failedImage, setFailedImage] = useState<string | null>(null);
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
      <View style={{ width: finalWidth }}>
        <Link
          href={{
            pathname: "/(protected)/products/[id]",
            params: { id: product.id },
          }}
          asChild
        >
          <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View
              testID="product-image-frame"
              style={[styles.imageFrame, { height: finalWidth }]}
            >
              {imageUri && failedImage !== imageUri ? (
                <Image
                  source={imageUri}
                  recyclingKey={imageUri}
                  style={styles.image}
                  contentFit="contain"
                  onError={() => setFailedImage(imageUri)}
                />
              ) : (
                <Ionicons
                  name="image-outline"
                  size={32}
                  color={BrandColors.muted}
                />
              )}
            </View>
            <View style={styles.details}>
              <Typography.Text
                numberOfLines={1}
                ellipsizeMode="tail"
                size="xs"
                style={{
                  color: BrandColors.muted,
                  height: Math.ceil(17 * fontScale),
                }}
              >
                {product.store
                  ? getEnArName(product.store.nameEn, product.store.nameAr)
                  : ""}
              </Typography.Text>
              <Typography.Text
                testID="product-name"
                numberOfLines={2}
                ellipsizeMode="tail"
                size="sm"
                style={{
                  color: BrandColors.ink,
                  height: Math.ceil(40 * fontScale),
                }}
              >
                {getEnArName(product.nameEn, product.nameAr)}
              </Typography.Text>
              <Typography.Text
                testID="product-price"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                weight="medium"
                size="sm"
                style={{
                  color: BrandColors.deep,
                  height: Math.ceil(20 * fontScale),
                }}
              >
                {formatPrice(product.price, product.currencyCode)}
              </Typography.Text>
            </View>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("cart.addOptions")}
          testID="product-add-options"
          hitSlop={4}
          style={[styles.addButton, { top: finalWidth - 42 }]}
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
      <AppBottomSheetModal
        ref={actionSheetRef}
        accessible={false}
        index={0}
        topInset={insets.top}
        enableOverDrag={false}
        enablePanDownToClose
        enableDynamicSizing
        maxDynamicContentSize={0.5 * height}
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
      </AppBottomSheetModal>
      {addedToRegistryOverlay}
    </>
  );
};

const styles = StyleSheet.create({
  imageFrame: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8F6F4",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    position: "absolute",
    top: 0,
    bottom: 0,
    start: 0,
    end: 0,
  },
  details: { paddingTop: 10, paddingBottom: 12, gap: 4 },
  addButton: {
    position: "absolute",
    end: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProductCard;
