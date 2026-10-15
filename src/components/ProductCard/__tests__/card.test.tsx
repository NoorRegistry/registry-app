import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { StyleSheet, Text as mockText, TouchableOpacity } from "react-native";
import ProductCard from "..";
import type { IProduct } from "@/types";

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockAddToCart = jest.fn();
const mockAddToRegistry = jest.fn();
let mockFontScale = 1;
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, fontScale: mockFontScale }),
}));
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("@/components/Loader/customLoader", () => () => null);
jest.mock("@expo/vector-icons/Ionicons", () => "icon");
jest.mock("../../icons/greenplusCircle", () => ({
  GreenPlusCircleIcon: () => null,
}));
jest.mock("@/utils/helper", () => ({
  formatPrice: (price: number) => `KWD ${price.toFixed(3)}`,
  getEnArName: (en: string) => en,
  getImageUrl: (path: string) => path,
}));
jest.mock("expo-image", () => ({ Image: "product-image" }));
jest.mock("expo-router", () => ({ Link: ({ children }: any) => children }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@/hooks/useCart", () => ({
  useCartActions: () => ({ mutate: mockAddToCart, isPending: false }),
}));
jest.mock("@/hooks/useAddProductToRegistry", () => ({
  useAddProductToRegistry: () => ({
    addProductToRegistry: mockAddToRegistry,
    addedToRegistryOverlay: null,
    isAddingProductToRegistry: false,
  }),
}));
jest.mock("@/components/BottomSheet/AppBottomSheetModal", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: React.forwardRef(function Sheet({ children }: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: mockDismiss,
      }));
      return children;
    }),
  };
});
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetBackdrop: () => null,
  BottomSheetView: ({ children }: any) => children,
}));

const base: IProduct = {
  id: "test",
  nameEn: "Bouncer",
  nameAr: "كرسي هزاز",
  price: 12,
  currencyCode: "KWD",
  qty: 2,
  images: [{ id: "portrait", path: "portrait.jpg" }],
  store: { id: "store", nameEn: "Store", nameAr: "متجر" },
};
let tree: ReactTestRenderer;
const render = async (product = base) => {
  await act(async () => {
    tree = create(<ProductCard product={product} width={170} />);
  });
};
const geometry = () =>
  [
    "product-image-frame",
    "product-name",
    "product-price",
    "product-add-options",
  ].map((testID) =>
    StyleSheet.flatten(tree.root.findAllByProps({ testID })[0].props.style),
  );
beforeEach(() => {
  jest.clearAllMocks();
  mockFontScale = 1;
});
afterEach(async () => {
  await act(async () => tree?.unmount());
});

it("keeps the same frame and text slots for different photos, long names and missing store/image data", async () => {
  await render();
  const initial = geometry();
  await act(async () =>
    tree.update(
      <ProductCard
        width={170}
        product={{
          ...base,
          nameEn:
            "A very long product name that needs more than two lines of space",
          images: [{ id: "wide", path: "landscape.jpg" }],
        }}
      />,
    ),
  );
  expect(geometry()).toEqual(initial);
  const photo = tree.root.findByType("product-image" as any);
  expect(photo.props.contentFit).toBe("contain");
  await act(async () => photo.props.onError());
  expect(tree.root.findAllByType("product-image" as any)).toHaveLength(0);
  expect(geometry()).toEqual(initial);
  await act(async () =>
    tree.update(
      <ProductCard
        width={170}
        product={{ ...base, images: [], store: undefined }}
      />,
    ),
  );
  expect(geometry()).toEqual(initial);
  await act(async () =>
    tree.update(<ProductCard width={170} product={base} />),
  );
  expect(tree.root.findAllByType("product-image" as any)).toHaveLength(1);
});
it("gives enlarged text two lines without moving the image or plus button", async () => {
  await render();
  const normal = geometry();
  mockFontScale = 1.5;
  await act(async () =>
    tree.update(<ProductCard width={170} product={base} />),
  );
  const enlarged = geometry();
  expect(enlarged[0]).toEqual(normal[0]);
  expect(enlarged[3]).toEqual(normal[3]);
  expect(enlarged[1].height).toBe(60);
  expect(enlarged[2].height).toBe(30);
});
it("opens the existing action sheet and preserves both add actions", async () => {
  await render();
  await act(async () =>
    tree.root
      .findAllByProps({ testID: "product-add-options" })[0]
      .props.onPress(),
  );
  expect(mockPresent).toHaveBeenCalledTimes(1);
  expect(mockAddToCart).not.toHaveBeenCalled();
  await act(async () =>
    tree.root
      .findAllByProps({ accessibilityLabel: "cart.addToCart" })[0]
      .props.onPress(),
  );
  expect(mockDismiss).toHaveBeenCalledTimes(1);
  expect(mockAddToCart).toHaveBeenCalledWith({
    kind: "add",
    productId: "test",
  });
  await act(async () =>
    tree.root
      .findAllByProps({ accessibilityLabel: "cart.addToRegistry" })[0]
      .props.onPress(),
  );
  expect(mockAddToRegistry).toHaveBeenCalledTimes(1);
});
it("keeps unavailable products browsable and registry-addable while disabling cart add", async () => {
  const onPress = jest.fn();
  await act(async () => {
    tree = create(
      <ProductCard product={{ ...base, qty: 0 }} onPress={onPress} />,
    );
  });
  expect(
    tree.root.findAllByProps({ accessibilityLabel: "cart.outOfStock" })[0].props
      .disabled,
  ).toBe(true);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: "cart.addToRegistry" })[0]
      .props.disabled,
  ).not.toBe(true);
  await act(async () =>
    tree.root
      .findAllByType(TouchableOpacity)
      .find((node) => node.props.onPress === onPress)!
      .props.onPress(),
  );
  expect(onPress).toHaveBeenCalledTimes(1);
});
