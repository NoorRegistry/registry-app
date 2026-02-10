import { View } from "@/components/Themed";
import Typography from "@/components/Typography";
import { IProductCategory } from "@/types";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";

const SubCategoryCard = ({ item }: { item: IProductCategory }) => {
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
      <TouchableOpacity className="items-center w-20">
        <View className="bg-[#FAF7F6] rounded-xl w-20 h-24 items-center justify-center">
          <Image
            source={getImageUrl(item.logo)}
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
            }}
            contentFit="contain"
          />
        </View>
        <Typography.Text
          size="xs"
          weight="regular"
          className="text-center text-[#100E0E] mt-2"
          numberOfLines={2}
        >
          {getEnArName(item.nameEn, item.nameAr)}
        </Typography.Text>
      </TouchableOpacity>
    </Link>
  );
};

export default SubCategoryCard;
