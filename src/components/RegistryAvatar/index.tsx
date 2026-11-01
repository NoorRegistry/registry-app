import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import Typography from "@/components/Typography";
import { BrandColors } from "@/constants/Colors";
import { getImageUrl } from "@/utils/helper";
import type { IRegistry } from "@/types";
import {
  registryImageSources,
  registryTypeIcon,
} from "@/utils/registry-type-icon";
import Feather from "@expo/vector-icons/Feather";

export default function RegistryAvatar({
  title,
  logo,
  size = 48,
  radius,
  category,
  backgroundColor = BrandColors.soft,
}: {
  title?: string | null;
  logo?: string | null;
  size?: number;
  radius?: number;
  category?: IRegistry["category"];
  backgroundColor?: string;
}) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const source = registryImageSources(logo, category)
    .map(getImageUrl)
    .find((path) => path && !failedSources.includes(path));
  const categorySource = [
    category?.registryBackground,
    category?.registryPlaceHolder,
  ]
    .map(getImageUrl)
    .includes(source ?? "");
  const initials = title?.trim().charAt(0).toLocaleUpperCase() || "R";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? size / 2,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {source ? (
        <Image
          key={source}
          source={source}
          recyclingKey={source}
          style={{ width: size, height: size }}
          contentFit={categorySource ? "contain" : "cover"}
          onError={() => setFailedSources((previous) => [...previous, source])}
        />
      ) : category ? (
        <Feather
          name={registryTypeIcon(category)}
          size={Math.max(20, size * 0.46)}
          color={BrandColors.deep}
        />
      ) : (
        <Typography.Text
          weight="bold"
          style={{
            color: BrandColors.deep,
            fontSize: Math.max(16, size * 0.32),
            lineHeight: Math.max(22, size * 0.42),
            includeFontPadding: false,
            textAlign: "center",
          }}
        >
          {initials}
        </Typography.Text>
      )}
    </View>
  );
}
