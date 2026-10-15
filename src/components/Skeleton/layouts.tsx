import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Skeleton, SkeletonBlock as Block } from ".";

export type CatalogSkeletonKind = "products" | "categories" | "stores";
function CatalogPlaceholders({
  kind = "products",
  horizontal = false,
  rows = 2,
  columns: customColumns,
}: {
  kind?: CatalogSkeletonKind;
  horizontal?: boolean;
  rows?: number;
  columns?: number;
}) {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const available = width - insets.left - insets.right - 32;
  const columns =
    customColumns ??
    (kind === "categories" ? (width >= 700 ? 5 : 3) : width >= 700 ? 3 : 2);
  const size = horizontal
    ? kind === "products"
      ? available / (width >= 390 ? 2.2 : 1.7)
      : 72
    : (available - (columns - 1) * 12) / columns;
  const products = kind === "products";
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        overflow: "hidden",
        gap: 12,
      }}
    >
      {Array.from({ length: horizontal ? 1 : rows }, (_, row) => (
        <View key={row} style={{ flexDirection: "row", gap: 12 }}>
          {Array.from({ length: horizontal ? 4 : columns }, (_, column) => (
            <View key={column} style={{ width: size }}>
              <Block
                style={{
                  width: size,
                  height: size,
                  borderRadius: products ? 12 : 16,
                }}
              />
              <View style={{ paddingTop: 10, paddingBottom: 12, gap: 4 }}>
                {products ? (
                  <>
                    <View
                      style={{
                        height: Math.ceil(17 * fontScale),
                        justifyContent: "center",
                      }}
                    >
                      <Block style={{ width: "45%", height: 9 }} />
                    </View>
                    <View
                      style={{
                        height: Math.ceil(40 * fontScale),
                        gap: 7,
                        paddingTop: 4,
                      }}
                    >
                      <Block style={{ width: "90%", height: 11 }} />
                      <Block
                        style={{
                          width: column % 2 ? "55%" : "72%",
                          height: 11,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        height: Math.ceil(20 * fontScale),
                        justifyContent: "center",
                      }}
                    >
                      <Block style={{ width: "48%", height: 13 }} />
                    </View>
                  </>
                ) : (
                  <Block
                    style={{ width: "75%", height: 10, alignSelf: "center" }}
                  />
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
export function CatalogSkeleton(
  props: Parameters<typeof CatalogPlaceholders>[0],
) {
  return (
    <Skeleton testID={`skeleton-${props.kind ?? "products"}`}>
      <CatalogPlaceholders {...props} />
    </Skeleton>
  );
}

export function ListSkeleton({
  kind = "notifications",
  rows = 4,
  inset = 0,
}: {
  kind?: "notifications" | "orders" | "addresses" | "registries";
  rows?: number;
  inset?: number;
}) {
  const image = kind === "registries";
  return (
    <Skeleton testID={`skeleton-${kind}`}>
      <View style={{ paddingHorizontal: inset }}>
        {Array.from({ length: rows }, (_, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              gap: 13,
              alignItems: "center",
              paddingVertical: image ? 14 : 20,
            }}
          >
            <Block
              style={{
                width: image ? 52 : 28,
                height: image ? 52 : 28,
                borderRadius: image ? 26 : 8,
              }}
            />
            <View style={{ flex: 1, gap: 10 }}>
              <Block style={{ width: index % 2 ? "68%" : "82%", height: 13 }} />
              <Block style={{ width: "55%", height: 10 }} />
              {kind === "addresses" && (
                <Block style={{ width: "70%", height: 10 }} />
              )}
            </View>
            {kind === "orders" && <Block style={{ width: 65, height: 13 }} />}
          </View>
        ))}
      </View>
    </Skeleton>
  );
}

function Lines({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <Block
          key={i}
          style={{ width: i % 2 ? "55%" : "83%", height: i === 0 ? 18 : 12 }}
        />
      ))}
    </View>
  );
}
function ItemRows() {
  return (
    <View style={{ gap: 22 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
        >
          <Block style={{ width: 68, height: 68, borderRadius: 10 }} />
          <View style={{ flex: 1 }}>
            <Lines count={2} />
          </View>
          <Block style={{ width: 62, height: 14 }} />
        </View>
      ))}
    </View>
  );
}
function Totals() {
  return (
    <View style={{ gap: 16 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          <Block
            style={{
              width: i === 2 ? "30%" : "40%",
              height: i === 2 ? 18 : 12,
            }}
          />
          <Block style={{ width: 76, height: i === 2 ? 18 : 12 }} />
        </View>
      ))}
    </View>
  );
}
function PersonPlaceholder({ request = false }: { request?: boolean }) {
  return (
    <View style={{ gap: 30, paddingTop: request ? 70 : 26 }}>
      <View style={{ alignItems: "center", gap: 14 }}>
        <Block style={{ width: 84, height: 84, borderRadius: 42 }} />
        <Block style={{ width: "48%", height: 22 }} />
        <Block style={{ width: "36%", height: 12 }} />
      </View>
      {request ? (
        <View style={{ gap: 12 }}>
          <Block style={{ height: 48, borderRadius: 12 }} />
          <Block style={{ height: 48, borderRadius: 12 }} />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 24 }}>
            <Block style={{ width: "42%", height: 16 }} />
            <Block style={{ width: "42%", height: 16 }} />
          </View>
          <ItemRows />
        </>
      )}
    </View>
  );
}
export type ScreenSkeletonKind =
  | "product"
  | "registry"
  | "order"
  | "checkout"
  | "confirmation"
  | "person"
  | "request"
  | "address"
  | "settings"
  | "guides"
  | "store";
