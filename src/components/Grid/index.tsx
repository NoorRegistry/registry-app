import { ReactNode, useCallback, useState } from "react";
import { LayoutChangeEvent, View, useWindowDimensions } from "react-native";
import { gridItemWidth } from "./layout";

export function useGridLayout(columns: number, padding = 16, gap = 12) {
  const { width, scale } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setMeasuredWidth(event.nativeEvent.layout.width);
  }, []);
  const containerWidth = measuredWidth || width;
  return {
    onLayout,
    containerWidth,
    itemWidth: gridItemWidth(containerWidth, columns, padding, gap, scale),
  };
}

export default function Grid<T>({
  data,
  columns,
  keyExtractor,
  renderItem,
  padding = 0,
  gap = 12,
}: {
  data: readonly T[];
  columns: number;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, width: number) => ReactNode;
  padding?: number;
  gap?: number;
}) {
  const { onLayout, itemWidth } = useGridLayout(columns, padding, gap);
  const rows = Array.from(
    { length: Math.ceil(data.length / columns) },
    (_, row) => data.slice(row * columns, (row + 1) * columns),
  );
  return (
    <View onLayout={onLayout} style={{ paddingHorizontal: padding, gap }}>
      {rows.map((row) => (
        <View key={keyExtractor(row[0])} style={{ flexDirection: "row", gap }}>
          {Array.from({ length: columns }, (_, column) => (
            <View
              key={
                column < row.length
                  ? keyExtractor(row[column])
                  : `empty-${column}`
              }
              style={{ flex: 1, minWidth: 0 }}
            >
              {column < row.length && renderItem(row[column], itemWidth)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
