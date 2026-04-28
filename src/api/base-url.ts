import { Platform } from "react-native";

const ANDROID_EMULATOR_HOST = "10.0.2.2";

export const getApiBaseUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!apiUrl) {
    return apiUrl;
  }

  if (Platform.OS !== "android") {
    return apiUrl;
  }

  return apiUrl
    .replace(/^http:\/\/localhost(?=[:/]|$)/, `http://${ANDROID_EMULATOR_HOST}`)
    .replace(
      /^http:\/\/127\.0\.0\.1(?=[:/]|$)/,
      `http://${ANDROID_EMULATOR_HOST}`,
    );
};
