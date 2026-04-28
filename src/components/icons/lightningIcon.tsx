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
        d="M14.8638 2.05996C15.1404 2.17774 15.32 2.44935 15.32 2.75002V9.74821H19.25C19.5167 9.74821 19.7633 9.88984 19.8978 10.1202C20.0322 10.3505 20.0342 10.635 19.903 10.8672L19.4109 11.738C17.5448 15.0407 15.1649 18.0253 12.3606 20.5798L11.5651 21.3045C11.3455 21.5045 11.0286 21.5561 10.7569 21.4361C10.4853 21.316 10.31 21.047 10.31 20.75V13.8112H6.25C5.83579 13.8112 5.5 13.4754 5.5 13.0612C5.5 12.927 5.53523 12.8011 5.59693 12.6921C7.35572 9.44066 9.6075 6.48119 12.2722 3.91896L14.0502 2.20939C14.2669 2.001 14.5871 1.94218 14.8638 2.05996ZM7.53458 12.3112H11.06C11.4742 12.3112 11.81 12.6469 11.81 13.0612V19.0445C14.2286 16.759 16.3017 14.1327 17.9634 11.2482H14.57C14.1558 11.2482 13.82 10.9124 13.82 10.4982V4.51164L13.3119 5.00021C11.0611 7.16442 9.11782 9.62444 7.53458 12.3112Z"
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
};
