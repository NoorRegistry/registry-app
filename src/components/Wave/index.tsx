import { Colors } from "@/constants/Colors";
import { View, useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

const Wave = ({ color }: { color?: string }) => {
  const colorScheme = useColorScheme();
  if (!color) {
    color = Colors[colorScheme ?? "light"].backgroundDark;
  }
  return (
    <View
      style={{
        height: 100,
        width: "100%",
        overflow: "hidden",
        backgroundColor: color,
      }}
    >
      <Svg
        height="100%"
        width="100%"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <Path
          fill="white"
          d="M0,120 C120,140 240,160 360,170 C480,180 600,160 720,150 C840,140 960,120 1080,110 C1200,100 1320,120 1440,140 L1440,320 L0,320 Z"
        />
      </Svg>
    </View>
  );
};

export default Wave;
