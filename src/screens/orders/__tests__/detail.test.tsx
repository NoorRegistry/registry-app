import React from "react";
import { ActivityIndicator, Text as mockText } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import OrderDetailScreen from "../detail";
import { fetchOrder } from "@/services/orders.service";

jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("@/hooks/useAddresses", () => ({
  addressLine: () => "Test address",
}));
jest.mock("@/screens/friends/components", () => ({
  FriendsTopBar: () => null,
  palette: { accent: "#C78063" },
  styles: { screen: { flex: 1 } },
}));
jest.mock("@/screens/friends/hooks", () => ({
  useRefreshOnFocus: () => undefined,
}));
jest.mock("@/services/orders.service", () => ({ fetchOrder: jest.fn() }));
jest.mock("@/utils/helper", () => ({
  getUserSub: () => "customer",
  formatPrice: (value: number) => String(value),
  getEnArName: (name: string) => name,
  getImageUrl: (path: string) => path,
}));
jest.mock("@expo/vector-icons/Ionicons", () => () => null);
jest.mock("@expo/vector-icons/Feather", () => () => null);
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "demo-order" }),
  router: {},
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", dir: () => "ltr" },
  }),
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

let tree: ReactTestRenderer | undefined;
let client: QueryClient;
const render = async () => {
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <OrderDetailScreen />
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  onlineManager.setOnline(true);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client.clear();
  onlineManager.setOnline(true);
});
it("shows retry after a failed request and loads the order when retried", async () => {
  (fetchOrder as jest.Mock).mockRejectedValueOnce(
    new Error("Network unavailable"),
  );
  await render();
  expect(tree!.root.findAllByType(ActivityIndicator)).toHaveLength(0);
  expect(
    tree!.root
      .findAllByType(mockText)
      .map((node) => node.props.children)
      .flat()
      .join(" "),
  ).toContain("orders.loadFailed");
  (fetchOrder as jest.Mock).mockResolvedValueOnce({
    id: "demo-order",
    reference: "SS-123456789",
    status: "DELIVERED",
    createdAt: new Date().toISOString(),
    items: [],
    shippingAddress: {},
    subtotal: 1,
    deliveryFee: 2,
    total: 3,
    paymentStatus: "PAID",
  });
  await act(async () =>
    tree!.root.findByProps({ testID: "order-retry" }).props.onPress(),
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(
    tree!.root
      .findAllByType(mockText)
      .map((node) => node.props.children)
      .flat()
      .join(" "),
  ).toContain("orders.status.DELIVERED");
  expect(fetchOrder).toHaveBeenCalledTimes(2);
});
it("shows retry instead of an endless spinner while offline", async () => {
  onlineManager.setOnline(false);
  await render();
  expect(fetchOrder).not.toHaveBeenCalled();
  expect(tree!.root.findAllByType(ActivityIndicator)).toHaveLength(0);
  expect(
    tree!.root
      .findAllByType(mockText)
      .map((node) => node.props.children)
      .flat()
      .join(" "),
  ).toContain("orders.loadFailed");
});

it("does not imply delivery progress or payment due for a cancelled order", async () => {
  (fetchOrder as jest.Mock).mockResolvedValueOnce({
    id: "demo-order",
    reference: "SS-123456789",
    status: "CANCELLED",
    createdAt: new Date().toISOString(),
    items: [],
    shippingAddress: {},
    subtotal: 1,
    deliveryFee: 2,
    total: 3,
    paymentStatus: "UNPAID",
  });
  await render();
  expect(tree!.root.findAllByProps({ testID: "order-progress" })).toHaveLength(
    0,
  );
  expect(
    tree!.root
      .findAllByType(mockText)
      .map((node) => node.props.children)
      .flat()
      .join(" "),
  ).toContain("orders.status.CANCELLED");
  expect(
    tree!.root
      .findAllByType(mockText)
      .map((node) => node.props.children)
      .flat()
      .join(" "),
  ).not.toContain("orders.unpaid");
});
it("marks the saved dispatch stage as current while delivery is still pending", async () => {
  (fetchOrder as jest.Mock).mockResolvedValueOnce({
    id: "demo-order",
    reference: "SS-123456789",
    status: "DISPATCHED",
    createdAt: new Date().toISOString(),
    items: [],
    shippingAddress: {},
    subtotal: 1,
    deliveryFee: 2,
    total: 3,
    paymentStatus: "UNPAID",
  });
  await render();
  expect(
    tree!.root.findByProps({ testID: "order-step-DISPATCHED" }).props
      .accessibilityState.selected,
  ).toBe(true);
  expect(
    tree!.root.findByProps({ testID: "order-step-DELIVERED" }).props
      .accessibilityState.selected,
  ).toBe(false);
});
