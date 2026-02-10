import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const APP_VARIANT = process.env.APP_VARIANT || "development";
  console.log("env variables", APP_VARIANT, process.env.NODE_ENV);
  const IS_DEV = APP_VARIANT === "development";
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

  const getAppName = () => {
    switch (APP_VARIANT) {
      case "preview":
        return "Shop Simplist";
      case "production":
        return "Shop Simplist";
      default:
        return "Dev Shop Simplist";
    }
  };

  return {
    ...config,
    name: getAppName(),
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
      bundleIdentifier: IS_DEV
        ? "com.shiftgiftme.mobile.dev"
        : "com.shiftgiftme.mobile",
      ...(shareHost ? { associatedDomains: [`applinks:${shareHost}`] } : {}),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
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
      package: IS_DEV ? "com.shiftgiftme.mobile.dev" : "com.shiftgiftme.mobile",
      ...(shareHost
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
