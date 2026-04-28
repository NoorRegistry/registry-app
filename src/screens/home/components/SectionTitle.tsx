import Typography from "@/components/Typography";
import React from "react";
import { TextProps } from "react-native";

type SectionTitleProps = TextProps & {
  children: React.ReactNode;
};

export default function SectionTitle({ children, style }: SectionTitleProps) {
  return (
    <Typography.Text
      size="lg"
      weight="bold"
      style={[{ color: "#000000", lineHeight: 24 }, style]}
    >
      {children}
    </Typography.Text>
  );
}
