declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "preview";
    APP_VARIANT: "development" | "production" | "preview";
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_ASSET_URL: string;
    EXPO_PUBLIC_GUIDES_URL: string;
    GOOGLE_SERVICE_INFO_PLIST: string;
    GOOGLE_SERVICE_JSON: string;
  }
}
