import BackButton from "@/components/BackButton";
import constants from "@/constants";
import { useGlobalStore } from "@/store";
import { getDecodedToken } from "@/utils/helper";
import { getStorageItem } from "@/utils/storage";
import { Redirect, Stack } from "expo-router";
import React from "react";

const AuthLayout = () => {
  const isAuthenticated = useGlobalStore.use.isAuthenticated();
  const isOnboarded = getStorageItem(constants.ONBOARDING_STORAGE_KEY);

  if (!isOnboarded) {
    return <Redirect href="/onboard" />;
  }

  if (!isAuthenticated) {
    return <Redirect withAnchor href="/login" />;
  }

  const decoded = getDecodedToken();
  if (decoded?.user?.getUserData) {
    return <Redirect href={"/complete-profile"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="registry/item/[id]"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
};

export default AuthLayout;
