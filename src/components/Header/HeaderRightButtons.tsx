import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import React from "react";
import { View, useColorScheme } from "react-native";
import { IconButton } from "../Button";
import { CartIcon, SearchIcon } from "../icons";
import { UserIcon } from "../icons/user";

function HeaderRightButtons() {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-shrink-0 flex-row gap-2 items-center">
      <IconButton
        icon={<SearchIcon color={Colors[colorScheme ?? "light"].text} />}
        onPress={() => {
          router.push("/(protected)/registry");
        }}
      />
      <IconButton
        icon={<CartIcon color={Colors[colorScheme ?? "light"].text} />}
        onPress={() => {
          router.push("/(protected)/registry");
        }}
      />
      <IconButton
        icon={<UserIcon color={Colors[colorScheme ?? "light"].text} />}
        onPress={() => {
          router.push("/(protected)/profile");
        }}
      />
    </View>
  );
}

export default HeaderRightButtons;
