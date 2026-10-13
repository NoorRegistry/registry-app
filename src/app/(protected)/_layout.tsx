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
      <Stack.Screen name="friends" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="addresses" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen
        name="order-confirmation"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="orders" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
      <Stack.Screen name="partner" options={{ headerShown: false }} />
      <Stack.Screen
        name="registry/item/[id]"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
};

export default AuthLayout;
