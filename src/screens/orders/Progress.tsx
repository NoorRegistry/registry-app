import { CommerceText } from "@/components/Commerce";
import { BrandColors } from "@/constants/Colors";
import { OrderStatus } from "@/services/orders.service";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const steps: Exclude<OrderStatus, "CANCELLED">[] = [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
];
export default function OrderProgress({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  if (status === "CANCELLED") return null;
  const current = steps.indexOf(status);
  return (
    <View
      testID="order-progress"
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: 4,
        now: current + 1,
        text: t(`orders.steps.${status}`),
      }}
      style={{ paddingTop: 22, paddingBottom: 14 }}
    >
      <View
        style={{
          position: "absolute",
          top: 36,
          start: "12.5%",
          end: "12.5%",
          height: 2,
          backgroundColor: BrandColors.line,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 36,
          start: "12.5%",
          width: `${current * 25}%`,
          height: 2,
          backgroundColor: BrandColors.primary,
        }}
      />
      <View style={{ flexDirection: "row" }}>
        {steps.map((step, index) => (
          <View key={step} style={{ flex: 1, alignItems: "center" }}>
            <View
              testID={`order-step-${step}`}
              accessibilityLabel={t(`orders.steps.${step}`)}
              accessibilityState={{ selected: current === index }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: index > current ? 1.5 : 0,
                borderColor: "#CDC5C1",
                backgroundColor:
                  index <= current ? BrandColors.primary : "white",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {index <= current && (
                <Ionicons name="checkmark" color="white" size={18} />
              )}
            </View>
            <CommerceText
              size="xs"
              style={{
                textAlign: "center",
                color: index === current ? BrandColors.deep : BrandColors.muted,
                marginTop: 8,
                paddingHorizontal: 2,
              }}
            >
              {t(`orders.steps.${step}`)}
            </CommerceText>
          </View>
        ))}
      </View>
    </View>
  );
}
