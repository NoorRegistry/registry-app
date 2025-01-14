import React from "react";
import { Animated } from "react-native";
import Typography from "../Typography";

function AnimatedHeaderText({
  title,
  opacity,
}: {
  title: string;
  opacity: number | Animated.Value | Animated.AnimatedInterpolation<number>;
}) {
  return (
    <Typography.AnimatedText
      animatedStyle={{
        opacity,
      }}
      className="flex-1"
      weight="medium"
      size="base"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Typography.AnimatedText>
  );
}

export default AnimatedHeaderText;
