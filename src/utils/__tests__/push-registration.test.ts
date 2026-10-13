import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import {
  registerPushDevice,
  unregisterPushDevice,
} from "@/services/notifications.service";
import {
  logoutWithNotifications,
  syncPushRegistration,
} from "../push-registration";

const mockStorage = new Map<string, string>();
let mockUserId = "user";
const mockSignOut = jest.fn(() => {
  mockUserId = "";
});
const mockClear = jest.fn();
jest.mock("@/api/queryClient", () => ({ queryClient: { clear: jest.fn() } }));
jest.mock("@/i18n", () => ({
  __esModule: true,
  default: { language: "ar", t: (key: string) => key },
}));
jest.mock("@/services/notifications.service", () => ({
  registerPushDevice: jest.fn().mockResolvedValue({}),
  unregisterPushDevice: jest.fn().mockResolvedValue({}),
}));
jest.mock("@/store", () => ({
  useGlobalStore: { getState: () => ({ signOut: mockSignOut }) },
}));
jest.mock("@/store/notifications", () => ({
  useNotificationNavigation: { getState: () => ({ setPending: mockClear }) },
}));
jest.mock("@/utils/helper", () => ({
  getUserSub: () => mockUserId,
  clearSessionData: jest.fn(),
}));
jest.mock("@/utils/storage", () => ({
  getStorageItem: (key: string) => mockStorage.get(key),
  setStorageItem: (key: string, value: string) => mockStorage.set(key, value),
}));
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: "project" } } } },
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "phone" }));
jest.mock("expo-notifications", () => ({
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  AndroidImportance: { DEFAULT: 3 },
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn().mockResolvedValue({}),
  setBadgeCountAsync: jest.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.clear();
  mockUserId = "user";
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
    granted: false,
    canAskAgain: true,
  });
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
    granted: false,
    canAskAgain: false,
  });
  (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
    data: "ExpoPushToken[test]",
  });
});
it("does not ask permission before Home, and asks only once there", async () => {
  await syncPushRegistration(false);
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  await syncPushRegistration(true);
  await syncPushRegistration(true);
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(registerPushDevice).not.toHaveBeenCalled();
});
it("registers the currently signed-in account with its language", async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
    granted: true,
  });
  await syncPushRegistration();
  expect(registerPushDevice).toHaveBeenCalledWith(
    expect.objectContaining({
      installationId: "phone",
      token: "ExpoPushToken[test]",
      language: "ar",
    }),
  );
});
it("unregisters and clears pending taps and badges before logging out", async () => {
  await logoutWithNotifications();
  expect(unregisterPushDevice).toHaveBeenCalledWith("phone");
  expect(Notifications.dismissAllNotificationsAsync).toHaveBeenCalled();
  expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
  expect(mockClear).toHaveBeenCalledWith(null);
  expect(mockSignOut).toHaveBeenCalled();
});
it("cannot finish a device registration after logout starts", async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
    granted: true,
  });
  let resolveToken: (value: { data: string }) => void = () => undefined;
  const token = new Promise<{ data: string }>((resolve) => {
    resolveToken = resolve;
  });
  (Notifications.getExpoPushTokenAsync as jest.Mock).mockReturnValue(token);
  const registering = syncPushRegistration();
  await Promise.resolve();
  const logout = logoutWithNotifications();
  resolveToken({ data: "ExpoPushToken[test]" });
  await registering;
  await logout;
  expect(registerPushDevice).not.toHaveBeenCalled();
  expect(mockSignOut).toHaveBeenCalled();
});
it("does not register while logged out", async () => {
  mockUserId = "";
  await syncPushRegistration(true);
  expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
});

it("creates the Android activity channel before requesting permission", async () => {
  const original = Platform.OS;
  Object.defineProperty(Platform, "OS", {
    value: "android",
    configurable: true,
  });
  try {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    await syncPushRegistration(true);
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      "activity",
      expect.objectContaining({ importance: 3 }),
    );
    expect(
      (Notifications.setNotificationChannelAsync as jest.Mock).mock
        .invocationCallOrder[0],
    ).toBeLessThan(
      (Notifications.requestPermissionsAsync as jest.Mock).mock
        .invocationCallOrder[0],
    );
    expect(registerPushDevice).toHaveBeenCalledWith(
      expect.objectContaining({ platform: "android" }),
    );
  } finally {
    Object.defineProperty(Platform, "OS", {
      value: original,
      configurable: true,
    });
  }
});
