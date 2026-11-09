import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import { Order } from "@/services/orders.service";
import { getUserSub } from "@/utils/helper";
import { registryOrderGifts } from "@/utils/registry-purchase-context";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import RegistryOrderPurchaseSheet, {
  RegistryOrderPurchaseSheetHandle,
} from "./RegistryOrderPurchaseSheet";
import { orderRegistryGifts } from "./registry-purchases";

export default function RegistryPurchasePrompt({
  order,
  autoPresent = true,
}: {
  order: Order;
  autoPresent?: boolean;
}) {
  const { t } = useTranslation();
  const userId = getUserSub();
  const sheet = useRef<RegistryOrderPurchaseSheetHandle>(null);
  const presented = useRef(false);
  const [gifts, setGifts] = useState(() =>
    registryOrderGifts(userId, order.id),
  );
  const [remaining, setRemaining] = useState(
    () => orderRegistryGifts(order, gifts).length,
  );
  useFocusEffect(
    useCallback(() => {
      const pending = registryOrderGifts(userId, order.id);
      setGifts(pending);
      setRemaining(orderRegistryGifts(order, pending).length);
    }, [userId, order]),
  );
  const matching = orderRegistryGifts(order, gifts);
  useEffect(() => {
    if (autoPresent && matching.length && !presented.current) {
      presented.current = true;
      sheet.current?.present();
    }
  }, [autoPresent, matching.length]);
  if (!matching.length) return null;
  return (
    <View testID="registry-purchase-prompt" style={{ paddingVertical: 12 }}>
      <Pressable
        testID="order-registry-open"
        accessibilityRole="button"
        onPress={() => sheet.current?.present()}
        style={{
          minHeight: 44,
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather
          name={remaining ? "gift" : "check-circle"}
          size={18}
          color={remaining ? C.deep : "#408467"}
        />
        <CommerceText
          size="sm"
          weight="medium"
          style={{ color: remaining ? C.deep : "#408467" }}
        >
          {remaining
            ? t("registry.updateRegistries")
            : t("registry.purchaseRecorded")}
        </CommerceText>
      </Pressable>
      <RegistryOrderPurchaseSheet
        key={`${userId}:${order.id}`}
        ref={sheet}
        order={order}
        gifts={gifts}
        onRemainingChange={setRemaining}
      />
    </View>
  );
}
