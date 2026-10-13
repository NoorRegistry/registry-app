import { ConfigContext, ExpoConfig } from "expo/config";

const APP_DISPLAY_NAME = "Simplist";

export default ({ config }: ConfigContext): ExpoConfig => {
  const APP_VARIANT = process.env.APP_VARIANT || "development";
  console.log("env variables", APP_VARIANT, process.env.NODE_ENV);
  const IS_DEV = APP_VARIANT === "development";
  const IS_PRODUCTION = APP_VARIANT === "production";

  const bundleIdentifier = IS_DEV
    ? "com.shiftgiftme.mobile.dev"
    : "com.shiftgiftme.mobile";

  const androidPackage = IS_DEV
    ? "com.shiftgiftme.mobile.dev"
    : "com.shiftgiftme.mobile";
  const SHARE_BASE_URL = process.env.EXPO_PUBLIC_SHARE_BASE_URL;
  const parsedShareUrl = (() => {
    if (!SHARE_BASE_URL) return null;
    try {
      return new URL(SHARE_BASE_URL);
    } catch {
      return null;
    }
  })();
  const shareHost =
    parsedShareUrl?.protocol === "https:" ? parsedShareUrl.host : null;
  const shouldEnableUniversalLinks = IS_PRODUCTION && shareHost;

  return {
    ...config,
    // Keep Expo `name` stable so EAS resolves the correct existing Xcode target (`ShiftGiftMe`).
    name: "ShiftGiftMe",
    slug: "registry-app",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "shiftgiftme",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier,
      ...(shouldEnableUniversalLinks
        ? { associatedDomains: [`applinks:${shareHost}`] }
        : {}),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleName: APP_DISPLAY_NAME,
        CFBundleDisplayName: APP_DISPLAY_NAME,
      },
      googleServicesFile: IS_DEV
        ? "./assets/firebaseconfig/development/GoogleService-Info.plist"
        : process.env.GOOGLE_SERVICE_INFO_PLIST,
      usesAppleSignIn: true,
      entitlements: {
        "aps-environment": IS_DEV ? "development" : "production",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/brand/adaptive-icon.png",
        backgroundColor: "#FAF2F0",
      },
      package: androidPackage,
      ...(shouldEnableUniversalLinks
        ? {
            intentFilters: [
              {
                action: "VIEW",
                autoVerify: true,
                category: ["BROWSABLE", "DEFAULT"],
                data: [
                  {
                    scheme: "https",
                    host: shareHost,
                    pathPrefix: "/registry/guest-view",
                  },
                ],
              },
            ],
          }
        : {}),
      softwareKeyboardLayoutMode: "pan",
      googleServicesFile: IS_DEV
        ? "./assets/firebaseconfig/development/google-services.json"
        : process.env.GOOGLE_SERVICE_JSON,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      ["./plugins/withAndroidAppName", { name: APP_DISPLAY_NAME }],
      "expo-router",
      "expo-font",
      "expo-image",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          resizeMode: "contain",
          backgroundColor: "#FAF2F0",
        },
      ],
      "expo-status-bar",
      "expo-web-browser",
      "expo-localization",
      "expo-secure-store",
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow Simplist to use your location to set your delivery address.",
        },
      ],
      [
        "react-native-maps",
        {
          ...(process.env.GOOGLE_MAPS_IOS_API_KEY
            ? {
                iosGoogleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
              }
            : {}),
          ...(process.env.GOOGLE_MAPS_ANDROID_API_KEY
            ? {
                androidGoogleMapsApiKey:
                  process.env.GOOGLE_MAPS_ANDROID_API_KEY,
              }
            : {}),
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/brand/notification-icon.png",
          defaultChannel: "activity",
          color: "#C78063",
          mode: IS_DEV ? "development" : "production",
        },
      ],
      [
        "expo-dev-launcher",
        {
          launchMode: "most-recent",
        },
      ],
      "@react-native-google-signin/google-signin",
      "expo-apple-authentication",
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "react-native",
          organization: "shop-simplist",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      iosGoogleMapsEnabled: Boolean(process.env.GOOGLE_MAPS_IOS_API_KEY),
      androidGoogleMapsEnabled: Boolean(
        process.env.GOOGLE_MAPS_ANDROID_API_KEY,
      ),
      eas: {
        projectId: "709b180f-5e71-4bce-97b7-ffa926f48904",
      },
    },
  };
};
