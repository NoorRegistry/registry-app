declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_ASSET_URL: string;
    EXPO_PUBLIC_GUIDES_URL: string;
  }
}
