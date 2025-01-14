import clsx from "clsx";
import { ReactNode } from "react";
import { View, ViewProps } from "react-native";

import Button, { TButtonSize } from "./Button";

export interface IRadioOption<T> {
  label: ReactNode;
  value: T;
}

interface IRadioGroupProps<T> extends ViewProps {
  options: IRadioOption<T>[];
  onChange: (value: T) => void;
  direction?: "vertical" | "horizontal";
  value: T;
  /**
   * Size of the button
   * Large: 20px
   * Default: 16px
   * Small: 12
   */
  size?: TButtonSize;
}

const Group = <T,>({
  options,
  onChange,
  direction = "horizontal",
  value,
  size,
  ...rest
}: IRadioGroupProps<T>) => {
  return (
    <View
      className={clsx("flex gap-5", direction === "horizontal" && "flex-row")}
      {...rest}
    >
      {options.map((item: IRadioOption<T>, index) => (
        <Button
          key={index}
          value={item.value}
          label={item.label}
          selectedValue={value}
          onChange={onChange}
          size={size}
        />
      ))}
    </View>
  );
};

export default Group;
