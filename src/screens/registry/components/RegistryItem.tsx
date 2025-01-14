import Typography from "@/components/Typography";
import PencilIcon from "@/components/icons/pencil";
import { IRegistryItem } from "@/types";
import { formatPrice, getEnArName, getImageUrl } from "@/utils/helper";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

function RegistryItem({ registryItem }: { registryItem: IRegistryItem }) {
  const { t } = useTranslation();
  const href = `/products/${registryItem.product.id}` as "/products/${string}";

  return (
    <View className="flex-row items-center bg-white p-2 rounded-md mb-4 shadow shadow-neutral-200 mx-4 gap-4">
      {registryItem.product.images &&
        registryItem.product.images.length > 0 && (
          <Link href={href}>
            <Image
              source={getImageUrl(registryItem.product.images[0].path)}
              style={{ width: 80, height: 80, borderRadius: 6 }}
            />
          </Link>
        )}
      <View className="flex-1 gap-2">
        <Link href={href} asChild>
          <TouchableOpacity>
            <Typography.Text size="xs" weight="light">
              {getEnArName(
                registryItem.product.nameEn,
                registryItem.product.nameAr,
              )}
            </Typography.Text>
          </TouchableOpacity>
        </Link>
        {registryItem.qty - registryItem.qtyLeft > 0 && (
          <Typography.Text className="text-xs text-gray-400">
            {t("registry.purchasedOutOf", {
              purchased: registryItem.qty - registryItem.qtyLeft,
              total: registryItem.qty,
            })}
          </Typography.Text>
        )}
        <View className="flex-row justify-between">
          <Typography.Text weight="medium">
            {formatPrice(
              registryItem.product.price,
              registryItem.product.currencyCode,
            )}
          </Typography.Text>
          <Link
            href={{
              pathname: "/(protected)/registry/item/[id]",
              params: {
                id: registryItem.id,
                registryItem: JSON.stringify(registryItem),
              },
            }}
            asChild
          >
            <TouchableOpacity className="rounded-full bg-neutral-100 p-2">
              <PencilIcon size={18} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

export default RegistryItem;
