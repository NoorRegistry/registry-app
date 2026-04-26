import Typography from "@/components/Typography";
import { IGuide } from "@/types";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { default as React } from "react";
import { Dimensions, Platform, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = width - 32;

function GuideCard({
  guide,
  width: customWidth,
}: {
  guide: IGuide;
  width?: number;
}) {
  const finalWidth = customWidth || cardWidth;

  return (
    <TouchableOpacity
      style={{ width: finalWidth }}
      onPress={(e) => {
        if (Platform.OS !== "web") {
          // Prevent the default behavior of linking to the default browser on native.
          e.preventDefault();
          // Open the link in an in-app browser.
          WebBrowser.openBrowserAsync(
            `${process.env.EXPO_PUBLIC_GUIDES_URL}/${guide.url}` as string,
            {
              enableBarCollapsing: true,
              showTitle: true,
              presentationStyle: WebBrowser.WebBrowserPresentationStyle.POPOVER,
            },
          );
        }
      }}
    >
      <View className="mt-6 w-full rounded-2xl bg-white shadow shadow-neutral-200">
        <Image
          source={getImageUrl(guide.bannerImage)}
          style={{
            width: "100%",
            height: finalWidth / 2,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          contentFit="cover"
        />
        <View className="p-4 border-t border-neutral-100 rounded-b-2xl">
          <Typography.Text size="base" weight="medium" className="w-full">
            {getEnArName(guide.nameEn, guide.nameAr)}
          </Typography.Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default GuideCard;
