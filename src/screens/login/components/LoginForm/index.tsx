import { Button } from "@/components/Button";
import Form from "@/components/Form";
import { Colors } from "@/constants/Colors";
import { ILoginPayload, sendOtp } from "@/services/authentication.service";

import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Keyboard,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";

const LoginForm = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { control, handleSubmit } = useForm<ILoginPayload>();

  const sendOtpMutation = useMutation({
    mutationFn: (data: ILoginPayload) => sendOtp(data as ILoginPayload),
    onSuccess: (data, variables) => {
      console.log("OTP sent successfully");

      // Navigate to OTP verification screen with email
      router.push({
        pathname: "/verify-otp" as any,
        params: { email: variables.email },
      });
    },
    onError: (error) => {
      console.log("Send OTP error", JSON.stringify(error));
      Toast.show({
        type: "error",
        text1: t("login.loginFailed"),
      });
    },
  });

  return (
    <View className="flex w-full gap-4">
      <Form.Item
        name="email"
        label={t("common.email")}
        rules={{
          required: t("login.enterEmail"),
          pattern: {
            value:
              /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: t("login.enterValidEmail"),
          },
        }}
        control={control}
      >
        {({ field: { onChange, value } }) => (
          <TextInput
            placeholder={t("login.emailPlaceholder")}
            onChangeText={onChange}
            value={value}
            className="h-14 rounded-lg bg-neutral-100 px-4 font-Poppinsregular text-black"
            textAlign={I18nManager.isRTL ? "right" : "left"}
            placeholderTextColor={
              Colors[colorScheme ?? "light"].placeholderTextColor
            }
          />
        )}
      </Form.Item>
      {/* <Form.Item
        name="password"
        label={t("login.password")}
        rules={{
          required: t("login.enterValidPassword"),
          pattern: {
            value:
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
            message: t("login.enterValidPassword"),
          },
        }}
        control={control}
      >
        {({ field: { onChange, value } }) => (
          <View className="flex-row items-center">
            <TextInput
              placeholder={t("login.enterPassword")}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              value={value}
              className="w-full h-14 rounded-lg bg-neutral-100 ps-4 pe-10 font-Poppinsregular text-black"
              placeholderTextColor={
                Colors[colorScheme ?? "light"].placeholderTextColor
              }
              textAlign={I18nManager.isRTL ? "right" : "left"}
            />
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              className="absolute end-3"
              size={20}
              color={Colors[colorScheme ?? "light"].tabIconDefault}
              suppressHighlighting={true}
              onPress={() => {
                setShowPassword((prev) => !prev);
              }}
            />
          </View>
        )}
      </Form.Item> */}
      <Button
        loading={sendOtpMutation.isPending}
        type="primary"
        size="large"
        title={t("common.login")}
        rounded={false}
        onPress={() => {
          Keyboard.dismiss();
          handleSubmit((data) => sendOtpMutation.mutate(data))();
        }}
      />
    </View>
  );
};

export default LoginForm;
