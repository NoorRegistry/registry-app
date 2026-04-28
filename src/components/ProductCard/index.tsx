import { View } from "@/components/Themed";
import LoadingSpinner from "@/components/Loader/customLoader";
import Typography from "@/components/Typography";
import { useAddProductToRegistry } from "@/hooks/useAddProductToRegistry";
import { IProduct } from "@/types";
import { formatPrice, getEnArName, getImageUrl } from "@/utils/helper";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Dimensions, TouchableOpacity } from "react-native";
import { GreenPlusCircleIcon } from "../icons/greenplusCircle";
const { width } = Dimensions.get("window");
/* 16px per card for side padding and 12px as half of 24px for space in-between */
const cardWidth = width / 2 - 16 - 8;

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
  const {
    addProductToRegistry,
    addedToRegistryOverlay,
    isAddingProductToRegistry,
  } = useAddProductToRegistry(product);

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
            className=" flex-1"
          >
            {formatPrice(product.price, product.currencyCode)}
          </Typography.Text>
          <TouchableOpacity
            className="h-8 w-8 items-center justify-center"
            disabled={isAddingProductToRegistry}
            onPress={() => {
              addProductToRegistry();
            }}
          >
            {isAddingProductToRegistry ? (
              <LoadingSpinner size="small" />
            ) : (
              <GreenPlusCircleIcon size={30} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {addedToRegistryOverlay}
    </>
  );
};

export default ProductCard;
