import React from "react";
import { Text as mockText } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import AddressEditScreen from "../edit";
import { saveAddress } from "@/services/orders.service";
import * as Location from "expo-location";

const mockChoose = jest.fn();
const mockInvalidate = jest.fn().mockResolvedValue(undefined);
let mockSubmitted: Promise<unknown> | undefined;
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("@/components/AddressMap", () => ({
  __esModule: true,
  default: (props: any) => {
    const React = jest.requireActual("react");
    return React.createElement("address-map", props);
  },
}));
jest.mock("@/screens/friends/components", () => ({
  FriendsTopBar: () => null,
  palette: { ink: "#222", muted: "#777", accent: "#b86e53", danger: "#c33" },
  styles: { screen: { flex: 1 } },
}));
jest.mock("@expo/vector-icons/Ionicons", () => () => null);
jest.mock("@/hooks/useAddresses", () => ({
  useAddresses: () => ({ data: [], isPending: false }),
  useAddressChoice: (selector: any) => selector({ choose: mockChoose }),
}));
jest.mock("@/utils/helper", () => ({
  getDecodedToken: () => ({ user: { mobileNumber: "" } }),
  getUserFirstLastName: () => "Address Tester",
  getUserSub: () => "test-customer",
}));
jest.mock("@/services/orders.service", () => ({
  saveAddress: jest.fn().mockResolvedValue({ id: "saved-address" }),
}));
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
  useMutation: (options: any) => ({
    isPending: false,
    mutate: () => {
      mockSubmitted = Promise.resolve(options.mutationFn()).then(
        options.onSuccess,
      );
    },
  }),
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: () => ({}),
}));
jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  reverseGeocodeAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));
let tree: ReactTestRenderer;
beforeEach(async () => {
  jest.clearAllMocks();
  mockSubmitted = undefined;
  (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
    { isoCountryCode: "KW", district: "Salmiya", street: "Street 1" },
  ]);
  await act(async () => {
    tree = create(<AddressEditScreen />);
  });
});
afterEach(async () => {
  await act(async () => tree.unmount());
});
const press = async (id: string) => {
  await act(async () => {
    await tree.root.findByProps({ testID: id }).props.onPress();
  });
};
const fill = async (field: string, value: string) => {
  await act(async () => {
    tree.root
      .findByProps({ testID: `address-field-${field}` })
      .props.onChangeText(value);
  });
};

it("keeps details when changing location and only commits on Continue", async () => {
  await press("address-continue");
  await fill("building", "Saved building");
  await fill("apartment", "4");
  await press("address-change-location");
  await act(async () => {
    tree.root
      .findByType("address-map" as any)
      .props.onSelect({ latitude: 29.337, longitude: 48.075 });
  });
  (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
    { isoCountryCode: "KW", district: "Hawalli", street: "Street 2" },
  ]);
  await press("address-continue");
  expect(
    tree.root.findByProps({ testID: "address-field-building" }).props.value,
  ).toBe("Saved building");
  expect(
    tree.root.findByProps({ testID: "address-field-apartment" }).props.value,
  ).toBe("4");
  expect(
    tree.root.findByProps({ testID: "address-field-area" }).props.value,
  ).toBe("Hawalli");
  expect(tree.root.findByType("address-map" as any).props.interactive).toBe(
    false,
  );
});
it("requires apartment numbers, then saves House without hidden unit fields", async () => {
  await press("address-continue");
  await fill("building", "House 25");
  await fill("block", "10");
  await fill("avenue", "3");
  await fill("phone", "96512345");
  await press("address-save");
  expect(saveAddress).not.toHaveBeenCalled();
  await fill("apartment", "4");
  await fill("floor", "2");
  await press("address-type-HOUSE");
  expect(
    tree.root.findAllByProps({ testID: "address-field-apartment" }),
  ).toHaveLength(0);
  await press("address-save");
  await mockSubmitted;
  expect(saveAddress).toHaveBeenCalledWith(
    expect.objectContaining({
      addressType: "HOUSE",
      label: "HOUSE",
      apartment: null,
      floor: null,
      avenue: "3",
      phone: "+96596512345",
      latitude: 29.3759,
      longitude: 47.9774,
    }),
    undefined,
  );
  expect(mockChoose).toHaveBeenCalledWith("saved-address");
});
it("does not leave location selection for a reverse-geocoded foreign country", async () => {
  (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
    { isoCountryCode: "SA" },
  ]);
  await press("address-continue");
  expect(tree.root.findAllByProps({ testID: "address-save" })).toHaveLength(0);
  expect(saveAddress).not.toHaveBeenCalled();
});
it("waits for the map to stop and rejects an out-of-Kuwait center", async () => {
  await act(async () => {
    tree.root.findByType("address-map" as any).props.onMoving(true);
  });
  expect(
    tree.root.findByProps({ testID: "address-continue" }).props.disabled,
  ).toBe(true);
  await press("address-continue");
  expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
  await act(async () => {
    const map = tree.root.findByType("address-map" as any);
    map.props.onSelect({ latitude: 25, longitude: 45 });
    map.props.onMoving(false);
  });
  await press("address-continue");
  expect(tree.root.findAllByProps({ testID: "address-save" })).toHaveLength(0);
  expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
});
it("does not commit a location lookup after returning to the form", async () => {
  await press("address-continue");
  await press("address-change-location");
  await act(async () => {
    tree.root
      .findByType("address-map" as any)
      .props.onSelect({ latitude: 29.337, longitude: 48.075 });
  });
  let resolve!: (value: unknown) => void;
  (Location.reverseGeocodeAsync as jest.Mock).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  await act(async () => {
    tree.root.findByProps({ testID: "address-continue" }).props.onPress();
  });
  await press("address-location-back");
  await act(async () => {
    resolve([{ isoCountryCode: "KW", district: "Hawalli" }]);
  });
  expect(
    tree.root.findByProps({ testID: "address-field-area" }).props.value,
  ).toBe("Salmiya");
});
