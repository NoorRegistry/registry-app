import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const APP_VARIANT = process.env.APP_VARIANT || "development";
  console.log(
    "env variables",
    APP_VARIANT,
    process.env.NODE_ENV,
    process.env.MY_ENV,
  );
  const IS_DEV = APP_VARIANT === "development";

  const getAppName = () => {
    switch (APP_VARIANT) {
      case "preview":
        return "Preview Shift Gift Me";
      case "production":
        return "Shift Gift Me";
      default:
        return "Dev Shift Gift Me";
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
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV
        ? "com.shiftgiftme.mobile.dev"
        : "com.shiftgiftme.mobile",
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
        backgroundColor: "#ffffff",
      },
      package: IS_DEV ? "com.shiftgiftme.mobile.dev" : "com.shiftgiftme.mobile",
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
