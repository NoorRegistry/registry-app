import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export default function CenterPin() {
  return (
    <View
      pointerEvents="none"
      testID="address-map-center-pin"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        marginLeft: -22,
        marginTop: -44,
      }}
    >
      <Svg width={44} height={44} viewBox="0 0 44 44">
        <Path
          d="M22 44C18 38 5 25 5 17a17 17 0 0 1 34 0c0 8-13 21-17 27Z"
          fill="#C78063"
        />
        <Circle cx={22} cy={17} r={6} fill="#fff" />
      </Svg>
    </View>
  );
}
