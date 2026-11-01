import React from "react";
import { Text as mockText } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrivacySetting from "../PrivacySetting";
import { updateFriendSettings } from "@/services/friends.service";
import Toast from "react-native-toast-message";
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@/services/friends.service", () => ({
  updateFriendSettings: jest.fn(),
}));
jest.mock("@/screens/friends/hooks", () => ({
  useFriendsSummary: () => ({
    data: { profileVisibility: "Private" },
    refetch: jest.fn(),
  }),
  useRefreshOnFocus: jest.fn(),
  refreshFriendData: jest.fn(),
}));
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));
let tree: ReactTestRenderer;
let client: QueryClient;
beforeEach(async () => {
  jest.clearAllMocks();
  client = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity },
      queries: { gcTime: Infinity },
    },
  });
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <PrivacySetting />
      </QueryClientProvider>,
    );
  });
});
afterEach(async () => {
  await act(async () => tree.unmount());
  client.clear();
});
it("saves account privacy immediately and shows feedback", async () => {
  (updateFriendSettings as jest.Mock).mockResolvedValue({
    profileVisibility: "Public",
  });
  await act(async () => {
    tree.root
      .findAllByProps({ accessibilityLabel: "common.public" })[0]
      .props.onPress();
  });
  expect(updateFriendSettings).toHaveBeenCalledWith({
    profileVisibility: "Public",
  });
  expect(Toast.show).toHaveBeenCalledWith({
    type: "success",
    text1: "common.saved",
  });
});
it("keeps Private selected when saving fails", async () => {
  (updateFriendSettings as jest.Mock).mockRejectedValue(new Error("Offline"));
  await act(async () => {
    tree.root
      .findAllByProps({ accessibilityLabel: "common.public" })[0]
      .props.onPress();
  });
  expect(
    tree.root.findAllByProps({ accessibilityLabel: "common.private" })[0].props
      .accessibilityState.checked,
  ).toBe(true);
  expect(Toast.show).toHaveBeenCalledWith({
    type: "error",
    text1: "common.error",
  });
});
