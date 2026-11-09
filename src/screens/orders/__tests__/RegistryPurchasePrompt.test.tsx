import React from "react";
import { Text as mockText, View as mockView } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import RegistryPurchasePrompt from "../RegistryPurchasePrompt";
import { registryOrderGifts } from "@/utils/registry-purchase-context";
const mockPresent = jest.fn();
jest.mock("@/components/Commerce", () => ({ CommerceText: mockText }));
jest.mock("@/utils/helper", () => ({ getUserSub: () => "user" }));
jest.mock("@/utils/registry-purchase-context", () => ({
  registryOrderGifts: jest.fn(),
}));
jest.mock("@/services/registries.service", () => ({}));
jest.mock("@expo/vector-icons/Feather", () => () => null);
jest.mock("../RegistryOrderPurchaseSheet", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: React.forwardRef(function Sheet(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({ present: mockPresent }));
      return React.createElement(mockView, {
        testID: "grouped-sheet",
        gifts: props.gifts,
      });
    }),
  };
});
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("expo-router", () => ({
  useFocusEffect: (callback: () => void) => {
    jest.requireActual("react").useEffect(callback, [callback]);
  },
}));
let tree: ReactTestRenderer;
const gift = {
  registryId: "registry",
  registryTitle: "Baby",
  itemId: "item",
  productId: "product",
  quantity: 2,
};
const order = {
  id: "order",
  status: "PENDING",
  items: [{ productId: "product", quantity: 2 }],
} as any;
beforeEach(() => {
  jest.clearAllMocks();
  (registryOrderGifts as jest.Mock).mockReturnValue([gift]);
});
afterEach(async () => {
  await act(async () => tree?.unmount());
});
it("automatically presents one grouped sheet once for a registry order", async () => {
  await act(async () => {
    tree = create(<RegistryPurchasePrompt order={order} />);
  });
  expect(mockPresent).toHaveBeenCalledTimes(1);
  expect(
    tree.root.findAllByProps({ testID: "grouped-sheet" })[0].props.gifts,
  ).toEqual([gift]);
  await act(async () => tree.update(<RegistryPurchasePrompt order={order} />));
  expect(mockPresent).toHaveBeenCalledTimes(1);
});
it("offers a manual reopening from order details without automatically interrupting it", async () => {
  await act(async () => {
    tree = create(<RegistryPurchasePrompt order={order} autoPresent={false} />);
  });
  expect(mockPresent).not.toHaveBeenCalled();
  await act(async () =>
    tree.root
      .findAllByProps({ testID: "order-registry-open" })[0]
      .props.onPress(),
  );
  expect(mockPresent).toHaveBeenCalledTimes(1);
});
it.each(["CANCELLED", "unrelated"])(
  "does not present a sheet for a cancelled or ordinary order (%s)",
  async (status) => {
    await act(async () => {
      tree = create(
        <RegistryPurchasePrompt
          order={
            status === "CANCELLED"
              ? { ...order, status }
              : { ...order, items: [] }
          }
        />,
      );
    });
    expect(mockPresent).not.toHaveBeenCalled();
    expect(
      tree.root.findAllByProps({ testID: "registry-purchase-prompt" }),
    ).toHaveLength(0);
  },
);
