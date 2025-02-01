import {
  ColorSchemeName,
  View,
  useColorScheme,
  type ViewProps,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useThemeVariables } from "@/hooks/useThemeVariables";
import {
  ThemeProvider as RNThemeProvider,
  Theme,
} from "@react-navigation/native";
import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

const returnThemeVariables = (
  colorSchene: ColorSchemeName,
  language: string,
) => {
  const fontPrefix = language === "en" ? "Poppins" : "Tajawal";
  const fonts: Theme["fonts"] = {
    regular: {
      fontFamily: `${fontPrefix}regular`,
      fontWeight: "normal",
    },
    medium: {
      fontFamily: `${fontPrefix}medium`,
      fontWeight: "500",
    },
    bold: {
      fontFamily: `${fontPrefix}bold`,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: `${fontPrefix}bold`,
      fontWeight: "700",
    },
  };
  const colors: Theme["colors"] = {
    background: Colors[colorSchene ?? "light"].background,
    border: "rgb(216, 216, 216)",
    card: "rgb(255, 255, 255)",
    notification: "rgb(255, 59, 48)",
    primary: Colors[colorSchene ?? "light"].tint,
    text: Colors[colorSchene ?? "light"].text,
  };
  const LightTheme: Theme = {
    colors,
    dark: false,
    fonts,
  };

  const DarkTheme: Theme = {
    colors,
    dark: true,
    fonts,
  };
  return colorSchene === "dark" ? DarkTheme : LightTheme;
};

const ThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useThemeVariables();
  const colorScheme = useColorScheme();
  const { i18n } = useTranslation();

  return (
    <RNThemeProvider value={returnThemeVariables(colorScheme, i18n.language)}>
      <View style={theme} className="flex-1">
        {children}
      </View>
    </RNThemeProvider>
  );
};

export default ThemeProvider;
