import React from "react";
import NotificationCenter from "..";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";

import { create, act } from "react-test-renderer";
const mockId = "00000000-0000-4000-8000-000000000001";
let mockAuthenticated = false;
let mockProfileIncomplete = false;
let mockSegments = ["login"];
let mockPending: any = null;
const mockSetPending = jest.fn((data: any) => {
  mockPending = data;
});
const mockT = (key: string) => key;
jest.mock("@/api/queryClient", () => ({
  queryClient: { invalidateQueries: jest.fn().mockResolvedValue({}) },
}));
jest.mock("@/hooks/useNotifications", () => ({
  useNotificationSummary: () => ({ data: { unreadCount: 0 } }),
}));
jest.mock("@/services/notifications.service", () => ({
  markNotificationRead: jest.fn().mockResolvedValue({}),
}));
jest.mock("@/store", () => ({
  useGlobalStore: {
    use: { isAuthenticated: () => mockAuthenticated },
    getState: () => ({ isAuthenticated: mockAuthenticated }),
  },
}));
jest.mock("@/store/notifications", () => ({
  useNotificationNavigation: () => ({
    pending: mockPending,
    setPending: mockSetPending,
  }),
}));
jest.mock("@/utils/helper", () => ({
  getUserSub: () => mockId,
  getDecodedToken: () => ({ user: { getUserData: mockProfileIncomplete } }),
}));
jest.mock("@/utils/push-registration", () => ({
  syncPushRegistration: jest.fn().mockResolvedValue({}),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: "en" } }),
}));
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  usePathname: () => "/",
  useRootNavigationState: () => ({ key: "root" }),
  useSegments: () => mockSegments,
}));
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));
jest.mock("expo-notifications", () => ({
  DEFAULT_ACTION_IDENTIFIER: "default",
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
  addNotificationReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  clearLastNotificationResponseAsync: jest.fn().mockResolvedValue({}),
  addPushTokenListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  setBadgeCountAsync: jest.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthenticated = false;
  mockProfileIncomplete = false;
  mockSegments = ["login"];
  mockPending = null;
});
it("keeps a notification through login and profile completion, then opens it once", async () => {
  mockPending = {
    notificationId: mockId,
    recipientId: mockId,
    type: "FRIEND_REQUEST",
    requestId: mockId,
  };
  let tree: any;
  await act(async () => {
    tree = create(<NotificationCenter />);
  });
  expect(router.push).not.toHaveBeenCalled();
  mockAuthenticated = true;
  mockProfileIncomplete = true;
  mockSegments = ["(protected)"];
  await act(async () => {
    tree.update(<NotificationCenter />);
  });
  expect(router.push).not.toHaveBeenCalled();
  expect(mockPending).not.toBeNull();
  mockSegments = ["complete-profile"];
  await act(async () => {
    tree.update(<NotificationCenter />);
  });
  expect(router.push).not.toHaveBeenCalled();
  mockProfileIncomplete = false;
  mockSegments = ["(protected)"];
  await act(async () => {
    tree.update(<NotificationCenter />);
  });
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/friends/requests/[id]",
    params: { id: mockId },
  });
  expect(mockPending).toBeNull();
  await act(async () => {
    tree.update(<NotificationCenter />);
  });
  expect(router.push).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
it("rejects a queued tap belonging to another signed-in account", async () => {
  mockAuthenticated = true;
  mockSegments = ["(protected)"];
  mockPending = {
    notificationId: mockId,
    recipientId: "other-user",
    type: "FRIEND_ACCEPTED",
    friendId: mockId,
  };
  let tree: any;
  await act(async () => {
    tree = create(<NotificationCenter />);
  });
  expect(router.push).not.toHaveBeenCalled();
  expect(mockPending).toBeNull();
  expect(Toast.show).toHaveBeenCalledWith(
    expect.objectContaining({ text1: "notifications.otherAccount" }),
  );
  await act(async () => tree.unmount());
});
it("deduplicates the native tap listener and validates payloads before queuing", async () => {
  let tree: any;
  await act(async () => {
    tree = create(<NotificationCenter />);
  });
  const listener = (
    Notifications.addNotificationResponseReceivedListener as jest.Mock
  ).mock.calls[0][0];
  const response = {
    actionIdentifier: "default",
    notification: {
      request: {
        identifier: "native-id",
        content: {
          data: {
            notificationId: mockId,
            recipientId: mockId,
            type: "REGISTRY_SHARED",
            registryId: mockId,
          },
        },
      },
    },
  };
  await act(async () => {
    listener(response);
    listener(response);
  });
  expect(mockSetPending).toHaveBeenCalledTimes(1);
  await act(async () => {
    listener({
      ...response,
      notification: {
        request: {
          identifier: "bad-id",
          content: { data: { url: "https://example.com" } },
        },
      },
    });
  });
  expect(mockSetPending).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

it("opens order updates at the authenticated order detail route", async () => {
  mockAuthenticated = true;
  mockSegments = ["(protected)"];
  mockPending = {
    notificationId: mockId,
    recipientId: mockId,
    type: "ORDER_DISPATCHED",
    orderId: mockId,
  };
  let tree: any;
  await act(async () => {
    tree = create(<NotificationCenter />);
  });
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/orders/[id]",
    params: { id: mockId },
  });
  expect(mockPending).toBeNull();
  await act(async () => tree.unmount());
});

it("opens support replies at the authenticated conversation route", async () => {
  mockAuthenticated = true;
  mockSegments = ["(protected)"];
  mockPending = {
    notificationId: mockId,
    recipientId: mockId,
    type: "SUPPORT_REPLY",
    supportRequestId: mockId,
  };
  let tree: any;
  await act(async () => {
    tree = create(<NotificationCenter />);
  });
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/help/[id]",
    params: { id: mockId },
  });
  expect(mockPending).toBeNull();
  await act(async () => tree.unmount());
});
