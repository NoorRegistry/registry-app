import Typography from "@/components/Typography";
import { BrandColors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

export default function CartButton({ testID }: { testID?: string }) {
  const { t } = useTranslation();
  const count = useCart().data?.itemCount ?? 0;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${t("cart.title")}${count ? `, ${count}` : ""}`}
      onPress={() => router.push("/cart")}
      style={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name="shopping-cart" size={23} color={BrandColors.ink} />
      {count > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 1,
            end: 0,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 3,
            borderRadius: 8,
            backgroundColor: BrandColors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography.Text
            allowFontScaling={false}
            style={{
              color: "white",
              fontSize: 10,
              lineHeight: 14,
              textAlign: "center",
            }}
          >
            {count > 99 ? "99+" : count}
          </Typography.Text>
        </View>
      )}
    </Pressable>
  );
}
