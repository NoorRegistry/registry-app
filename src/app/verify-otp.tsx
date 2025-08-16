import { useMutation } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import Toast from "react-native-toast-message";

import BackButton from "@/components/BackButton";
import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import constants from "@/constants";
import { Colors } from "@/constants/Colors";
import { resendOtp, verifyOtp } from "@/services/authentication.service";
import { useGlobalStore } from "@/store";
import { IAccessToken } from "@/types";
import { navigateAfterAuth } from "@/utils/helper";
import { setStorageItem } from "@/utils/storage";

export default function VerifyOtpScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const signIn = useGlobalStore.use.signIn();

  const verifyOtpMutation = useMutation({
    mutationFn: (otpCode: string) =>
      verifyOtp({ email: email || "", otp: otpCode }),
    onSuccess: (data: IAccessToken) => {
      console.log("OTP verification successful");
      setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(data));
      Toast.show({
        type: "success",
        text1: t("login.loginSuccessful"),
      });
      signIn();
      // Navigate user based on profile completion status
      navigateAfterAuth(router);
    },
    onError: (error) => {
      console.log("OTP verification error", JSON.stringify(error));
      Toast.show({
        type: "error",
        text1: t("login.loginFailed"),
      });
      setOtp("");
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: (data: { email: string }) => resendOtp(data),
    onSuccess: () => {
      console.log("OTP resent successfully");
      Toast.show({
        type: "success",
        text1: t("login.resendCodeSuccessful"),
      });
      // Reset timer after successful resend
      setResendTimer(60);
      setCanResend(false);
    },
    onError: (error) => {
      console.log("Resend OTP error", JSON.stringify(error));
      Toast.show({
        type: "error",
        text1: t("login.resendCodeFailed"),
      });
    },
  });

  // Timer effect for resend button
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer, canResend]);

  const handleOtpComplete = (otpCode: string) => {
    setOtp(otpCode);
    if (otpCode.length === 6) {
      Keyboard.dismiss();
      verifyOtpMutation.mutate(otpCode);
    }
  };

  const handleResendOtp = () => {
    if (canResend && !resendOtpMutation.isPending) {
      resendOtpMutation.mutate({ email: email || "" });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: "",
          headerBackButtonDisplayMode: "minimal",
          headerLeft: () => <BackButton />,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-8">
            <Typography.Text
              size="2xl"
              weight="bold"
              className="text-center mb-2"
            >
              {t("login.confirmationCode")}
            </Typography.Text>
            <Typography.Text
              size="base"
              weight="regular"
              className="text-center"
            >
              <Trans
                i18nKey="login.emailSentTo"
                values={{ email }}
                components={{
                  bold: (
                    <Typography.Text
                      size="base"
                      weight="bold"
                      className="text-center"
                    />
                  ),
                }}
              />
            </Typography.Text>
          </View>

          <View className="mb-6">
            <OtpInput
              numberOfDigits={6}
              focusColor={Colors[colorScheme ?? "light"].tint}
              focusStickBlinkingDuration={500}
              onTextChange={setOtp}
              onFilled={handleOtpComplete}
              textInputProps={{
                accessibilityLabel: "One-Time Password",
              }}
              theme={{
                containerStyle: {
                  alignSelf: "center",
                  marginVertical: 20,
                },
                pinCodeContainerStyle: {
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                  borderColor: Colors[colorScheme ?? "light"].tabIconDefault,
                  borderWidth: 1,
                  borderRadius: 8,
                  width: 50,
                  height: 50,
                },
                pinCodeTextStyle: {
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 18,
                  fontFamily: "Poppins-Medium",
                },
                focusStickStyle: {
                  backgroundColor: Colors[colorScheme ?? "light"].tint,
                },
                focusedPinCodeContainerStyle: {
                  borderColor: Colors[colorScheme ?? "light"].tint,
                  borderWidth: 2,
                },
              }}
            />
          </View>

          <View className="mb-4">
            <Button
              loading={verifyOtpMutation.isPending}
              type="primary"
              size="large"
              title={t("login.verifyOtp")}
              rounded={false}
              onPress={() => {
                if (otp.length === 6) {
                  verifyOtpMutation.mutate(otp);
                } else {
                  Toast.show({
                    type: "error",
                    text1: t("login.enterValidOtp"),
                  });
                }
              }}
            />
          </View>

          <View className="flex-row justify-center items-center">
            <Typography.Text size="sm" weight="regular">
              {t("login.didNotGetCode")}{" "}
            </Typography.Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={!canResend || resendOtpMutation.isPending}
            >
              <Typography.Text
                size="sm"
                weight="medium"
                type={
                  !canResend || resendOtpMutation.isPending
                    ? "secondary"
                    : "primary"
                }
                className="underline"
              >
                {resendOtpMutation.isPending
                  ? t("login.sending")
                  : !canResend
                    ? t("login.resendIn", { seconds: resendTimer })
                    : t("login.resend")}
              </Typography.Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
