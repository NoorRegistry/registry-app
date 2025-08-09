import FontAwesome from "@expo/vector-icons/FontAwesome";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { reloadAppAsync } from "expo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppStateStatus, I18nManager, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/api/queryClient";
import { LoadingProvider } from "@/components/Loader/LoadingContext";
import CustomThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/ToastProvider";
import { useAppState } from "@/hooks/useAppState";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import { useGlobalStore } from "@/store";
import { handleRefreshToken } from "@/utils/auth-helper";
import { isAuthenticated } from "@/utils/helper";
import { useTranslation } from "react-i18next";

import BottomSheetProvider from "@/components/BottomSheet";
import "@/i18n";
import "@/theme/global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(protected)",
};

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

const configureLayoutDirection = async (language: string) => {
  const isRTL = language === "ar"; // Add other RTL languages as needed
  // Check if layout direction needs to change
  if (I18nManager.isRTL !== isRTL) {
    console.log("forceRtl :>> ");
    // Enable/Disable RTL
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    // Reload app to apply RTL changes
    await reloadAppAsync();
  }
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isAppReady = useGlobalStore.use.isAppReady();
  const signIn = useGlobalStore.use.signIn();
  const signOut = useGlobalStore.use.signOut();
  const setIsAppReady = useGlobalStore.use.setIsAppReady();
  const { i18n } = useTranslation();

  const [loaded, error] = useFonts({
    Poppinsextralight: require("@assets/fonts/Poppins-ExtraLight.ttf"),
    Poppinslight: require("@assets/fonts/Poppins-Light.ttf"),
    Poppinsregular: require("@assets/fonts/Poppins-Regular.ttf"),
    Poppinsmedium: require("@assets/fonts/Poppins-Medium.ttf"),
    Poppinsbold: require("@assets/fonts/Poppins-Bold.ttf"),
    Tajawalextralight: require("@assets/fonts/Tajawal-ExtraLight.ttf"),
    Tajawallight: require("@assets/fonts/Tajawal-Light.ttf"),
    Tajawalregular: require("@assets/fonts/Tajawal-Regular.ttf"),
    Tajawalmedium: require("@assets/fonts/Tajawal-Medium.ttf"),
    Tajawalbold: require("@assets/fonts/Tajawal-Bold.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const handleToken = async () => {
      try {
        await handleRefreshToken();
        if (isAuthenticated()) {
          signIn();
        }
      } catch (error) {
        console.log("error in layout", error);
        signOut();
      }
      configureLayoutDirection(i18n.language);
      setIsAppReady();
    };
    handleToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded && isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAppReady]);

  if (!loaded || !isAppReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useOnlineManager();
  useAppState(onAppStateChange);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LoadingProvider>
            <CustomThemeProvider>
              <BottomSheetModalProvider>
                <Stack
                  screenOptions={{ headerBackButtonDisplayMode: "minimal" }}
                >
                  <Stack.Screen
                    name="(protected)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="onboard/index"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <ToastProvider />
                <BottomSheetProvider />
              </BottomSheetModalProvider>
            </CustomThemeProvider>
          </LoadingProvider>
        </QueryClientProvider>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
