import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text as mockText,
} from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CartScreen from "../index";
import { fetchCheckoutQuote } from "@/services/orders.service";
let mockCart: any;
jest.mock("@/hooks/useCart", () => ({
  useCart: () => mockCart,
  useCartActions: () => ({ isPending: false, mutate: jest.fn() }),
}));
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("@/screens/friends/hooks", () => ({
  useRefreshOnFocus: () => undefined,
}));
jest.mock("@/services/orders.service", () => ({
  fetchCheckoutQuote: jest.fn(),
}));
jest.mock("@/utils/helper", () => ({
  getUserSub: () => "customer",
  formatPrice: (v: number) => String(v),
  getEnArName: (v: string) => v,
  getImageUrl: (v: string) => v,
}));
jest.mock("@expo/vector-icons/Ionicons", () => () => null);
jest.mock("react-native-worklets", () =>
  jest.requireActual("react-native-worklets/lib/module/mock"),
);
jest.mock("react-native-reanimated", () =>
  jest.requireActual("react-native-reanimated/mock"),
);
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (v: string) => v,
    i18n: { language: "en", dir: () => "ltr" },
  }),
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));
let tree: ReactTestRenderer;
let client: QueryClient;
const ui = () => (
  <QueryClientProvider client={client}>
    <CartScreen />
  </QueryClientProvider>
);
const settle = async () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 30));
  });
beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  mockCart = {
    data: {
      itemCount: 1,
      items: [],
      hasUnavailableItems: false,
      subtotal: 24,
      currencyCode: "KWD",
    },
    dataUpdatedAt: 1,
    isError: false,
    isPending: false,
    fetchStatus: "idle",
    isFetching: false,
    isRefetching: false,
    refetch: jest.fn(),
  };
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client.clear();
});
it("blocks checkout until a current backend quote arrives after the cart changes", async () => {
  (fetchCheckoutQuote as jest.Mock).mockResolvedValueOnce({
    subtotal: 24,
    deliveryFee: 2,
    total: 26,
    currencyCode: "KWD",
  });
  await act(async () => {
    tree = create(ui());
  });
  await settle();
  expect(
    tree.root.findByProps({ testID: "cart-checkout" }).props.disabled,
  ).toBe(false);
  let finish: (data: any) => void = () => undefined;
  (fetchCheckoutQuote as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  mockCart = {
    ...mockCart,
    dataUpdatedAt: 2,
    data: { ...mockCart.data, itemCount: 2, subtotal: 48 },
  };
  await act(async () => {
    tree.update(ui());
  });
  expect(
    tree.root.findByProps({ testID: "cart-checkout" }).props.disabled,
  ).toBe(true);
  await act(async () => {
    finish({ subtotal: 48, deliveryFee: 2, total: 50, currencyCode: "KWD" });
  });
  await settle();
  expect(
    tree.root.findByProps({ testID: "cart-checkout" }).props.disabled,
  ).toBe(false);
  expect(fetchCheckoutQuote).toHaveBeenCalledTimes(2);
});
it("does not permit checkout when totals cannot load", async () => {
  (fetchCheckoutQuote as jest.Mock).mockRejectedValueOnce(new Error("Offline"));
  await act(async () => {
    tree = create(ui());
  });
  await settle();
  expect(
    tree.root.findByProps({ testID: "cart-checkout" }).props.disabled,
  ).toBe(true);
  expect(
    tree.root
      .findAllByType(mockText)
      .some((node) => node.props.children === "cart.quoteError"),
  ).toBe(true);
});

it("shows the cart skeleton until items arrive, then skeleton totals until the quote arrives", async () => {
  let finish: (data: any) => void = () => undefined;
  (fetchCheckoutQuote as jest.Mock).mockImplementationOnce(
    () => new Promise((resolve) => (finish = resolve)),
  );
  const loadedCart = mockCart;
  mockCart = {
    ...mockCart,
    data: undefined,
    isPending: true,
    fetchStatus: "fetching",
    isFetching: true,
  };
  await act(async () => {
    tree = create(ui());
  });
  expect(tree.root.findByProps({ testID: "cart-skeleton" })).toBeDefined();
  expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(0);
  expect(fetchCheckoutQuote).not.toHaveBeenCalled();

  mockCart = loadedCart;
  await act(async () => {
    tree.update(ui());
  });
  expect(tree.root.findAllByProps({ testID: "cart-skeleton" })).toHaveLength(0);
  expect(
    tree.root.findByProps({ testID: "cart-summary-skeleton" }),
  ).toBeDefined();
  expect(
    tree.root.findByProps({ testID: "cart-total-skeleton" }),
  ).toBeDefined();
  expect(
    tree.root.findByProps({ testID: "cart-checkout" }).props.disabled,
  ).toBe(true);
  expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(0);

  await act(async () => {
    finish({ subtotal: 24, deliveryFee: 2, total: 26, currencyCode: "KWD" });
  });
  await settle();
  expect(
    tree.root.findAllByProps({ testID: "cart-summary-skeleton" }),
  ).toHaveLength(0);
  expect(
    tree.root.findAllByProps({ testID: "cart-total-skeleton" }),
  ).toHaveLength(0);
  expect(
    tree.root.findByProps({ testID: "cart-checkout" }).props.disabled,
  ).toBe(false);
});

it("keeps navigation refetches quiet and only shows a refresh spinner for a pull gesture", async () => {
  (fetchCheckoutQuote as jest.Mock).mockResolvedValueOnce({
    subtotal: 24,
    deliveryFee: 2,
    total: 26,
    currencyCode: "KWD",
  });
  let finish: (data: any) => void = () => undefined;
  mockCart = {
    ...mockCart,
    isFetching: true,
    isRefetching: true,
    refetch: jest.fn(() => new Promise((resolve) => (finish = resolve))),
  };
  await act(async () => {
    tree = create(ui());
  });
  await settle();
  expect(tree.root.findByType(RefreshControl).props.refreshing).toBe(false);
  expect(
    tree.root.findByProps({ testID: "cart-checkout" }).props.disabled,
  ).toBe(true);

  let refresh: Promise<unknown>;
  await act(async () => {
    refresh = tree.root.findByType(RefreshControl).props.onRefresh();
  });
  expect(tree.root.findByType(RefreshControl).props.refreshing).toBe(true);
  expect(mockCart.refetch).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish({ data: mockCart.data });
    await refresh;
  });
  expect(tree.root.findByType(RefreshControl).props.refreshing).toBe(false);
});
