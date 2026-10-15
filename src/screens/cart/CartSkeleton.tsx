import { Skeleton, SkeletonBlock as Placeholder } from "@/components/Skeleton";
import { CommerceText } from "@/components/Commerce";
import { BrandColors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
function SummaryRows({ showLabels = false }: { showLabels?: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 9 }}>
      {(["cart.subtotal", "checkout.delivery", "checkout.total"] as const).map(
        (label, index) => (
          <View
            key={label}
            style={[styles.priceRow, index === 2 && styles.totalRow]}
          >
            {showLabels ? (
              <CommerceText
                weight={index === 2 ? "bold" : "regular"}
                style={{
                  flex: 1,
                  color: index === 2 ? BrandColors.ink : BrandColors.muted,
                }}
              >
                {t(label)}
              </CommerceText>
            ) : (
              <Placeholder style={{ width: index === 1 ? "30%" : "24%" }} />
            )}
            <Placeholder style={{ width: 76 }} />
          </View>
        ),
      )}
    </View>
  );
}

export function CartSummarySkeleton() {
  return (
    <Skeleton testID="cart-summary-skeleton">
      <SummaryRows showLabels />
    </Skeleton>
  );
}

export function CartTotalSkeleton() {
  return (
    <Skeleton testID="cart-total-skeleton">
      <Placeholder style={{ width: 92, height: 20 }} />
    </Skeleton>
  );
}

export default function CartSkeleton() {
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale > 1.15;
  return (
    <Skeleton testID="cart-skeleton" style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {(["75%", "90%", "65%"] as const).map((titleWidth, index) => (
          <View
            key={titleWidth}
            style={[styles.row, index < 2 && styles.divider]}
          >
            <View style={styles.productRow}>
              <Placeholder style={styles.image} />
              <View style={{ flex: 1, minWidth: 0, gap: 7 }}>
                <Placeholder style={{ width: "45%", height: 10 }} />
                <Placeholder style={{ width: titleWidth, height: 16 }} />
                <Placeholder style={{ width: "40%" }} />
              </View>
              {!compact && <Placeholder style={styles.quantity} />}
            </View>
            {compact && (
              <Placeholder
                style={{
                  ...styles.quantity,
                  alignSelf: "flex-end",
                  marginTop: 10,
                }}
              />
            )}
          </View>
        ))}
        <View style={{ paddingTop: 20, gap: 16 }}>
          <Placeholder style={{ width: "40%", height: 20 }} />
          <SummaryRows />
          <View style={{ minHeight: 44, justifyContent: "center" }}>
            <Placeholder style={{ width: "32%" }} />
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={{ flex: 1, gap: 6 }}>
          <Placeholder style={{ width: 44, height: 10 }} />
          <Placeholder style={{ width: 92, height: 20 }} />
        </View>
        <Placeholder style={{ width: "45%", height: 48, borderRadius: 11 }} />
      </View>
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  row: { paddingVertical: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: BrandColors.line },
  productRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  image: { width: 68, height: 68, borderRadius: 9 },
  quantity: { width: 92, height: 42, borderRadius: 9 },
  priceRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: BrandColors.line,
    paddingTop: 12,
    marginTop: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: BrandColors.line,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
