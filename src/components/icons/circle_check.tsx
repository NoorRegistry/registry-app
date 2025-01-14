import { Colors } from "@/constants/Colors";
import * as React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

export const CheckCircleIcon = ({
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
    color = Colors[colorScheme ?? "light"].tint;
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M15 10L11 14L9 12M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
