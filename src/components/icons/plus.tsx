import { Colors } from "@/constants/Colors";
import { SVGIconProps } from "@/types";
import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

export const PlusIcon = ({ size = 24, color, ...props }: SVGIconProps) => {
  const colorScheme = useColorScheme();
  if (!color) {
    color = Colors[colorScheme ?? "light"].text;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M6 12H12M12 12H18M12 12V18M12 12V6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
