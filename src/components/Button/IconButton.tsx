import clsx from "clsx";
import React, { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";

interface IButtonProps extends Omit<PressableProps, "children"> {
  icon: ReactNode;
  onPress?: () => void;
}

export default function IconButton(props: IButtonProps) {
  const { onPress, icon, className, ...rest } = props;
  const classes = clsx("p-1", className);
  return (
    <Pressable className={classes} onPress={onPress} {...rest}>
      {icon}
    </Pressable>
  );
}
