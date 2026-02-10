import { Colors } from "@/constants/Colors";
import { SVGIconProps } from "@/types";
import * as React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

export const LightningIcon = ({ size = 24, color, ...props }: SVGIconProps) => {
  const colorScheme = useColorScheme();
  if (!color) {
    color = Colors[colorScheme ?? "light"].text;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M13 2L4 14H11L9 22L20 8H13Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
};
