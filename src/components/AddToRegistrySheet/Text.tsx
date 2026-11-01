import { textFontFamily } from "@/components/Typography/metrics";
import { RegistryPickerColors } from "@/constants/RegistryPicker";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextProps } from "react-native";

// Use native text styles so the compact mockup sizes remain consistent on web
// and native, without the app's default text utility classes overriding them.
export default function PickerText({
  weight = "regular",
  style,
  children,
  ...props
}: TextProps & { weight?: "regular" | "medium" }) {
  const { i18n } = useTranslation();
  const fontSize = StyleSheet.flatten(style)?.fontSize ?? 14;
  return (
    <Text
      {...props}
      style={[
        {
          color: RegistryPickerColors.ink,
          fontSize,
          fontFamily: textFontFamily(weight, i18n.language, children),
          lineHeight: Math.ceil(fontSize * 1.4),
          includeFontPadding: false,
          writingDirection: i18n.dir() === "rtl" ? "rtl" : "ltr",
          textAlign: "left",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