export function ScreenSkeleton({ kind }: { kind: ScreenSkeletonKind }) {
  const { width } = useWindowDimensions();
  const body = (() => {
    switch (kind) {
      case "product":
        return (
          <>
            <Block style={{ height: Math.min(width, 360), borderRadius: 0 }} />
            <View style={{ padding: 20, gap: 24 }}>
              <Lines />
              <Block style={{ width: "30%", height: 22 }} />
              <Lines count={3} />
              <Block style={{ height: 48, borderRadius: 12 }} />
            </View>
          </>
        );
      case "person":
      case "request":
        return (
          <View style={{ paddingHorizontal: 22 }}>
            <PersonPlaceholder request={kind === "request"} />
          </View>
        );
      case "registry":
        return (
          <View style={{ padding: 20, gap: 26 }}>
            <View style={{ alignItems: "center", gap: 18 }}>
              <Block style={{ width: 84, height: 84, borderRadius: 42 }} />
              <Block style={{ width: "55%", height: 22 }} />
              <View style={{ flexDirection: "row", gap: 24 }}>
                {[0, 1, 2].map((i) => (
                  <Block key={i} style={{ width: 64, height: 12 }} />
                ))}
              </View>
            </View>
            <Block style={{ width: "25%", height: 16 }} />
            <ItemRows />
          </View>
        );
      case "address":
        return (
          <View style={{ gap: 22 }}>
            <Block style={{ height: 170, borderRadius: 0 }} />
            <View style={{ paddingHorizontal: 22, gap: 18 }}>
              <Lines count={2} />
              <View style={{ flexDirection: "row", gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <Block
                    key={i}
                    style={{ flex: 1, height: 36, borderRadius: 18 }}
                  />
                ))}
              </View>
              {[0, 1, 2, 3, 4].map((i) => (
                <Block key={i} style={{ height: 46, borderRadius: 9 }} />
              ))}
            </View>
          </View>
        );
      case "settings":
        return (
          <View
            style={{
              padding: 22,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Block style={{ width: "55%", height: 16 }} />
            <Block style={{ width: 46, height: 28, borderRadius: 14 }} />
          </View>
        );
      case "guides":
        return (
          <View style={{ padding: 16, gap: 24 }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ gap: 14 }}>
                <Block style={{ width: "42%", height: 16 }} />
                <Block style={{ height: (width - 32) / 2, borderRadius: 12 }} />
                <Lines count={2} />
              </View>
            ))}
          </View>
        );
      case "store":
        return (
          <>
            <View style={{ padding: 16, gap: 20 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Block style={{ width: 48, height: 48, borderRadius: 24 }} />
                <View style={{ flex: 1 }}>
                  <Lines count={2} />
                </View>
              </View>
              <Block style={{ height: 44, borderRadius: 12 }} />
              <View style={{ flexDirection: "row", gap: 20 }}>
                {[0, 1, 2].map((i) => (
                  <Block key={i} style={{ width: "24%", height: 14 }} />
                ))}
              </View>
            </View>
            <CatalogPlaceholders />
          </>
        );
      case "order":
        return (
          <View style={{ padding: 20, gap: 28 }}>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Block style={{ width: 48, height: 48 }} />
              <View style={{ flex: 1 }}>
                <Lines />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ gap: 10, alignItems: "center" }}>
                  <Block style={{ width: 24, height: 24, borderRadius: 12 }} />
                  <Block style={{ width: 48, height: 9 }} />
                </View>
              ))}
            </View>
            <ItemRows />
            <Lines count={3} />
            <Totals />
          </View>
        );
      case "checkout":
        return (
          <View style={{ padding: 22, gap: 28 }}>
            <Lines />
            <Block style={{ height: 50, borderRadius: 10 }} />
            <ItemRows />
            <Totals />
          </View>
        );
      case "confirmation":
        return (
          <View style={{ paddingVertical: 20, gap: 28 }}>
            <Lines />
            <Lines count={2} />
            <Totals />
          </View>
        );
    }
  })();
  return (
    <Skeleton
      testID={`skeleton-${kind}`}
      style={
        kind === "confirmation" ? undefined : { flex: 1, overflow: "hidden" }
      }
    >
      {body}
    </Skeleton>
  );
}
