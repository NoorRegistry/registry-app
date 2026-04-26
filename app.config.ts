import { ConfigContext, ExpoConfig } from "expo/config";

const APP_DISPLAY_NAME = "Shop Simplist";

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
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FAF2F0",
    },
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
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
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
      edgeToEdgeEnabled: true,
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
      "expo-localization",
      "expo-secure-store",
      [
        "expo-dev-launcher",
        {
          launchMode: "most-recent",
        },
      ],
      "@react-native-google-signin/google-signin",
      "expo-apple-authentication",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "709b180f-5e71-4bce-97b7-ffa926f48904",
      },
    },
  };
};
