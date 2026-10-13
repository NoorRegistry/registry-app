import Typography from "@/components/Typography";
import React from "react";
import { View } from "react-native";

type CustomerAvatarProps = {
  initials: string;
  size?: "md" | "lg";
};

const CustomerAvatar = ({ initials, size = "md" }: CustomerAvatarProps) => {
  const isLarge = size === "lg";

  return (
    <View
      className={`items-center justify-center rounded-full bg-primary-200 ${
        isLarge ? "h-16 w-16" : "h-[54px] w-[54px]"
      }`}
    >
      <Typography.Text
        size={isLarge ? "2xl" : "xl"}
        weight="bold"
        className="text-center text-primary-700"
      >
        {initials}
      </Typography.Text>
    </View>
  );
};

export default CustomerAvatar;
