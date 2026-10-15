import React from "react";
import { SectionList, Text as mockText } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import RegistryScreen from "../index";
import { fetchRegistries, fetchRegistry } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("@/components/Loader/customLoader", () => ({
  LoadingScreen: () => null,
}));
jest.mock("@/hooks/useHeaderScrollState", () => ({
  useHeaderScrollState: () => () => {},
}));
jest.mock("@/screens/home/components/RegistryCard", () => () => null);
jest.mock("../components/RegistryHeader", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: ({ registry }: any) =>
      React.createElement(mockText, null, registry.title),
  };
});
jest.mock("../components/EmptyRegistry", () => () => null);
jest.mock("../components/RegistryItem", () => () => null);
jest.mock("@/utils/helper", () => ({ getEnArName: (name: string) => name }));
jest.mock("@/services/registries.service", () => ({
  fetchRegistries: jest.fn(),
  fetchRegistry: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@/store", () => {
  const { create } = jest.requireActual("zustand");
  return {
    useGlobalStore: create((set: any) => ({
      selectedRegistryId: undefined,
      setSelectedRegistryId: (selectedRegistryId: string) =>
        set({ selectedRegistryId }),
    })),
  };
});
const registries = [
  { id: "first", title: "First" },
  { id: "second", title: "Second" },
];
let tree: ReactTestRenderer;
let client: QueryClient;
const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
};
const render = async () => {
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <RegistryScreen />
      </QueryClientProvider>,
    );
  });
  await settle();
};
beforeEach(() => {
  jest.clearAllMocks();
  onlineManager.setOnline(true);
  (useGlobalStore as any).setState({ selectedRegistryId: undefined });
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  });
  (fetchRegistries as jest.Mock).mockResolvedValue(registries);
  (fetchRegistry as jest.Mock).mockImplementation(async (id: string) => ({
    id,
    title: `Loaded ${id}`,
    registryItems: { items: [] },
    _count: { totalItems: 0 },
  }));
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client.clear();
  onlineManager.setOnline(true);
});

it("loads the first registry immediately when selection is unset or invalid", async () => {
  (useGlobalStore as any).setState({ selectedRegistryId: "deleted" });
  await render();
  await settle();
  expect(fetchRegistry).toHaveBeenCalledWith("first");
  expect(fetchRegistry).not.toHaveBeenCalledWith("deleted");
  expect(
    tree.root.findByType(SectionList).props.ListHeaderComponent.props.registry
      .title,
  ).toBe("Loaded first");
});

it("preserves a valid selected registry when the list refreshes", async () => {
  (useGlobalStore as any).setState({ selectedRegistryId: "second" });
  await render();
  await settle();
  await act(async () => {
    client.setQueryData(["registries"], [...registries]);
  });
  expect(useGlobalStore.getState().selectedRegistryId).toBe("second");
  expect(fetchRegistry).toHaveBeenCalledWith("second");
});

it("shows Retry after a failed detail request and recovers without restarting the app", async () => {
  (fetchRegistry as jest.Mock).mockRejectedValueOnce({
    detail: "Network unavailable",
  });
  await render();
  await settle();
  expect(JSON.stringify(tree.toJSON())).toContain("registry.loadError");
  await act(async () =>
    tree.root.findByProps({ testID: "registry-retry" }).props.onPress(),
  );
  await settle();
  expect(
    tree.root.findByType(SectionList).props.ListHeaderComponent.props.registry
      .title,
  ).toBe("Loaded first");
});

it("shows a retry state when genuinely offline instead of reporting missing registry data", async () => {
  onlineManager.setOnline(false);
  await render();
  expect(JSON.stringify(tree.toJSON())).toContain("registry.loadError");
  expect(fetchRegistries).not.toHaveBeenCalled();
});
