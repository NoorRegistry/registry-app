/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#CF8169";
const tintColorDark = "#CF8169";

const lightColors = {
  text: "#212121",
  background: "#FEFDFD",
  tint: tintColorLight,
  tintComplementary: "#b8450b",
  icon: "#687076",
  tabIconDefault: "#687076",
  tabIconSelected: tintColorLight,
  placeholderTextColor: "#9CA3AF",
  playerProgressSliderBackground: "#DDD7FC",
  dotsColor: "#FFFFFF",
  dotsColorActive: "#004b3c",
  backgroundDark: "#F5F5F5",
  neutral300: "#d1d5db",
};

const darkColors = {
  text: "#212121",
  background: "#FEFDFD",
  tint: tintColorDark,
  tintComplementary: "#b8450b",
  icon: "#687076",
  tabIconDefault: "#687076",
  tabIconSelected: tintColorDark,
  placeholderTextColor: "#9CA3AF",
  playerProgressSliderBackground: "#DDD7FC",
  dotsColor: "#FFFFFF",
  dotsColorActive: "#004b3c",
  backgroundDark: "#F5F5F5",
  neutral300: "#d1d5db",
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
  unspecified: lightColors,
};
