import { Colors } from "@/constants/Colors";
import { SVGIconProps } from "@/types";
import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

export const RegistryIcon = ({
  width = 22,
  height = 22,
  color,
}: SVGIconProps) => {
  const colorScheme = useColorScheme();
  if (!color) {
    color = Colors[colorScheme ?? "light"].tabIconDefault;
  }
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5.5V8M12 5.5C12 4.11929 13.1193 3 14.5 3C15.8807 3 17 4.11929 17 5.5C17 6.88071 15.8807 8 14.5 8M12 5.5C12 4.11929 10.8807 3 9.5 3C8.11929 3 7 4.11929 7 5.5C7 6.88071 8.11929 8 9.5 8M12 8H14.5M12 8H9.5M12 8V14M14.5 8H17.8002C18.9203 8 19.4796 8 19.9074 8.21799C20.2837 8.40973 20.5905 8.71547 20.7822 9.0918C21 9.5192 21 10.079 21 11.1969V14M9.5 8H6.2002C5.08009 8 4.51962 8 4.0918 8.21799C3.71547 8.40973 3.40973 8.71547 3.21799 9.0918C3 9.51962 3 10.0801 3 11.2002V14M3 14V16.8002C3 17.9203 3 18.4801 3.21799 18.9079C3.40973 19.2842 3.71547 19.5905 4.0918 19.7822C4.5192 20 5.07899 20 6.19691 20H12M3 14H12M12 14V20M12 14H21M12 20H17.8031C18.921 20 19.48 20 19.9074 19.7822C20.2837 19.5905 20.5905 19.2842 20.7822 18.9079C21 18.4805 21 17.9215 21 16.8036V14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};