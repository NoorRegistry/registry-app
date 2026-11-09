import React from "react";
import {
  Text as mockText,
  TextInput as mockInput,
  View as mockView,
} from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegistryOrderPurchaseSheet, {
  RegistryOrderPurchaseSheetHandle,
} from "../RegistryOrderPurchaseSheet";
import {
  fetchRegistryGuestView,
  fetchRegistryOrderPurchases,
  postRegistryItemPurchase,
} from "@/services/registries.service";
import { dismissRegistryOrderGift } from "@/utils/registry-purchase-context";
const mockDismiss = jest.fn();
jest.mock("@/components/Commerce", () => ({ CommerceText: mockText }));
jest.mock("@/components/QtyButton", () => "QtyButton");
jest.mock("@expo/vector-icons/Feather", () => () => null);
jest.mock("expo-image", () => ({ Image: "Image" }));
jest.mock("@/utils/helper", () => ({
  getUserSub: () => "user",
  getUserFirstLastName: () => "Guest",
  getUserEmail: () => "guest@example.invalid",
  getEnArName: (name: string) => name,
  getImageUrl: (path: string) => path,
}));
jest.mock("@/services/registries.service", () => ({
  fetchRegistryGuestView: jest.fn(),
  fetchRegistryOrderPurchases: jest.fn(),
  postRegistryItemPurchase: jest.fn(),
}));
jest.mock("@/utils/registry-purchase-context", () => ({
  dismissRegistryOrderGift: jest.fn(),
}));
jest.mock("@/api/queryClient", () => ({
  queryClient: { invalidateQueries: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options: any) =>
      options?.count === undefined ? key : `${key}:${options.count}`,
    i18n: { language: "en", dir: () => "ltr" },
  }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetBackdrop: () => null,
  BottomSheetFooter: mockView,
  BottomSheetScrollView: mockView,
  BottomSheetTextInput: mockInput,
}));
jest.mock("@/components/BottomSheet/AppBottomSheetModal", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: React.forwardRef(function Sheet(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: mockDismiss,
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
const gifts = [
  {
    registryId: "lina",
    registryTitle: "Lina",
    itemId: "mattress",
    productId: "product-a",
    quantity: 2,
  },
  {
    registryId: "noor",
    registryTitle: "Noor",
    itemId: "coffee",
    productId: "product-b",
    quantity: 1,
  },
];
const order = {
  id: "order",
  status: "PENDING",
  items: [
    {
      productId: "product-a",
      quantity: 2,
      nameEn: "Mattress",
      storeNameEn: "Babyletto",
      image: null,
    },
    {
      productId: "product-b",
      quantity: 1,
      nameEn: "Coffee",
      storeNameEn: "Home",
      image: null,
    },
  ],
} as any;
let tree: ReactTestRenderer;
let client: QueryClient;
const ref = React.createRef<RegistryOrderPurchaseSheetHandle>();
const field = (id: string) => tree.root.findAllByProps({ testID: id })[0];
const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
};
beforeEach(async () => {
  jest.clearAllMocks();
  client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false, gcTime: Infinity },
      queries: { retry: false, gcTime: Infinity },
    },
  });
  (fetchRegistryOrderPurchases as jest.Mock).mockResolvedValue([]);
  (fetchRegistryGuestView as jest.Mock).mockImplementation(async (id) => ({
    id,
    title: id,
    isOwner: false,
    registryItems: {
      items: [
        {
          data: [
            {
              id: id === "lina" ? "mattress" : "coffee",
              product: { id: id === "lina" ? "product-a" : "product-b" },
              qtyLeft: 3,
            },
          ],
        },
      ],
    },
  }));
  (postRegistryItemPurchase as jest.Mock).mockResolvedValue({});
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <RegistryOrderPurchaseSheet
          ref={ref}
          order={order}
          gifts={gifts}
          onRemainingChange={jest.fn()}
        />
      </QueryClientProvider>,
    );
  });
  await act(async () => ref.current!.present());
  await settle();
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client.clear();
});
it("prefills identity, supports choosing one gift, and caps editable quantity", async () => {
  expect(field("order-registry-name").props.value).toBe("Guest");
  await act(async () => {
    field("order-gift-select-coffee").props.onPress();
    tree.root.findByType("QtyButton" as any).props.updateQty(100);
  });
  expect(tree.root.findByType("QtyButton" as any).props.qty).toBe(2);
  await act(async () => field("order-registry-confirm").props.onPress());
  await settle();
  expect(postRegistryItemPurchase).toHaveBeenCalledTimes(1);
  expect(postRegistryItemPurchase).toHaveBeenCalledWith(
    expect.objectContaining({ registryId: "lina", qty: 2 }),
  );
  expect(field("order-registry-result").props.children).toBe(
    "registry.giftsMarked:1",
  );
});
it("shows independent successful and failed rows, and retries only the remaining gift", async () => {
  (postRegistryItemPurchase as jest.Mock).mockImplementation(
    async (payload) => {
      if (payload.registryId === "noor") throw { detail: "Offline" };
      return {};
    },
  );
  await act(async () => field("order-registry-confirm").props.onPress());
  await settle();
  expect(field("order-gift-saved-mattress")).toBeDefined();
  expect(field("order-gift-error-coffee")).toBeDefined();
  (fetchRegistryOrderPurchases as jest.Mock).mockResolvedValue([
    { registryId: "lina", registryItemsId: "mattress", qty: 2 },
  ]);
  (postRegistryItemPurchase as jest.Mock).mockResolvedValue({});
  await act(async () => field("order-registry-confirm").props.onPress());
  await settle();
  expect(
    (postRegistryItemPurchase as jest.Mock).mock.calls.map(
      ([payload]) => payload.registryId,
    ),
  ).toEqual(["lina", "noor", "noor"]);
  expect(field("order-registry-result").props.children).toBe(
    "registry.registriesUpdated:2",
  );
});
it("blocks invalid email and duplicate rapid submits", async () => {
  await act(async () =>
    field("order-registry-email").props.onChangeText("invalid"),
  );
  await act(async () => field("order-registry-confirm").props.onPress());
  expect(postRegistryItemPurchase).not.toHaveBeenCalled();
  await act(async () =>
    field("order-registry-email").props.onChangeText("guest@example.invalid"),
  );
  await act(async () => {
    field("order-registry-confirm").props.onPress();
    field("order-registry-confirm").props.onPress();
  });
  await settle();
  expect(postRegistryItemPurchase).toHaveBeenCalledTimes(2);
});
it("defers without discarding pending gift attribution", async () => {
  await act(async () => field("order-registry-not-now").props.onPress());
  expect(mockDismiss).toHaveBeenCalled();
  expect(dismissRegistryOrderGift).not.toHaveBeenCalled();
  expect(postRegistryItemPurchase).not.toHaveBeenCalled();
});
