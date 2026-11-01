import React from "react";
import { Text as mockText } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import RegistryAccessGate from "../RegistryAccessGate";
import { RegistryAccessDenied } from "@/api/http";
const mockMutate = jest.fn();
jest.mock("@/components/Button", () => ({ Button: "Button" }));
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@/screens/friends/actions", () => ({
  useFriendActions: () => ({ mutate: mockMutate, isPending: false }),
}));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
let tree: ReactTestRenderer;
const base: RegistryAccessDenied = {
  reason: "FRIENDSHIP_REQUIRED",
  owner: { id: "owner", firstName: "Owner", lastName: null },
  canRequest: true,
  requestId: null,
  requestDirection: null,
};
async function render(access: RegistryAccessDenied) {
  await act(async () => {
    tree = create(<RegistryAccessGate access={access} retry={jest.fn()} />);
  });
}
beforeEach(() => jest.clearAllMocks());
afterEach(async () => {
  await act(async () => tree.unmount());
});
it("offers a friend request when permitted", async () => {
  await render(base);
  act(() =>
    tree.root.findByProps({ title: "friends.addFriend" }).props.onPress(),
  );
  expect(mockMutate).toHaveBeenCalledWith({ kind: "send", id: "owner" });
});
it("does not offer requests to friends without a registry share grant", async () => {
  await render({ ...base, reason: "NOT_SHARED", canRequest: false });
  expect(JSON.stringify(tree.toJSON())).toContain("privacy.notShared");
  expect(tree.root.findAllByProps({ title: "friends.addFriend" })).toHaveLength(
    0,
  );
});
it("shows pending status and lets the sender cancel", async () => {
  await render({
    ...base,
    reason: "REQUEST_PENDING",
    canRequest: false,
    requestId: "request",
    requestDirection: "sent",
  });
  expect(JSON.stringify(tree.toJSON())).toContain("friends.sent");
  act(() =>
    tree.root.findByProps({ title: "friends.cancelRequest" }).props.onPress(),
  );
  expect(mockMutate).toHaveBeenCalledWith({ kind: "cancel", id: "request" });
});
it("lets the recipient approve an incoming request", async () => {
  await render({
    ...base,
    reason: "REQUEST_PENDING",
    canRequest: false,
    requestId: "request",
    requestDirection: "incoming",
  });
  act(() =>
    tree.root.findByProps({ title: "friends.acceptShort" }).props.onPress(),
  );
  expect(mockMutate).toHaveBeenCalledWith({ kind: "accept", id: "request" });
});
it("offers no identity or friend request when discovery is disabled", async () => {
  await render({ ...base, owner: null, canRequest: false });
  expect(tree.root.findAllByProps({ title: "search.profile" })).toHaveLength(0);
  expect(tree.root.findAllByProps({ title: "friends.addFriend" })).toHaveLength(
    0,
  );
});
