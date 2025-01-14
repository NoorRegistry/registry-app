import clsx from "clsx";
import { ReactNode } from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseControllerProps,
  UseFormStateReturn,
} from "react-hook-form";
import { I18nManager, View } from "react-native";

import Typography from "@/components/Typography";

interface GenericFormItemProps<T extends FieldValues>
  extends UseControllerProps<T> {
  /**
   * Passing a string will render as Text
   * Reactnode will be rendered as is
   */
  label?: ReactNode;
  /**
   * Classes to apply on label text
   * Use this to just add some class
   * Passing this along with custom label will throw an error
   */
  labelClassName?: ReactNode;
  /**
   * Wether label and control should be in same line
   */
  inline?: boolean;
  /**
   * Classes to apply on outside parent container
   */
  containerClassName?: string;
  children: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<T, Path<T>>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<T>;
  }) => ReactNode;
}

const Item = <T extends FieldValues>({
  name,
  control,
  rules,
  label,
  labelClassName,
  inline = false,
  disabled = false,
  containerClassName = "",
  children,
}: GenericFormItemProps<T>) => {
  const isRTL = I18nManager.getConstants().isRTL;
  const showRequiredMark = rules && rules.required;
  if (typeof label !== "string" && labelClassName) {
    throw new Error("labelClassName cannot be applied to custom label");
  }
  return (
    <View
      style={{ direction: isRTL ? "rtl" : "ltr" }}
      className={clsx(inline && "flex-row justify-between", containerClassName)}
    >
      {label && (
        <View className="flex-row gap-1">
          {typeof label === "string" ? (
            <Typography.Text className={clsx("mb-2", labelClassName ?? "")}>
              {label}
            </Typography.Text>
          ) : (
            label
          )}
          {showRequiredMark && (
            <Typography.Text type="danger">*</Typography.Text>
          )}
        </View>
      )}
      <Controller
        control={control}
        name={name}
        disabled={disabled}
        rules={rules}
        render={({ field, fieldState, formState }) => (
          <View>
            {children({ field, fieldState, formState })}
            <Typography.Text size="xs" type="danger" className="h-6 leading-6">
              {fieldState.error?.message ?? ""}
            </Typography.Text>
          </View>
        )}
      />
    </View>
  );
};

export default Item;
