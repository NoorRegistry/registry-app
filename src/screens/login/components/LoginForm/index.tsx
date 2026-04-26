import { Button } from "@/components/Button";
import Form from "@/components/Form";
import Typography from "@/components/Typography";
import { Colors } from "@/constants/Colors";
import { ILoginPayload, sendOtp } from "@/services/authentication.service";
import { getApiErrorMessage } from "@/utils/api-error";

import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
  const emailRef = useRef<TextInput | null>(null);
  const [loginError, setLoginError] = useState("");

  const sendOtpMutation = useMutation({
    mutationFn: (data: ILoginPayload) => sendOtp(data),
    onSuccess: (_, variables) => {
      console.log("OTP sent successfully");
      setLoginError("");

      // Navigate to OTP verification screen with email
      router.push({
        pathname: "/verify-otp" as any,
        params: { email: variables.email },
      });
    },
    onError: (error) => {
      console.log("Send OTP error", JSON.stringify(error));
      const message = getApiErrorMessage(error, t("login.loginFailed"));
      setLoginError(message);
      Toast.show({
        type: "error",
        text1: t("login.loginFailed"),
        text2: message,
      });
    },
  });

  return (
    <View className="flex w-full gap-4">
      <Typography.Text size="xl" weight="bold" className="my-0">
        {t("login.signinMsg")}
      </Typography.Text>
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
            ref={emailRef}
            placeholder={t("login.emailPlaceholder")}
            onChangeText={(text) => {
              setLoginError("");
              onChange(text);
            }}
            value={value}
            className="h-14 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
            textAlign={I18nManager.isRTL ? "right" : "left"}
            placeholderTextColor={
              Colors[colorScheme ?? "light"].placeholderTextColor
            }
            returnKeyType="done"
            onSubmitEditing={() => {
              emailRef.current?.blur();
              Keyboard.dismiss();
              handleSubmit((data) => sendOtpMutation.mutate(data))();
            }}
          />
        )}
      </Form.Item>

      {!!loginError && (
        <Typography.Text size="sm" type="danger">
          {loginError}
        </Typography.Text>
      )}

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
