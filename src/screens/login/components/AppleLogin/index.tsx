import { useLoadingOverlay } from "@/components/Loader/LoadingContext";
import { appleLogin } from "@/services/authentication.service";
import { IAccessToken, TLoginMethod } from "@/types";
import { useMutation } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Device from "expo-device";
import { t } from "i18next";
import React from "react";
import { Image, Platform, Pressable } from "react-native";
import Toast from "react-native-toast-message";

const AppleLoginButton = ({
  handleSignIn,
}: {
  handleSignIn: (token: IAccessToken, method: TLoginMethod) => void;
}) => {
  const { showLoadingOverlay, hideLoadingOverlay } = useLoadingOverlay();

  const appleLoginMutation = useMutation({
    mutationFn: (idToken: string) =>
      appleLogin({
        idToken,
        deviceName: Device.modelName ?? Device.deviceName ?? "",
        devicePlatform: Platform.OS,
      }),
    onSuccess: (data: IAccessToken) => {
      handleSignIn(data, "apple");
    },
    onMutate: () => showLoadingOverlay(),
    onSettled: () => hideLoadingOverlay(),
    onError: (error) => {
      console.log("Apple login api error", JSON.stringify(error));
      Toast.show({
        type: "error",
        text1: t("login.loginFailed"),
      });
    },
  });

  const handlePress = async () => {
    if (appleLoginMutation.isPending) {
      console.log("Apple login in progress");
      return;
    }

    try {
      const isAppleLoginAvailable =
        await AppleAuthentication.isAvailableAsync();
      console.log("isAppleLoginAvailable", isAppleLoginAvailable);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("User info:", {
        email: credential.email,
        firstName: credential.fullName?.givenName,
        lastName: credential.fullName?.familyName,
        identityToken: credential.identityToken ? "Present" : "Missing",
      });

      // signed in
      if (credential.identityToken) {
        appleLoginMutation.mutate(credential.identityToken);
      } else {
        console.log("Apple sign-in cancelled - no identity token received");
      }
    } catch (error) {
      console.log("Apple sign-in error", JSON.stringify(error));
      Toast.show({
        type: "error",
        text1: t("login.loginFailed"),
      });
    }
  };

  return (
    <>
      <Pressable
        disabled={appleLoginMutation.isPending}
        className="h-14 w-20 items-center justify-center rounded-lg border border-primary-500 dark:border-black"
        onPress={handlePress}
      >
        <Image source={require("@assets/icons/social-icons/apple.png")} />
      </Pressable>
    </>
  );
};

export default AppleLoginButton;
