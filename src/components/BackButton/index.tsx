import { Colors } from "@/constants/Colors";
import clsx from "clsx";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, useColorScheme } from "react-native";
import { ArrowLeftIcon } from "../icons/arrow_left_lg";

type BackButtonProps = {
  size?: number; // Icon size
  color?: string; // Icon color
  filled?: boolean; // Icon fill
};

const BackButton = ({ size = 24, color, filled = false }: BackButtonProps) => {
  const colorScheme = useColorScheme();
  if (!color) {
    color = Colors[colorScheme ?? "light"].text;
  }

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate("/");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={clsx(
        filled &&
          "bg-white rounded-full w-10 h-10 p-0 items-center justify-center",
        !filled && "ps-2 pe-3 py-1 -ms-2",
      )}
    >
      <ArrowLeftIcon width={size} height={size} color={color} />
    </TouchableOpacity>
  );
};

export default BackButton;
