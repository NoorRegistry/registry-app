import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ColorValue,
  Easing,
  Platform,
  View,
  useColorScheme,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ILoaderProps {
  /**
   * Color for the loading indicator
   * You can pass css-variables from theme as 'var(--variable)
   */
  color?: ColorValue;
  /**
   * Defines the speed in which the loading indicator finishes the circle
   * Defaults to `1000ms / 1 sec`
   */
  durationMs?: number;
  /**
   * The size of the Loader.
   * `large`: `24`
   * `default`: `20`
   * `small`: `16`
   * Defaults to `default`
   */
  size?: "large" | "small" | "default";
}

const LoadingSpinner = ({
  durationMs = 1000,
  size = "default",
  color,
}: ILoaderProps) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const height = size === "large" ? 24 : size === "default" ? 20 : 16;
  const circleColor = color ? color : Colors[colorScheme ?? "light"].tint;
  const strokeWidth = 2;

  useEffect(() => {
    // Looping animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1, // End of animation
        duration: durationMs, // Duration of one full spin (1000ms)
        easing: Easing.linear, // Smooth and continuous rotation
        useNativeDriver: Platform.OS !== "web",
      }),
    );
    rotate.start();
  }, [rotateAnim]);

  // Interpolating the animated value to rotate from 0 to 360 degrees
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const radius = (height - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const halfCircle = height / 2;

  return (
    <View>
      <Animated.View
        style={{
          transform: [{ rotate: rotation }],
        }}
      >
        <Svg height={height} width={height} viewBox={`0 0 ${height} ${height}`}>
          <Circle
            cx={halfCircle}
            cy={halfCircle}
            r={radius}
            stroke={circleColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={circumference / 4} // Control the dash length for spinning effect
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export const LoadingScreen = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <LoadingSpinner size="large" />
    </View>
  );
};

export default LoadingSpinner;
