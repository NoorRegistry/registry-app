import React from "react";
import { Text as mockText } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import PersonScreen from "../person";
import type { PersonProfile } from "@/services/friends.service";
import { router } from "expo-router";
let mockProfile: PersonProfile;
const mockMutate = jest.fn();
jest.mock("@/services/friends.service", () => ({
  fetchPersonProfile: jest.fn(),
}));
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: mockProfile,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("@/components/Skeleton/layouts", () => ({
  ScreenSkeleton: () => null,
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => ({ id: "person" }),
  Stack: { Screen: () => null },
  Redirect: () => null,
}));
jest.mock("../hooks", () => ({
  useFriendsKey: () => ["friends", "viewer"],
  useRefreshOnFocus: jest.fn(),
}));
jest.mock("../actions", () => ({
  useFriendActions: () => ({ mutate: mockMutate, isPending: false }),
}));
jest.mock("../components", () => ({
  ActionButton: "ActionButton",
  ErrorState: () => null,
  FriendsTopBar: () => null,
  PersonAvatar: () => null,
  palette: { muted: "gray", line: "gray" },
  styles: {},
  personName: () => "Person",
}));
let tree: ReactTestRenderer;
beforeEach(() => {
  jest.clearAllMocks();
  mockProfile = {
    person: {
      id: "person",
      firstName: "Person",
      lastName: null,
      profileCode: "SS-0000-0001",
    },
    memberSince: null,
    connectedAt: null,
    relationship: "NONE",
    requestId: null,
    profileVisibility: "Public",
    canRequest: true,
    registries: [
      {
        id: "first",
        title: "Wedding registry",
        logo: null,
        category: { nameEn: "Wedding", nameAr: "زفاف" },
      },
      {
        id: "second",
        title: "Birthday registry",
        logo: null,
        category: { nameEn: "Birthday", nameAr: "ميلاد" },
      },
    ],
  };
});
afterEach(async () => {
  await act(async () => tree.unmount());
});
async function render() {
  await act(async () => {
    tree = create(<PersonScreen />);
  });
}
it("shows every returned public registry before becoming friends", async () => {
  await render();
  const text = JSON.stringify(tree.toJSON());
  expect(text).toContain("Wedding registry");
  expect(text).toContain("Birthday registry");
  expect(text).toContain("common.public");
  const row = tree.root.findAll(
    (node) =>
      node.props.accessibilityRole === "button" &&
      typeof node.props.onPress === "function",
  )[0];
  act(() => row.props.onPress());
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/registry/guest-view",
    params: { id: "first" },
  });
});
it("shows the private empty state and friend request without registry information", async () => {
  mockProfile.profileVisibility = "Private";
  mockProfile.registries = [];
  await render();
  expect(JSON.stringify(tree.toJSON())).toContain("privacy.noShared");
  expect(JSON.stringify(tree.toJSON())).not.toContain("Wedding registry");
  act(() => tree.root.findByProps({ title: "search.request" }).props.onPress());
  expect(mockMutate).toHaveBeenCalledWith({ kind: "send", id: "person" });
});
it("does not offer a new request when discovery is disabled", async () => {
  mockProfile.canRequest = false;
  await render();
  expect(tree.root.findAllByProps({ title: "search.request" })).toHaveLength(0);
});
