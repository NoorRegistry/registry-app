import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { router } from "expo-router";
import RegistryOverviewScreen from "..";
import {
  fetchRegistries,
  fetchSharedRegistries,
} from "@/services/registries.service";
import type { IRegistry } from "@/types";
import { useGlobalStore } from "@/store";

const mockSelectPhoto = jest.fn();
jest.mock("@/components/Commerce", () => ({ CommerceText: "Text" }));
jest.mock("@/components/RegistryAvatar", () => "Avatar");
jest.mock("@/components/Skeleton/layouts", () => ({
  ListSkeleton: "Skeleton",
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
}));
jest.mock("@expo/vector-icons/Feather", () => "Icon");
jest.mock("@/hooks/useRegistryPhoto", () => ({
  useRegistryPhoto: () => ({
    selectPhoto: mockSelectPhoto,
    isUploading: false,
  }),
}));
jest.mock("@/hooks/useNotifications", () => ({
  useNotificationSummary: () => ({ data: { unreadCount: 2 } }),
}));
jest.mock("../resources", () => ({
  EmptyState: ({ title }: { title: string }) => {
    const React = jest.requireActual("react");
    return React.createElement("EmptyState", { title });
  },
  OverviewActivity: "Activity",
  OverviewIdeas: "Ideas",
  OverviewGuides: "Guides",
}));
jest.mock("@/utils/helper", () => ({
  getUserSub: () => "viewer",
  getUserFirstName: () => "Noor",
}));
jest.mock("@/services/registries.service", () => ({
  fetchRegistries: jest.fn(),
  fetchSharedRegistries: jest.fn(),
}));
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useFocusEffect: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
jest.mock("@/store", () => {
  const { create } = jest.requireActual("zustand");
  return {
    useGlobalStore: create((set: any) => ({
      selectedRegistryId: "4",
      setSelectedRegistryId: (selectedRegistryId: string) =>
        set({ selectedRegistryId }),
    })),
  };
});

const rows = Array.from({ length: 5 }, (_, index) => ({
  id: String(index),
  title: `Registry ${index}`,
  isActive: true,
  logo: "",
  category: { nameEn: "Baby" },
  _count: { totalItems: 10, totalPurchased: 2 },
})) as IRegistry[];
const sharedRows = [{ ...rows[0], id: "shared", ownerName: "Lina Ahmed" }];
let tree: ReactTestRenderer;
let client: QueryClient;
const settle = async () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
const press = async (id: string) =>
  act(async () => {
    tree.root
      .findAll(
        (node) =>
          node.props.testID === id && typeof node.props.onPress === "function",
      )[0]
      .props.onPress();
  });
const cards = () =>
  tree.root.findAll(
    (node) =>
      node.props.testID?.startsWith("overview-registry-open-") &&
      typeof node.props.onPress === "function",
  );
async function render(data: IRegistry[] | null = rows) {
  if (data) client.setQueryData(["registries"], data);
  client.setQueryData(
    ["friends", "viewer", "en", "registry-overview"],
    sharedRows,
  );
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <RegistryOverviewScreen />
      </QueryClientProvider>,
    );
  });
  await settle();
}
beforeEach(() => {
  jest.clearAllMocks();
  onlineManager.setOnline(true);
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  });
  (fetchRegistries as jest.Mock).mockResolvedValue(rows);
  (fetchSharedRegistries as jest.Mock).mockResolvedValue(sharedRows);
  (useGlobalStore as any).setState({ selectedRegistryId: "4" });
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client.clear();
  onlineManager.setOnline(true);
});

it("starts on the overview with three registries even when a different registry was selected", async () => {
  await render();
  expect(cards().map((node) => node.props.testID)).toEqual([
    "overview-registry-open-0",
    "overview-registry-open-1",
    "overview-registry-open-2",
  ]);
  expect(tree.root.findAllByType("Activity" as any)).toHaveLength(1);
  expect(router.push).not.toHaveBeenCalled();
  await press("overview-view-more");
  expect(cards()).toHaveLength(5);
  expect(
    tree.root.findAll(
      (node) =>
        node.props.testID === "overview-view-more" && node.props.onPress,
    )[0].props.accessibilityState.expanded,
  ).toBe(true);
  await press("overview-ownership-shared");
  expect(cards()).toHaveLength(1);
  expect(
    tree.root.findAll(
      (node) => node.props.testID === "overview-registry-photo-shared",
    ),
  ).toHaveLength(0);
  await press("overview-registry-open-shared");
  expect(router.push).toHaveBeenLastCalledWith({
    pathname: "/(protected)/registry/guest-view",
    params: { id: "shared" },
  });
  expect(useGlobalStore.getState().selectedRegistryId).toBe("4");
  await press("overview-ownership-yours");
  expect(cards()).toHaveLength(5);
  await press("overview-view-more");
  expect(cards()).toHaveLength(3);
});

it.each([0, 1, 3])(
  "keeps the %s-registry user on the overview without an expansion control",
  async (count) => {
    await render(rows.slice(0, count));
    expect(cards()).toHaveLength(count);
    expect(
      tree.root.findAll((node) => node.props.testID === "overview-view-more"),
    ).toHaveLength(0);
    expect(router.push).not.toHaveBeenCalled();
    if (!count)
      expect(tree.root.findByType("EmptyState" as any).props.title).toBe(
        "registry.noRegistries",
      );
  },
);

it("uploads from the photo target without opening a registry, then opens the exact tapped registry", async () => {
  await render();
  await press("overview-registry-photo-1");
  expect(mockSelectPhoto).toHaveBeenCalledTimes(1);
  expect(router.push).not.toHaveBeenCalled();
  expect(
    tree.root
      .findAllByType("Avatar" as any)
      .every((node) => node.props.category.nameEn === "Baby"),
  ).toBe(true);
  await press("overview-registry-open-1");
  expect(useGlobalStore.getState().selectedRegistryId).toBe("1");
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/(protected)/registry/[id]",
    params: { id: "1" },
  });
});

it("switches resources without losing expanded registries and links create and notifications", async () => {
  await render();
  await press("overview-view-more");
  await press("overview-resource-ideas");
  expect(tree.root.findAllByType("Ideas" as any)).toHaveLength(1);
  expect(tree.root.findAllByType("Activity" as any)).toHaveLength(0);
  await press("overview-resource-guides");
  expect(tree.root.findAllByType("Guides" as any)).toHaveLength(1);
  expect(cards()).toHaveLength(5);
  await press("overview-create-registry");
  expect(router.push).toHaveBeenLastCalledWith("/(protected)/registry/create");
  await press("overview-notifications");
  expect(router.push).toHaveBeenLastCalledWith("/notifications");
});

it("does not count inactive registries toward the three visible registries", async () => {
  await render([{ ...rows[0], isActive: false }, ...rows.slice(1)]);
  expect(cards().map((node) => node.props.testID)).toEqual([
    "overview-registry-open-1",
    "overview-registry-open-2",
    "overview-registry-open-3",
  ]);
});

it("shows a retry state rather than an empty registry list when offline", async () => {
  onlineManager.setOnline(false);
  await render(null);
  expect(
    tree.root.findAll(
      (node) =>
        node.props.testID?.startsWith("overview-registry-open-") &&
        node.props.onPress,
    ),
  ).toHaveLength(0);
  expect(
    tree.root.findAll(
      (node) =>
        node.type === ("Text" as any) &&
        node.props.children === "homeDesign.retry",
    ).length,
  ).toBeGreaterThan(0);
});
