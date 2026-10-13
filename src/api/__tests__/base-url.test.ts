import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { getApiBaseUrl } from "../base-url";
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { hostUri: "127.0.0.1:8081" } },
}));
jest.mock("expo-device", () => ({ isDevice: false }));
const originalUrl = process.env.EXPO_PUBLIC_API_URL;
const originalOS = Platform.OS;
afterEach(() => {
  process.env.EXPO_PUBLIC_API_URL = originalUrl;
  Object.defineProperty(Platform, "OS", {
    value: originalOS,
    configurable: true,
  });
});
it.each([
  ["ios", false, "127.0.0.1:8081", "http://localhost:3050"],
  ["android", false, "127.0.0.1:8081", "http://10.0.2.2:3050"],
  ["ios", true, "192.168.0.10:8081", "http://192.168.0.10:3050"],
  ["android", true, "192.168.0.10:8081", "http://192.168.0.10:3050"],
])(
  "connects %s devices to the development API",
  (os, isDevice, hostUri, expected) => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:3050";
    Object.defineProperty(Platform, "OS", { value: os, configurable: true });
    Object.defineProperty(Device, "isDevice", {
      value: isDevice,
      configurable: true,
    });
    Constants.expoConfig!.hostUri = hostUri;
    expect(getApiBaseUrl()).toBe(expected);
  },
);
it("keeps a deployed API URL unchanged", () => {
  process.env.EXPO_PUBLIC_API_URL = "https://api.example.com/v1";
  expect(getApiBaseUrl()).toBe("https://api.example.com/v1");
});
