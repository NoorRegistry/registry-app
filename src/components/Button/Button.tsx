import clsx from "clsx";
import React, { ReactNode } from "react";
import { Platform, Pressable, PressableProps } from "react-native";

import LoadingSpinner from "../Loader/customLoader";

import Typography from "@/components/Typography";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";

interface IButtonProps extends Omit<PressableProps, "children"> {
  title: ReactNode;
  style?: object;
  /**
   * Use this property to make the background transparent.
   * Used generally on dark filled backgrounds
   * Defaults to false
   */
  ghost?: boolean;
  /**
   * Use this property to make the button fully rounded.
   * Defaults to true
   */
  rounded?: boolean;
  /**
   * Use this property to show a loading indicator in button.
   * This will make the button disabled
   * Defaults to false
   */
  loading?: boolean;
  /**
   * The size of the button.
   * `large`: `56px`
   * `default`: `36px`
   * `small`: `28px`
   * Defaults to `default`
   */
  size?: "large" | "small" | "default";
  /**
   * Defines the type of the button
   * `primary` defines solid filled background
   * `default` defines outlined button with white background
   * Defaults to `default`
   */
  type?: "primary" | "default" | "text" | "hover";
  /**
   * Class name to apply to button label (Text)
   */
  labelClass?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export default function Button(props: IButtonProps) {
  const {
    onPress,
    title,
    size = "default",
    type = "default",
    ghost = false,
    rounded = true,
    loading = false,
    style,
    className,
    disabled = false,
    labelClass = "",
    iconLeft,
    iconRight,
    ...rest
  } = props;
  const { i18n } = useTranslation();

  return (
    <Pressable
      style={[style]}
      className={clsx(
        "group flex flex-row items-center justify-center gap-3",
        Platform.OS === "web" && "transition-colors",
        "px-6",
        getHeight(size),
        getButtonColorSettings(type, ghost),
        (disabled || loading) && "opacity-65",
        rounded ? "rounded-full" : "rounded-lg",
        className,
      )}
      disabled={disabled || loading}
      onPress={onPress}
      {...rest}
    >
      {loading && (
        <LoadingSpinner size={size} color={getLoaderColor(type, ghost)} />
      )}
      {iconLeft && iconLeft}
      <Typography.Text
        weight="bold"
        className={clsx(
          "uppercase",
          getTextColorSettings(type, ghost),
          labelClass,
          i18n.language === "ar" && "mt-1",
        )}
      >
        {title}
      </Typography.Text>
      {iconRight && iconRight}
    </Pressable>
  );
}

const getHeight = (size: IButtonProps["size"]): string => {
  let classes = "";
  switch (size) {
    case "default":
      classes = "h-9";
      break;
    case "large":
      classes = "h-14";
      break;
    case "small":
      classes = "h-7";
      break;

    default:
      break;
  }
  return classes;
};

const getButtonColorSettings = (
  type: IButtonProps["type"],
  ghost: IButtonProps["ghost"],
): string => {
  let classes = "";
  switch (type) {
    case "default":
      classes = clsx(
        "border border-primary-500 hover:border-primary-700",
        ghost
          ? "bg-transparent"
          : "bg-white hover:bg-primary-700 active:bg-primary-700",
      );
      break;
    case "primary":
      classes = clsx(
        "border border-primary-500 hover:border-primary-700",
        ghost ? "bg-transparent" : "bg-primary-500 hover:bg-primary-700",
      );
      break;
    case "text":
      classes = clsx("bg-transparent group-hover:bg-neutral-100");
      break;
    case "hover":
      classes = clsx("bg-primary-500 border border-primary-500");
      break;
    default:
      break;
  }
  return classes;
};

const getTextColorSettings = (
  type: IButtonProps["type"],
  ghost: IButtonProps["ghost"],
): string => {
  let classes = "";
  switch (type) {
    case "default":
      classes = clsx(
        "text-primary-500 group-hover:text-white group-active:text-white",
      );
      break;
    case "primary":
      classes = clsx(
        ghost ? "text-primary-500 group-hover:text-primary-700" : "text-white",
      );
      break;
    case "text":
      classes = clsx("text-primary-500 group-hover:text-primary-700");
      break;
    case "hover":
      classes = clsx("text-white");
      break;
    default:
      break;
  }
  return classes;
};

const getLoaderColor = (
  type: IButtonProps["type"],
  ghost: IButtonProps["ghost"],
): string => {
  const primary500 = Colors.light.tint;
  let colorVariable = "";
  switch (type) {
    case "default":
      colorVariable = primary500;
      break;
    case "primary":
      colorVariable = ghost ? primary500 : "#ffffff";

      break;
    case "text":
      colorVariable = primary500;
      break;
    case "hover":
      colorVariable = "#ffffff";
      break;
    default:
      break;
  }
  return colorVariable;
};
