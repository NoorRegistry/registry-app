import React from "react";
import {
  ActivityIndicator,
  Text as mockText,
  View as mockView,
} from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/queryClient";
import {
  addItemToRegistry,
  fetchRegistries,
} from "@/services/registries.service";
import { IProduct, IRegistry } from "@/types";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { useAddProductToRegistry } from "../useAddProductToRegistry";

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockTranslation = (key: string, values?: { count: number }) =>
  values ? `${values.count} items` : key;
jest.mock("@/api/queryClient", () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));
jest.mock("@/services/registries.service", () => ({
  addItemToRegistry: jest.fn(),
  fetchRegistries: jest.fn(),
}));
jest.mock("@/components/Commerce", () => ({ CommerceText: mockText }));
jest.mock("@expo/vector-icons/Feather", () => "icon");
jest.mock("expo-image", () => ({ Image: "product-image" }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/utils/helper", () => ({
  formatPrice: (price: number) => `KWD ${price.toFixed(2)}`,
  getEnArName: (en: string) => en,
  getImageUrl: (path: string) => path,
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockTranslation,
    i18n: { language: "en", dir: () => "ltr" },
  }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 12 }),
}));
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));
jest.mock("@gorhom/bottom-sheet", () => {
  const React = jest.requireActual("react");
  return {
    BottomSheetBackdrop: () => null,
    BottomSheetFooter: mockView,
    BottomSheetFlatList: (props: any) =>
      React.createElement(
        mockView,
        null,
        props.ListHeaderComponent,
        props.data.length
          ? props.data.map((item: any, index: number) =>
              React.createElement(
                React.Fragment,
                { key: item.id },
                index > 0 && React.createElement(props.ItemSeparatorComponent),
                props.renderItem({ item }),
              ),
            )
          : props.ListEmptyComponent,
        props.ListFooterComponent,
      ),
  };
});
jest.mock("@/components/BottomSheet/AppBottomSheetModal", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: React.forwardRef(function MockModal(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: () => {
          mockDismiss();
          props.onDismiss();
        },
      }));
      return React.createElement(
        mockView,
        null,
        props.children,
        props.footerComponent({}),
      );
    }),
  };
});

const product: IProduct = {
  id: "lamp",
  nameEn: "Pleated table lamp",
  nameAr: "مصباح",
  price: 25,
  currencyCode: "KWD",
  qty: 1,
  images: [{ id: "photo", path: "/lamp.png" }],
  store: { id: "store", nameEn: "The Home Edit", nameAr: "المتجر" },
};
const registries: IRegistry[] = [
  {
    id: "wedding",
    title: "Our wedding",
    logo: "",
    isActive: true,
    category: { nameEn: "Wedding" },
    _count: { totalItems: 24, totalPurchased: 0 },
  },
  {
    id: "home",
    title: "Our first home",
    logo: "",
    isActive: true,
    category: { nameEn: "Housewarming" },
    _count: { totalItems: 12, totalPurchased: 0 },
  },
];
let tree: ReactTestRenderer;
let client: QueryClient;
function Harness({ currentProduct = product }: { currentProduct?: IProduct }) {
  const { addedToRegistryOverlay, ...actions } =
    useAddProductToRegistry(currentProduct);
  return (
    <>
      {React.createElement("registry-control", actions)}
      {addedToRegistryOverlay}
    </>
  );
}
const control = () => tree.root.findByType("registry-control" as any);
const field = (testID: string) => tree.root.findAllByProps({ testID })[0];
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
}
async function render(data: IRegistry[] | null = registries) {
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  if (data) client.setQueryData(["registries"], data);
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
}
async function open() {
  await act(async () => control().props.addProductToRegistry());
}
async function select(id = "home") {
  await act(async () => field(`registry-add-option-${id}`).props.onPress());
}
async function confirm() {
  await act(async () => field("registry-add-confirm").props.onPress());
  await flush();
}
beforeEach(() => {
  jest.clearAllMocks();
  (fetchRegistries as jest.Mock).mockResolvedValue(registries);
  (addItemToRegistry as jest.Mock).mockImplementation(async (payload) => ({
    id: "item",
    qty: 1,
    registry: registries.find((r) => r.id === payload.registryId),
  }));
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client?.clear();
});

