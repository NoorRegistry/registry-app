import { useLoadingOverlay } from "@/components/Loader/LoadingContext";
import Typography from "@/components/Typography";
import { googleLogin } from "@/services/authentication.service";
import { IAccessToken, TLoginMethod } from "@/types";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import * as Device from "expo-device";
import { t } from "i18next";
import React from "react";
import { Image, Platform, Pressable } from "react-native";
import Toast from "react-native-toast-message";

const GoogleLogin = ({
  handleSignIn,
}: {
  handleSignIn: (token: IAccessToken, method: TLoginMethod) => void;
}) => {
  const { showLoadingOverlay, hideLoadingOverlay } = useLoadingOverlay();

  const googleLoginMutation = useMutation({
    mutationFn: (idToken: string) =>
      googleLogin({
        idToken: idToken,
        deviceName: Device.modelName ?? Device.deviceName ?? "",
        devicePlatform: Platform.OS,
      }),
    onSuccess: (data) => {
      console.log("Google token exchange successful", data);
      handleSignIn(data, "google");
    },
    onMutate: () => showLoadingOverlay(),
    onSettled: () => hideLoadingOverlay(),
    onError: (error) => {
      console.log("Google login api error", JSON.stringify(error));
      Toast.show({
        type: "error",
        text1: t("login.loginFailed"),
      });
    },
  });

  const handlePress = async () => {
    if (googleLoginMutation.isPending) {
      console.log("Google login in progress");
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        console.log("Google login successful", response.data);
        console.log("User info:", {
          name: response.data?.user?.name,
          email: response.data?.user?.email,
          photo: response.data?.user?.photo,
          familyName: response.data?.user?.familyName,
          givenName: response.data?.user?.givenName,
        });

        googleLoginMutation.mutate(response.data?.idToken!);
      } else {
        console.log("Google login cancelled");
      }
    } catch (error) {
      console.log("Google sign-in error", JSON.stringify(error));
      Toast.show({
        type: "error",
        text1: t("login.loginFailed"),
      });
    }
  };

  return (
    <Pressable
      disabled={googleLoginMutation.isPending}
      className="h-14 w-full items-center justify-center flex-row rounded-lg border border-neutral-100 gap-3"
      onPress={handlePress}
    >
      <Image source={require("@assets/icons/social-icons/google.png")} />
      <Typography.Text weight="bold" size="base">
        Google
      </Typography.Text>
    </Pressable>
  );
};

export default GoogleLogin;
