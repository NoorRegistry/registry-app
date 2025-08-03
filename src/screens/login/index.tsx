import Typography from "@/components/Typography";
import { Link } from "expo-router";
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
import LoginForm from "./components/LoginForm";

function LoginScreen() {
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        className="flex-1"
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
              <Link href="/signup">
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
