import { View } from "@/components/Themed";
import Typography from "@/components/Typography";
import { ChevronRightMDIcon } from "@/components/icons/chevron_md";
import { IProductCategory } from "@/types";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Dimensions, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 16 - 8;

// Card component
const CategoryCard = ({ item }: { item: IProductCategory }) => {
  /* 16px per card for side padding and 8px as half of 16px for space in-between */
  return (
    <Link
      href={{
        pathname: "/(protected)/category/[id]",
        params: {
          id: item.id,
          children: Boolean(item.children).toString(),
        },
      }}
      asChild
    >
      <TouchableOpacity
        style={{ width: cardWidth }}
        className="bg-white rounded-xl items-center shadow shadow-neutral-300 mb-4"
      >
        <View className="w-full flex-1 rounded-t-xl">
          <Image
            source={getImageUrl(item.logo)}
            style={{
              flex: 1,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              width: cardWidth,
              height: cardWidth,
            }}
            contentFit="fill"
          />
        </View>
        <View className="flex-row items-center ps-3 pe-1 py-3 border-t w-full border-neutral-200 rounded-b-xl">
          <Typography.Text
            numberOfLines={1}
            ellipsizeMode="tail"
            weight="medium"
            size="sm"
            className=" text-gray-700 flex-1"
          >
            {getEnArName(item.nameEn, item.nameAr)}
          </Typography.Text>
          <ChevronRightMDIcon />
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default CategoryCard;
