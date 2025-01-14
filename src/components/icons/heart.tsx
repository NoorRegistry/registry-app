import React from "react";
import Svg, { Path } from "react-native-svg";

export const HeartIcon = ({ width = 24, height = 24, color = "#ff008a" }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M12 7.69431C10 2.99988 3 3.49988 3 9.49991C3 15.4999 12 20.5001 12 20.5001C12 20.5001 21 15.4999 21 9.49991C21 3.49988 14 2.99988 12 7.69431Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
