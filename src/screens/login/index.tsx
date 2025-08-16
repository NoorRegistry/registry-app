import Typography from "@/components/Typography";
import constants from "@/constants";
import { useGlobalStore } from "@/store";
import { IAccessToken, TLoginMethod } from "@/types";
import { navigateAfterAuth } from "@/utils/helper";
import { setStorageItem } from "@/utils/storage";
import { Link, router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AppleLoginButton from "./components/AppleLogin";
import GoogleLogin from "./components/GoogleLogin";
import LoginForm from "./components/LoginForm";

function LoginScreen() {
  const { t } = useTranslation();
  const signIn = useGlobalStore.use.signIn();

  const handleSignIn = (token: IAccessToken, method: TLoginMethod) => {
    setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(token));
    Toast.show({
      type: "success",
      text1: t("login.loginSuccessful"),
    });
    signIn();
    // Navigate user based on profile completion status
    navigateAfterAuth(router);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="bg-dark-bg flex-1">
          <Image
            className="absolute"
            source={require("@assets/images/login/login-bg.png")}
          />
          <SafeAreaView edges={["top"]} className="flex-1 pb-11">
            <View className="flex-1 justify-end p-6">
              <Typography.Text
                weight="bold"
                size="2xl"
                className="text-white text-center"
              >
                {t("common.login")}
              </Typography.Text>
              <Typography.Text
                size="base"
                className="text-white text-center mt-2"
              >
                {t("login.signInToExistingAccount")}
              </Typography.Text>
            </View>
          </SafeAreaView>
        </View>
        <View className="flex-shrink-0 rounded-t-2xl -mt-11 bg-white p-6">
          <SafeAreaView edges={["bottom"]}>
            <LoginForm />

            <View className="mt-6 flex w-full">
              <Typography.Text size="sm" className="my-6">
                {t("login.orLoginWith")}
              </Typography.Text>
            </View>

            <View className="mb-6 flex-row items-center justify-center gap-6">
              <GoogleLogin handleSignIn={handleSignIn} />
              {/* <FacebookLogin handleSignIn={handleSignIn} /> */}
              {Platform.OS === "ios" && (
                <AppleLoginButton handleSignIn={handleSignIn} />
              )}
            </View>

            <View
              style={{ direction: I18nManager.isRTL ? "rtl" : "ltr" }}
              className="flex-row gap-3 justify-center mt-8"
            >
              <Typography.Text
                size="sm"
                className="text-center text-neutral-500"
              >
                {t("login.noAccount")}
              </Typography.Text>
              <Link href={"/signup" as any}>
                <Typography.Text
                  size="sm"
                  type="success"
                  weight="bold"
                  className="text-center"
                >
                  {t("login.register")}
                </Typography.Text>
              </Link>
            </View>
          </SafeAreaView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
