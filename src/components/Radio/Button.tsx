import clsx from "clsx";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

import Typography from "../Typography";

export type TButtonSize = "small" | "default" | "large";

export const getButtonSize = (size: TButtonSize): string => {
  switch (size) {
    case "default":
      return "h-4 w-4";
    case "small":
      return "h-3 w-3";
    case "large":
      return "h-5 w-5";
  }
};

export const getSelectedButtonSize = (size: TButtonSize): string => {
  switch (size) {
    case "default":
      return "h-2 w-2";
    case "small":
      return "h-1.5 w-1.5";
    case "large":
      return "h-2.5 w-2.5";
  }
};

interface IRadio<T> {
  label?: ReactNode;
  value: T;
  selectedValue: T;
  onChange: (value: T) => void;
  /**
   * Size of the button
   * Large: 20px
   * Default: 16px
   * Small: 12
   */
  size?: TButtonSize;
}

const Radio = <T,>({
  value,
  onChange,
  label,
  selectedValue,
  size = "default",
}: IRadio<T>) => {
  return (
    <Pressable
      className="flex flex-row items-center gap-2"
      onPress={() => {
        onChange(value);
      }}
    >
      <View
        className={clsx(
          "z-0 items-center justify-center rounded-full border-2",
          getButtonSize(size),
          value === selectedValue ? "border-primary-500" : "border-neutral-500",
        )}
      >
        {value === selectedValue && (
          <View
            className={clsx(
              "bg-primary-500 rounded-full",
              getSelectedButtonSize(size),
            )}
          />
        )}
      </View>
      <View>
        {label &&
          (typeof label === "string" ? (
            <Typography.Text>{label}</Typography.Text>
          ) : (
            label
          ))}
      </View>
    </Pressable>
  );
};

export default Radio;
