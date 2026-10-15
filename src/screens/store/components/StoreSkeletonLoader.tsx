import { BrandColors } from "@/constants/Colors";
import { View, useWindowDimensions } from "react-native";
export default function StoreSkeletonLoader() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 44) / 2;
  return (
    <View style={{ padding: 16, gap: 18 }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: BrandColors.soft,
          }}
        />
        <View style={{ gap: 8 }}>
          <View
            style={{
              width: 140,
              height: 16,
              borderRadius: 4,
              backgroundColor: BrandColors.soft,
            }}
          />
          <View
            style={{
              width: 100,
              height: 10,
              borderRadius: 4,
              backgroundColor: BrandColors.soft,
            }}
          />
        </View>
      </View>
      <View
        style={{
          height: 44,
          backgroundColor: BrandColors.soft,
          borderRadius: 12,
        }}
      />
      {[0, 1].map((row) => (
        <View
          key={row}
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          {[0, 1].map((column) => (
            <View key={column} style={{ width: cardWidth, gap: 10 }}>
              <View
                style={{
                  height: cardWidth,
                  borderRadius: 8,
                  backgroundColor: BrandColors.soft,
                }}
              />
              <View
                style={{
                  width: "80%",
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: BrandColors.soft,
                }}
              />
              <View
                style={{
                  width: "45%",
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: BrandColors.soft,
                }}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
