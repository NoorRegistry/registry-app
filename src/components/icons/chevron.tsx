import { Colors } from "@/constants/Colors";
import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

export const ChevronRightIcon = ({
  width = 24,
  height = 24,
  color,
}: {
  color?: string;
  width?: number;
  height?: number;
}) => {
  const colorScheme = useColorScheme();
  if (!color) {
    color = Colors[colorScheme ?? "light"].text;
  }
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5L16 12L9 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
