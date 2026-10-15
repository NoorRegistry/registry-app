import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import Typography from "@/components/Typography";
import { BrandColors } from "@/constants/Colors";
import { getImageUrl } from "@/utils/helper";

export default function RegistryAvatar({
  title,
  logo,
  size = 48,
}: {
  title?: string | null;
  logo?: string | null;
  size?: number;
}) {
  const source = getImageUrl(logo);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const initials = title?.trim().charAt(0).toLocaleUpperCase() || "R";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: BrandColors.soft,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {source && source !== failedSource ? (
        <Image
          key={source}
          source={source}
          recyclingKey={source}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => setFailedSource(source)}
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
