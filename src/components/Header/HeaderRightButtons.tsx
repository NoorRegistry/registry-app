import { Colors } from "@/constants/Colors";
import { useCart } from "@/hooks/useCart";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, useColorScheme } from "react-native";
import { IconButton } from "../Button";
import { CartIcon, SearchIcon } from "../icons";

function HeaderRightButtons() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const cart = useCart();
  return (
    <View className="flex-shrink-0 flex-row gap-2 items-center">
      <IconButton
        icon={<SearchIcon color={Colors[colorScheme ?? "light"].text} />}
        onPress={() => {
          router.push("/(protected)/registry");
        }}
      />
      <View>
        <IconButton
          accessibilityRole="button"
          accessibilityLabel={t("cart.viewCart")}
          icon={<CartIcon color={Colors[colorScheme ?? "light"].text} />}
          onPress={() => router.push("/cart")}
        />
        {!!cart.data?.itemCount && (
          <View
            pointerEvents="none"
            className="absolute -right-1 -top-1 min-w-[16px] h-4 rounded-full bg-primary-500 items-center justify-center px-0.5"
          >
            <View className="w-1.5 h-1.5 rounded-full bg-white" />
          </View>
        )}
      </View>
    </View>
  );
}

export default HeaderRightButtons;