it.each([1, 2])(
  "requires explicit selection and confirmation with %s registries",
  async (count) => {
    await render(registries.slice(0, count));
    expect(fetchRegistries).not.toHaveBeenCalled();
    await open();
    expect(mockPresent).toHaveBeenCalledTimes(1);
    expect(field("registry-add-confirm").props.disabled).toBe(true);
    expect(addItemToRegistry).not.toHaveBeenCalled();
    await select(count === 1 ? "wedding" : "home");
    expect(field("registry-add-confirm").props.disabled).toBe(false);
    expect(addItemToRegistry).not.toHaveBeenCalled();
    await confirm();
    const registry = registries[count - 1];
    expect(addItemToRegistry).toHaveBeenCalledTimes(1);
    expect(addItemToRegistry).toHaveBeenCalledWith({
      productId: product.id,
      qty: 1,
      registryId: registry.id,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["registryById", registry.id],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["registries"],
    });
    expect(mockDismiss).toHaveBeenCalledTimes(1);
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: "registryAdded", text2: registry.title }),
    );
    await open();
    expect(field("registry-add-confirm").props.disabled).toBe(true);
  },
);

it("shows loading, locks selection, and prevents duplicate submissions", async () => {
  let resolve!: (value: unknown) => void;
  (addItemToRegistry as jest.Mock).mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  await render();
  await open();
  await select();
  await act(async () => {
    const onPress = field("registry-add-confirm").props.onPress;
    onPress();
    onPress();
  });
  await flush();
  expect(addItemToRegistry).toHaveBeenCalledTimes(1);
  expect(field("registry-add-confirm").props.accessibilityState).toEqual({
    disabled: true,
    busy: true,
  });
  expect(field("registry-add-close").props.disabled).toBe(true);
  expect(field("registry-add-option-wedding").props.disabled).toBe(true);
  expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  expect(Toast.show).not.toHaveBeenCalled();
  await act(async () => resolve({ id: "item", registry: registries[1] }));
  await flush();
  expect(Toast.show).toHaveBeenCalledTimes(1);
});

it("keeps the selection after failure and retries only when confirmed again", async () => {
  (addItemToRegistry as jest.Mock).mockRejectedValueOnce({
    detail: "Network unavailable",
  });
  await render();
  await open();
  await select();
  await confirm();
  expect(mockDismiss).not.toHaveBeenCalled();
  expect(Toast.show).not.toHaveBeenCalled();
  expect(
    field("registry-add-option-home").props.accessibilityState.checked,
  ).toBe(true);
  expect(field("registry-add-confirm").props.disabled).toBe(false);
  expect(
    tree.root.findAllByProps({ children: "registry.addItemError" }).length,
  ).toBeGreaterThan(0);
  await confirm();
  expect(addItemToRegistry).toHaveBeenCalledTimes(2);
  expect(Toast.show).toHaveBeenCalledWith(
    expect.objectContaining({ text2: "Our first home" }),
  );
});

it("cancels without writing and captures the product that opened the picker", async () => {
  await render();
  await open();
  await select();
  await act(async () => field("registry-add-close").props.onPress());
  expect(addItemToRegistry).not.toHaveBeenCalled();
  expect(Toast.show).not.toHaveBeenCalled();
  await open();
  await select();
  await act(async () =>
    tree.update(
      <QueryClientProvider client={client}>
        <Harness currentProduct={{ ...product, id: "another-product" }} />
      </QueryClientProvider>,
    ),
  );
  await confirm();
  expect(addItemToRegistry).toHaveBeenCalledWith(
    expect.objectContaining({ productId: "lamp" }),
  );
});

it("allows retrying a failed registry load inside the picker", async () => {
  (fetchRegistries as jest.Mock).mockRejectedValueOnce(new Error("Offline"));
  await render(null);
  await open();
  await flush();
  expect(field("registry-add-confirm").props.disabled).toBe(true);
  expect(
    tree.root.findAllByProps({ children: "registry.registriesLoadError" })
      .length,
  ).toBeGreaterThan(0);
  const retry = tree.root.findAll(
    (node) =>
      node.props.accessibilityRole === "button" &&
      node.findAllByProps({ children: "cart.retry" }).length > 0,
  )[0];
  await act(async () => retry.props.onPress());
  await flush();
  expect(field("registry-add-option-home")).toBeDefined();
  expect(addItemToRegistry).not.toHaveBeenCalled();
});

it("opens registry creation only after dismissing an empty picker", async () => {
  await render([]);
  await open();
  const createRegistry = tree.root.findAll(
    (node) =>
      node.props.accessibilityRole === "button" &&
      node.findAllByProps({ children: "registry.newRegistry" }).length > 0,
  )[0];
  await act(async () => createRegistry.props.onPress());
  expect(mockDismiss).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith("/(protected)/registry/create");
  expect(addItemToRegistry).not.toHaveBeenCalled();
});
