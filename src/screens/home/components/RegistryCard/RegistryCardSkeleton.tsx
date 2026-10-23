import { Skeleton, SkeletonBlock } from "@/components/Skeleton";
import { View } from "react-native";

export default function RegistrySkeleton() {
  return (
    <Skeleton testID="home-registry-skeleton" style={{ paddingVertical: 0 }}>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <SkeletonBlock style={{ flex: 1, height: 88, borderRadius: 8 }} />
        <SkeletonBlock style={{ flex: 1, height: 88, borderRadius: 8 }} />
      </View>
      <View
        style={{
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <SkeletonBlock style={{ width: 62, height: 62, borderRadius: 31 }} />
        <View style={{ flex: 1, gap: 10 }}>
          <SkeletonBlock style={{ width: "58%", height: 16 }} />
          <SkeletonBlock style={{ width: "80%", height: 12 }} />
        </View>
      </View>
    </Skeleton>
  );
}
