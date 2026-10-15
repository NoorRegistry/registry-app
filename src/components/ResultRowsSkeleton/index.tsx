import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/components/Skeleton";
import { BrandColors } from "@/constants/Colors";

const widths = ["64%", "48%", "72%", "56%", "62%"] as const;

export default function ResultRowsSkeleton({
  kind = "people",
  showAction = false,
}: {
  kind?: "people" | "stores";
  showAction?: boolean;
}) {
  const people = kind === "people";
  return (
    <Skeleton testID={`skeleton-${kind}`}>
      {widths.map((width, index) => (
        <View
          key={index}
          style={[
            styles.row,
            {
              marginHorizontal: people ? 22 : 20,
              paddingVertical: people ? 10 : 12,
            },
          ]}
        >
          <View
            style={[
              styles.placeholder,
              {
                width: people ? 52 : 58,
                height: people ? 52 : 58,
                borderRadius: people ? 26 : 10,
              },
            ]}
          />
          <View style={styles.identity}>
            <View style={[styles.placeholder, styles.title, { width }]} />
            {kind !== "stores" && (
              <View
                style={[styles.subtitle, { width: index % 2 ? "38%" : "46%" }]}
              />
            )}
          </View>
          {people && showAction && (
            <View style={[styles.placeholder, styles.action]} />
          )}
        </View>
      ))}
    </Skeleton>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 13 },
  placeholder: { backgroundColor: BrandColors.line },
  identity: { flex: 1, gap: 9 },
  title: { height: 12, borderRadius: 4 },
  subtitle: { height: 9, borderRadius: 3, backgroundColor: BrandColors.soft },
  action: { width: 78, height: 44, borderRadius: 10 },
});
