import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import AddressMap from "../index.native";
import Constants from "expo-constants";

jest.mock("expo-router", () => ({
  useFocusEffect: (effect: () => void) => {
    const React = jest.requireActual("react");
    React.useEffect(effect, [effect]);
  },
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { extra: { iosGoogleMapsEnabled: false } } },
}));

const mockAnimate = jest.fn();
jest.mock("react-native-maps", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    PROVIDER_GOOGLE: "google",
    default: React.forwardRef(function MockMap(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({ animateToRegion: mockAnimate }));
      return React.createElement("native-map", props);
    }),
    Marker: "map-marker",
  };
});
jest.mock("@expo/vector-icons/Ionicons", () => "pin-icon");

it("selects the stopped map center without recentering after a gesture", async () => {
  const select = jest.fn();
  const moving = jest.fn();
  const start = { latitude: 29.3759, longitude: 47.9774 };
  const end = { latitude: 29.337, longitude: 48.075 };
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(
      <AddressMap
        pin={start}
        height={500}
        onSelect={select}
        onMoving={moving}
      />,
    );
  });
  const map = tree.root.findByType("native-map" as any);
  const initialRegion = map.props.initialRegion;
  expect(map.props.provider).toBeUndefined();
  expect(tree.root.findAllByType("map-marker" as any)).toHaveLength(0);
  expect(
    tree.root.findByProps({ testID: "address-map-center-pin" }),
  ).toBeTruthy();
  await act(async () => {
    map.props.onRegionChange();
    map.props.onRegionChangeComplete(end);
  });
  expect(select).toHaveBeenCalledWith(end);
  expect(moving.mock.calls).toEqual([[true], [false]]);
  await act(async () => {
    tree.update(
      <AddressMap pin={end} height={500} onSelect={select} onMoving={moving} />,
    );
  });
  expect(mockAnimate).not.toHaveBeenCalled();
  expect(map.props.initialRegion).toBe(initialRegion);
  await act(async () => {
    tree.update(<AddressMap pin={start} height={500} onSelect={select} />);
  });
  expect(mockAnimate).toHaveBeenCalledWith(expect.objectContaining(start), 350);
  await act(async () => tree.unmount());
});

it("uses the Google provider when configured for the iOS build", async () => {
  Constants.expoConfig!.extra!.iosGoogleMapsEnabled = true;
  let tree!: ReactTestRenderer;
  try {
    await act(async () => {
      tree = create(
        <AddressMap pin={null} height={500} onSelect={jest.fn()} />,
      );
    });
    expect(tree.root.findByType("native-map" as any).props.provider).toBe(
      "google",
    );
  } finally {
    Constants.expoConfig!.extra!.iosGoogleMapsEnabled = false;
    await act(async () => tree.unmount());
  }
});
