import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import { View } from "@/components/Themed";
import Typography from "@/components/Typography";
import { addItemToRegistry } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { ICreateRegistryItem, IProduct } from "@/types";
import { formatPrice, getEnArName, getImageUrl } from "@/utils/helper";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Dimensions, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { GreenPlusCircleIcon } from "../icons/greenplusCircle";
const { width } = Dimensions.get("window");
/* 16px per card for side padding and 12px as half of 24px for space in-between */
const cardWidth = width / 2 - 16 - 8;

// Product Card component
const ProductCard = ({
  product,
  width: customWidth,
}: {
  product: IProduct;
  width?: number;
}) => {
  const { t } = useTranslation();
  const selectedRegistryId = useGlobalStore(
    (state) => state.selectedRegistryId,
  );

  const finalWidth = customWidth || cardWidth;

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

  return (
    <Link
      href={{
        pathname: "/(protected)/products/[id]",
        params: {
          id: product.id,
        },
      }}
      asChild
    >
      <TouchableOpacity
        style={{ width: finalWidth }}
        className="bg-white rounded-lg items-center mb-4"
      >
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
            className="h-8" // Fixed height for exactly 2 lines (32px = h-8 in Tailwind)
          >
            {getEnArName(product.nameEn, product.nameAr)}
          </Typography.Text>
        </View>
        <View className="w-full mt-2 pb-3 flex-row items-center">
          <Typography.Text
            numberOfLines={2}
            ellipsizeMode="tail"
            weight="medium"
            className=" flex-1"
          >
            {formatPrice(product.price, product.currencyCode)}
          </Typography.Text>
          <View className="">
            <GreenPlusCircleIcon
              size={30}
              onPress={(event) => {
                event.stopPropagation();
                createRegistryItemMutation.mutate({
                  productId: product.id,
                  qty: 1,
                  registryId: selectedRegistryId!,
                });
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default ProductCard;
