import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  Text as DefaultText,
  StyleProp,
  StyleSheet,
  TextStyle,
  type TextProps,
} from "react-native";

export interface IText {
  /**
   * The font size of Text.
   * `xs`: `12`
   * `sm`: `14`
   * `base`: `16`
   * `lg`: `18`
   * `xl`: `20`
   * Defaults to `sm:14`
   */
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
  /**
   * This allows to set type of the text
   * @type {string}
   * @default 'default'
   */
  type?:
    | "default"
    | "secondary"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "complementary";
  weight?: "extralight" | "light" | "regular" | "medium" | "bold";
  forceArabic?: boolean;
}

export type CustomTextProps = IText & TextProps;

const getFontFamily = (weight: IText["weight"], language: string) => {
  return language === "en" ? `Poppins${weight}` : `Tajawal${weight}`;
};

const hasTextAlignClass = (className?: string) =>
  /\b!?text-(left|right|center|justify|start|end)\b/.test(className ?? "");

const hasTextAlignStyle = (style: CustomTextProps["style"]) => {
  if (!style) return false;

  return Boolean(StyleSheet.flatten(style)?.textAlign);
};

const Text = ({
  size = "sm",
  type = "default",
  weight = "regular",
  forceArabic = false,
  children,
  className,
  selectable = true,
  style,
  ...otherProps
}: CustomTextProps) => {
  const { i18n } = useTranslation();
  const language = forceArabic ? "ar" : i18n.language;
  const isRTL = i18n.dir(language) === "rtl";
  const hasExplicitTextAlign =
    hasTextAlignClass(className) || hasTextAlignStyle(style);

  const classes = clsx(
    getTextColor(type),
    getFontSize(size),
    getFontWeight(weight),
    className ?? "",
    selectable && "select-auto",
  );

  const fontfamilyStyle: StyleProp<TextStyle> = {
    fontFamily: getFontFamily(weight, language),
    writingDirection: isRTL ? "rtl" : "ltr",
  };

  const textAlignmentStyle: StyleProp<TextStyle> = hasExplicitTextAlign
    ? undefined
    : {
        textAlign: "left",
      };

  return (
    <DefaultText
      style={[fontfamilyStyle, style, textAlignmentStyle]}
      className={classes}
      {...otherProps}
    >
      {children}
    </DefaultText>
  );
};

export default Text;

function getFontSize(size: IText["size"]): string {
  let fontSize = "";
  switch (size) {
    case "xs":
      fontSize = "text-xs";
      break;
    case "sm":
      fontSize = "text-sm";
      break;
    case "base":
      fontSize = "text-base";
      break;
    case "lg":
      fontSize = "text-lg";
      break;
    case "xl":
      fontSize = "text-xl";
      break;
    case "2xl":
      fontSize = "text-2xl";
      break;
  }
  return fontSize;
}

function getFontWeight(weight: IText["weight"]): string {
  let fontWeight = "";
  switch (weight) {
    case "extralight":
      fontWeight = "font-extralight";
      break;
    case "light":
      fontWeight = "font-light";
      break;
    case "regular":
      fontWeight = "font-normal";
      break;
    case "medium":
      fontWeight = "font-medium";
      break;
    case "bold":
      fontWeight = "font-bold";
      break;
  }
  return fontWeight;
}

function getTextColor(type: IText["type"]): string {
  let fontColor = "";
  switch (type) {
    case "secondary":
      fontColor = "text-neutral-600";
      break;
    case "primary":
      fontColor = "text-primary-500";
      break;
    case "success":
      fontColor = "text-success";
      break;
    case "danger":
      fontColor = "text-danger";
      break;
    case "warning":
      fontColor = "text-warning";
      break;
    case "default":
      fontColor = "text-black";
      break;
    case "complementary":
      fontColor = "text-complementary";
      break;
  }
  return fontColor;
}
