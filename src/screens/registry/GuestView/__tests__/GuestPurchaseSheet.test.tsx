import React from "react";
import {
  Text as mockText,
  TextInput as mockInput,
  View as mockView,
} from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import GuestPurchaseSheet from "../GuestPurchaseSheet";
import { postRegistryItemPurchase } from "@/services/registries.service";
import { queryClient } from "@/api/queryClient";
const mockDismiss = jest.fn();
let mockSubmitted: Promise<unknown>;
jest.mock("@/components/Commerce", () => ({ CommerceText: mockText }));
jest.mock("@/components/QtyButton", () => "QtyButton");
jest.mock("expo-image", () => ({ Image: "Image" }));
jest.mock("@/utils/helper", () => ({
  getUserFirstLastName: () => "Guest",
  getUserEmail: () => "guest@example.invalid",
  getEnArName: (name: string) => name,
  getImageUrl: (path: string) => path,
  formatPrice: (v: number) => String(v),
}));
jest.mock("@/services/registries.service", () => ({
  postRegistryItemPurchase: jest.fn(),
}));
jest.mock("@/api/queryClient", () => ({
  queryClient: {
    invalidateQueries: jest.fn().mockResolvedValue(undefined),
    resetQueries: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
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
    default: React.forwardRef(function Modal(props: any, ref: any) {
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
jest.mock("@tanstack/react-query", () => ({
  useMutation: (options: any) => ({
    isPending: false,
    mutate: () => {
      mockSubmitted = Promise.resolve(options.mutationFn()).then(
        options.onSuccess,
        options.onError,
      );
    },
  }),
}));
let tree: ReactTestRenderer;
const onRecorded = jest.fn();
const item = {
  id: "item",
  qty: 5,
  qtyLeft: 3,
  product: { id: "product", nameEn: "Gift", price: 10, images: [] },
} as any;
const field = (id: string) => tree.root.findAllByProps({ testID: id })[0];
async function mount(extra = {}) {
  await act(async () => {
    tree = create(
      <GuestPurchaseSheet
        registryId="registry"
        item={item}
        onRecorded={onRecorded}
        onDismiss={jest.fn()}
        {...extra}
      />,
    );
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  (postRegistryItemPurchase as jest.Mock).mockResolvedValue({});
});
afterEach(async () => {
  await act(async () => tree?.unmount());
});
it("reuses the purchase endpoint with prefilled identity and refreshes authoritative registry counts", async () => {
  await mount();
  await act(async () => {
    field("guest-purchase-save").props.onPress();
    await mockSubmitted;
  });
  expect(postRegistryItemPurchase).toHaveBeenCalledWith(
    expect.objectContaining({
      registryId: "registry",
      registryItemsId: "item",
      name: "Guest",
      email: "guest@example.invalid",
      qty: 1,
      platformOrderId: "",
    }),
  );
  expect(onRecorded).toHaveBeenCalledTimes(1);
  expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
    queryKey: ["registryGuestView"],
  });
  expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
    queryKey: ["registryById", "registry"],
  });
});
it("blocks invalid identity and keeps a failed save open for retry", async () => {
  await mount();
  await act(async () =>
    field("guest-purchase-email").props.onChangeText("invalid"),
  );
  await act(async () => field("guest-purchase-save").props.onPress());
  expect(postRegistryItemPurchase).not.toHaveBeenCalled();
  await act(async () =>
    field("guest-purchase-email").props.onChangeText("guest@example.invalid"),
  );
  (postRegistryItemPurchase as jest.Mock).mockRejectedValue({ status: 500 });
  await act(async () => {
    field("guest-purchase-save").props.onPress();
    await mockSubmitted;
  });
  expect(mockDismiss).not.toHaveBeenCalled();
  expect(onRecorded).not.toHaveBeenCalled();
});
it("caps confirmation to both ordered and still-needed units, and includes the order reference", async () => {
  await mount({ initialQty: 9, quantityLimit: 2, orderId: "order" });
  expect(tree.root.findByType("QtyButton" as any).props.qty).toBe(2);
  await act(async () =>
    tree.root.findByType("QtyButton" as any).props.updateQty(100),
  );
  await act(async () => {
    field("guest-purchase-save").props.onPress();
    await mockSubmitted;
  });
  expect(postRegistryItemPurchase).toHaveBeenCalledWith(
    expect.objectContaining({
      qty: 2,
      platform: "Simplist",
      platformOrderId: "order",
    }),
  );
});
it("rechecks access and quantities on a stale purchase conflict", async () => {
  await mount();
  (postRegistryItemPurchase as jest.Mock).mockRejectedValue({ status: 409 });
  await act(async () => {
    field("guest-purchase-save").props.onPress();
    await mockSubmitted;
  });
  expect(mockDismiss).toHaveBeenCalled();
  expect(queryClient.resetQueries).toHaveBeenCalledWith({
    queryKey: ["registryGuestView"],
  });
  expect(onRecorded).not.toHaveBeenCalled();
});
