import clsx from "clsx";
import { ReactNode } from "react";
import { View, ViewProps } from "react-native";

import Button from "./Checkbox";

export interface ICheckboxOption<T> {
  label: ReactNode;
  value: T;
}

interface ICheckboxGroupProps<T> extends ViewProps {
  options: ICheckboxOption<T>[];
  onChange: (value: T[]) => void;
  direction?: "vertical" | "horizontal";
  value: T[];
}

const Group = <T,>({
  options,
  onChange,
  direction = "horizontal",
  value = [],
  ...rest
}: ICheckboxGroupProps<T>) => {
  const onCheckboxchecked = (checked: boolean, itemValue: T) => {
    if (checked) {
      onChange([...value, itemValue]);
    } else {
      onChange(value.filter((e) => e !== itemValue));
    }
  };

  return (
    <View
      className={clsx("flex gap-5", direction === "horizontal" && "flex-row")}
      {...rest}
    >
      {options.map((item: ICheckboxOption<T>, index) => (
        <Button
          key={index}
          value={item.value}
          label={item.label}
          checked={value.includes(item.value)}
          size="large"
          theme="green"
          onChange={onCheckboxchecked}
        />
      ))}
    </View>
  );
};

export default Group;
