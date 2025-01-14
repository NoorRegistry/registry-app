import { Colors } from "@/constants/Colors";
import { SVGIconProps } from "@/types";
import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

export const CloseIcon = ({ size = 24, color, ...props }: SVGIconProps) => {
  const colorScheme = useColorScheme();
  if (!color) {
    color = Colors[colorScheme ?? "light"].tabIconDefault;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
