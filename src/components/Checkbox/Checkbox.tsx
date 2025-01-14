import { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import Typography from "../Typography";

export type TButtonSize = "default" | "large" | "small";
type TCheckboxSize = Exclude<TButtonSize, "small">;
type TCheckboxTheme = "green" | "white" | "default";

export const getCheckboxSize = (size: TCheckboxSize): string => {
  switch (size) {
    case "default":
      return "h-4 w-4";
    case "large":
      return "h-6 w-6";
  }
};

export const getCheckMarkSize = (size: TCheckboxSize): number => {
  switch (size) {
    case "default":
      return 12;
    case "large":
      return 20;
  }
};

export const getCheckBoxStyle = (
  theme: TCheckboxTheme,
  checked: boolean,
): string => {
  switch (theme) {
    case "green":
      return clsx(
        "border border-neutral-300 rounded-full",
        checked && "bg-primary-300 border-primary-300",
      );
    case "white":
      return clsx(
        "border border-white bg-transparent rounded-md",
        checked && "bg-white",
      );
    case "default":
      return "border border-neutral-300 rounded";
  }
};
interface ICheckbox<T> {
  label?: ReactNode;
  value: T;
  checked: boolean;
  size?: TCheckboxSize;
  theme?: TCheckboxTheme;
  onChange: (checked: boolean, value: T) => void;
}

const Checkbox = <T,>({
  label,
  value,
  checked,
  size = "default",
  theme = "default",
  onChange,
}: ICheckbox<T>) => {
  return (
    <Pressable
      className="flex flex-row items-center gap-2"
      onPress={() => {
        onChange(!checked, value);
      }}
    >
      <View
        className={clsx(
          "z-0 items-center justify-center",
          getCheckboxSize(size),
          getCheckBoxStyle(theme, checked),
        )}
      >
        {checked && (
          <MaterialCommunityIcons
            name={"check"}
            size={getCheckMarkSize(size)}
            color={theme === "green" ? "#fff" : "#000"}
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

export default Checkbox;
