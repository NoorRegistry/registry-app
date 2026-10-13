import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

// The simulator/emulator and a real phone all reach the same local backend.
// A development client gets the laptop host from its connected Metro session.
export const getApiBaseUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl || !__DEV__) return apiUrl;
  try {
    const url = new URL(apiUrl);
    if (!["localhost", "127.0.0.1"].includes(url.hostname)) return apiUrl;
    const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];
    if (metroHost && !["localhost", "127.0.0.1"].includes(metroHost))
      url.hostname = metroHost;
    else if (Platform.OS === "android" && !Device.isDevice)
      url.hostname = "10.0.2.2";
    return url.toString().replace(/\/$/, "");
  } catch {
    return apiUrl;
  }
};
