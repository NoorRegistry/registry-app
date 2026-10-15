import React from "react";
import {
  Text as mockText,
  TextInput as mockInput,
  View as mockView,
} from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import RegistryDetailsSheet from "../RegistryDetailsSheet";
import { updateRegistry } from "@/services/registries.service";
import { cacheRegistryUpdate } from "@/utils/registry-cache";
const mockDismiss = jest.fn();
let mockSubmitted: Promise<unknown>;
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: mockText },
}));
jest.mock("@/utils/registry-cache", () => ({ cacheRegistryUpdate: jest.fn() }));
jest.mock("@/services/registries.service", () => ({
  updateRegistry: jest.fn(),
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
    default: React.forwardRef(function MockModal(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        present: () => {},
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
const registry = {
  id: "registry",
  title: "Baby registry",
  greeting: "Welcome",
} as any;
const ref = React.createRef<any>();
beforeEach(async () => {
  jest.clearAllMocks();
  (updateRegistry as jest.Mock).mockResolvedValue({
    ...registry,
    title: "New title",
    greeting: "",
  });
  await act(async () => {
    tree = create(<RegistryDetailsSheet ref={ref} registry={registry} />);
  });
  await act(async () => ref.current.present());
});
afterEach(async () => {
  await act(async () => tree.unmount());
});
const field = (id: string) => tree.root.findAllByProps({ testID: id })[0];

it("saves trimmed edits, supports clearing the greeting, and updates the registry cache", async () => {
  await act(async () => {
    field("registry-details-title").props.onChangeText(" New title ");
    field("registry-details-greeting").props.onChangeText("");
  });
  await act(async () => {
    field("registry-details-save").props.onPress();
    await mockSubmitted;
  });
  expect(updateRegistry).toHaveBeenCalledWith("registry", {
    title: "New title",
    greeting: "",
  });
  expect(cacheRegistryUpdate).toHaveBeenCalled();
  expect(mockDismiss).toHaveBeenCalledTimes(1);
});

it("blocks blank titles and resets unsaved drafts when reopened", async () => {
  await act(async () =>
    field("registry-details-title").props.onChangeText(" "),
  );
  expect(field("registry-details-save").props.disabled).toBe(true);
  await act(async () => {
    ref.current.present();
  });
  expect(field("registry-details-title").props.value).toBe(registry.title);
  expect(field("registry-details-save").props.disabled).toBe(true);
  expect(updateRegistry).not.toHaveBeenCalled();
});

it("keeps the draft open after a save failure", async () => {
  (updateRegistry as jest.Mock).mockRejectedValueOnce({ detail: "Failed" });
  await act(async () =>
    field("registry-details-title").props.onChangeText("New title"),
  );
  await act(async () => {
    field("registry-details-save").props.onPress();
    await mockSubmitted;
  });
  expect(mockDismiss).not.toHaveBeenCalled();
  expect(field("registry-details-title").props.value).toBe("New title");
});
