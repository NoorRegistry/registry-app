import React from "react";
import { Animated, useWindowDimensions } from "react-native";
import Typography from "../Typography";

function AnimatedHeaderText({
  title,
  opacity,
}: {
  title: string;
  opacity: number | Animated.Value | Animated.AnimatedInterpolation<number>;
}) {
  const { width } = useWindowDimensions();
  return (
    <Animated.View
      style={{
        opacity,
        width: Math.max(80, width - 180),
        justifyContent: "center",
      }}
    >
      <Typography.Text
        weight="medium"
        size="base"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ textAlignVertical: "center" }}
      >
        {title}
      </Typography.Text>
    </Animated.View>
  );
}
export default AnimatedHeaderText;
