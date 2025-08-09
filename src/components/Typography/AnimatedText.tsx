import React from "react";
import { Animated } from "react-native";
import Text, { CustomTextProps } from "./Text"; // Import your custom Text component

// Extend CustomTextProps to support Animated styles
export type AnimatedTextProps = CustomTextProps & {
  animatedStyle?: any; // Add animated styles
  className?: string; // Support Tailwind classes
};

const AnimatedText = ({
  animatedStyle,
  className,
  style,
  ...props
}: AnimatedTextProps) => {
  return (
    <Animated.Text style={[animatedStyle, style]} className={className}>
      <Text {...props} />
    </Animated.Text>
  );
};

export default AnimatedText;
