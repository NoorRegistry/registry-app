import React from "react";
import { act, create } from "react-test-renderer";
import ProfileQrScreen from "..";
import { router } from "expo-router";
let mockScan: (value: string) => void;
const mockCamera = jest.fn(
  (props: { onScan: (v: string) => void; paused: boolean }) => {
    mockScan = props.onScan;
    return null;
  },
);
const mockFocus = React.useEffect;
jest.mock("expo", () => ({ requireOptionalNativeModule: () => ({}) }));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: () => ({}),
  useFocusEffect: (effect: () => () => void) => mockFocus(effect, [effect]),
}));
jest.mock("../camera", () => ({
  __esModule: true,
  default: (props: { onScan: (v: string) => void; paused: boolean }) =>
    mockCamera(props),
}));
jest.mock("@/screens/friends/hooks", () => ({
  useFriendsSummary: () => ({
    data: { profileCode: "SS-1234-ABCD" },
    refetch: jest.fn(),
  }),
  useRefreshOnFocus: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("@/utils/helper", () => ({
  getUserFirstLastName: () => "QA Person",
}));
jest.mock("@/components/Commerce", () => ({
  CommerceText: "Text",
  CommerceTopBar: "TopBar",
}));
jest.mock("@/components/Skeleton", () => ({
  Skeleton: "Skeleton",
  SkeletonBlock: "Block",
}));
jest.mock("@/screens/friends/components", () => ({
  ActionButton: "ActionButton",
}));
jest.mock("react-native-qrcode-svg", () => "QRCode");
jest.mock("@expo/vector-icons/Feather", () => "Icon");
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
}));
beforeEach(() => jest.clearAllMocks());
it("shows my code without mounting the camera, then scans once without sending a friend request", async () => {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(<ProfileQrScreen />);
  });
  expect(mockCamera).not.toHaveBeenCalled();
  expect(tree!.root.findByType("QRCode" as any).props.value).toBe(
    "shiftgiftme:///friends/code/SS-1234-ABCD",
  );
  await act(async () =>
    tree!.root
      .findAll(
        (x) =>
          x.props.testID === "qr-tab-scan" &&
          typeof x.props.onPress === "function",
      )[0]
      .props.onPress(),
  );
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    mockScan("shiftgiftme:///friends/code/SS-ABCD-1234");
    mockScan("shiftgiftme:///friends/code/SS-ABCD-1234");
  });
  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/friends/code/[code]",
    params: { code: "SS-ABCD-1234" },
  });
  await act(async () => tree!.unmount());
});
it("rejects a non-profile QR and offers scan again", async () => {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(<ProfileQrScreen />);
  });
  await act(async () =>
    tree!.root
      .findAll(
        (x) =>
          x.props.testID === "qr-tab-scan" &&
          typeof x.props.onPress === "function",
      )[0]
      .props.onPress(),
  );
  await act(async () => {
    await Promise.resolve();
    mockScan("https://example.invalid/");
  });
  expect(router.push).not.toHaveBeenCalled();
  expect(tree!.root.findByType("ActionButton" as any).props.title).toBe(
    "qr.scanAgain",
  );
  await act(async () => tree!.unmount());
});
