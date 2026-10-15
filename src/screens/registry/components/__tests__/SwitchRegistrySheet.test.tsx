import React from "react";
import { Text as mockText, TouchableOpacity } from "react-native";
import { act, create } from "react-test-renderer";
import SwitchRegistry from "../SwitchRegistrySheet";
import { router } from "expo-router";

jest.mock("@/api/queryClient", () => ({
  queryClient: { setQueryData: jest.fn() },
}));
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("@/components/RegistryListItem", () => () => null);
jest.mock("@/components/icons/plus", () => ({ PlusIcon: () => null }));
jest.mock("@/services/registries.service", () => ({
  fetchRegistries: jest.fn(),
}));
jest.mock("@/store", () => ({
  useGlobalStore: (selector: any) =>
    selector({ setSelectedRegistryId: jest.fn(), selectedRegistryId: null }),
}));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [] }) }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetBackdrop: () => null,
  BottomSheetFlatList: () => null,
}));
jest.mock("@/components/BottomSheet/AppBottomSheetModal", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: React.forwardRef(function MockModal(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        present: () => {},
        dismiss: () => props.onDismiss(),
      }));
      return props.children;
    }),
  };
});

it("opens New registry on two consecutive uses, even when dismissal completes immediately", async () => {
  const ref = React.createRef<any>();
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(<SwitchRegistry ref={ref} />);
  });
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      await act(async () => {
        ref.current.present();
        tree.root.findByType(TouchableOpacity).props.onPress();
      });
      expect(router.push).toHaveBeenCalledTimes(attempt + 1);
      expect(router.push).toHaveBeenLastCalledWith(
        "/(protected)/registry/create",
      );
    }
  } finally {
    await act(async () => tree.unmount());
  }
});
