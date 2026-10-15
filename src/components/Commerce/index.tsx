import Typography from "@/components/Typography";
import { CustomTextProps } from "@/components/Typography/Text";
import { BrandColors } from "@/constants/Colors";
import { formatPrice } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";

export function CommerceText(props: CustomTextProps) {
  // Native RTL mirroring turns "left" into leading alignment on both platforms.
  return (
    <Typography.Text
      {...props}
      style={[
        {
          color: BrandColors.ink,
          textAlign: "left",
        },
        props.style,
      ]}
    />
  );
}

export function MoneyText({
  amount,
  currency = "KWD",
  ...props
}: CustomTextProps & { amount: number; currency?: string }) {
  return (
    <CommerceText
      {...props}
      style={[
        {
          writingDirection: "ltr",
          textAlign: "right",
          flexShrink: 0,
        },
        props.style,
      ]}
    >
      {formatPrice(amount, currency)}
    </CommerceText>
  );
}

export function CommerceTopBar({
  title,
  onBack,
  action,
  onAction,
  count,
}: {
  title: string;
  onBack: () => void;
  action?: string;
  onAction?: () => void;
  count?: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.back")}
        onPress={onBack}
        style={styles.back}
      >
        <Ionicons
          name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"}
          size={22}
          color={BrandColors.ink}
        />
      </Pressable>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <CommerceText
          weight="bold"
          size="lg"
          numberOfLines={1}
          style={{ flexShrink: 1 }}
        >
          {title}
        </CommerceText>
        {count && (
          <CommerceText size="xs" style={{ color: BrandColors.muted }}>
            {count}
          </CommerceText>
        )}
      </View>
      {action && onAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={{ minHeight: 44, justifyContent: "center", paddingStart: 8 }}
        >
          <CommerceText
            weight="medium"
            size="sm"
            style={{ color: BrandColors.deep }}
          >
            {action}
          </CommerceText>
        </Pressable>
      )}
    </View>
  );
}

export function PriceSummary({
  subtotal,
  deliveryFee,
  total,
  currency = "KWD",
}: {
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency?: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 9 }}>
      {[
        [t("cart.subtotal"), subtotal],
        [t("checkout.delivery"), deliveryFee],
        [t("checkout.total"), total],
      ].map(([label, amount], index) => (
        <View
          key={String(label)}
          style={[
            styles.priceRow,
            index === 2 && {
              borderTopWidth: 1,
              borderTopColor: BrandColors.line,
              paddingTop: 12,
              marginTop: 2,
            },
          ]}
        >
          <CommerceText
            weight={index === 2 ? "bold" : "regular"}
            style={{
              flex: 1,
              color: index === 2 ? BrandColors.ink : BrandColors.muted,
            }}
          >
            {label}
          </CommerceText>
          <MoneyText
            amount={Number(amount)}
            currency={currency}
            weight={index === 2 ? "bold" : "medium"}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  back: { width: 36, minHeight: 44, justifyContent: "center" },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});
