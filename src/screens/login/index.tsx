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
        <View className="bg-primary-50 flex-1">
          <View className="items-center justify-center pt-20 pb-10">
            <Image
              className="max-w-[320px]"
              resizeMode="contain"
              source={require("@assets/images/logo/fulllogo.png")}
            />
          </View>
        </View>
        <View className="flex-shrink-0 rounded-t-2xl -mt-11 bg-white p-6">
          <SafeAreaView edges={["bottom"]}>
            <LoginForm />

            <View className="my-6 flex-row items-center w-full">
              <View className="h-px flex-1 bg-neutral-200" />
              <Typography.Text size="sm" className="mx-4 text-neutral-500">
                {t("login.orLoginWith")}
              </Typography.Text>
              <View className="h-px flex-1 bg-neutral-200" />
            </View>

            <View className="mb-6 flex-row items-center w-full gap-6">
              <View className="flex-1">
                <GoogleLogin handleSignIn={handleSignIn} />
              </View>
              {/* <FacebookLogin handleSignIn={handleSignIn} /> */}
              {Platform.OS === "ios" && (
                <View className="flex-1">
                  <AppleLoginButton handleSignIn={handleSignIn} />
                </View>
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
