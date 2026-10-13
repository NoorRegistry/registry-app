import { BrandColors } from "@/constants/Colors";
import Typography from "@/components/Typography";
import { useCart } from "@/hooks/useCart";
import { useCartAddedAnimation } from "@/hooks/useCartAddedAnimation";
import { formatPrice } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CartBar({
  placement = "tabs",
}: {
  placement?: "tabs" | "screen";
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const cart = useCart();
  const { barStyle, iconStyle } = useCartAddedAnimation(cart.data?.itemCount);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (
    keyboardVisible ||
    (placement === "tabs" && !["/", "/shop", "/search"].includes(pathname)) ||
    !cart.data?.itemCount
  ) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: placement === "tabs" ? 58 + insets.bottom : 16,
        },
        barStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("cart.viewCart")}
        onPress={() => router.push("/cart")}
        style={{
          minHeight: 54,
          borderRadius: 15,
          backgroundColor: BrandColors.primary,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          gap: 12,
          shadowColor: "#000",
          shadowOpacity: 0.14,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
          elevation: 5,
        }}
      >
        <Animated.View style={iconStyle}>
          <Ionicons name="bag-outline" size={21} color="#fff" />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Typography.Text weight="medium" style={{ color: "#fff" }}>
            {t("cart.itemCount", { count: cart.data.itemCount })} ·{" "}
            {formatPrice(cart.data.subtotal, cart.data.currencyCode)}
          </Typography.Text>
        </View>
        <Typography.Text weight="medium" style={{ color: "#fff" }}>
          {t("cart.viewCart")}
        </Typography.Text>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}
