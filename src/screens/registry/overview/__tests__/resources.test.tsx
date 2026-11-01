import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { fetchRegistryActivity } from "@/services/home.service";
import { OverviewActivity, OverviewGuides, OverviewIdeas } from "../resources";
import { HomeLoadState } from "@/screens/home/components/shared";
import Toast from "react-native-toast-message";

const mockPending = jest.fn();
const mockSelectRegistry = jest.fn();
jest.mock("@/store", () => ({
  useGlobalStore: (select: any) =>
    select({ setSelectedRegistryId: mockSelectRegistry }),
}));
jest.mock("@/components/Commerce", () => ({ CommerceText: "Text" }));
jest.mock("@expo/vector-icons/Feather", () => "Icon");
jest.mock("expo-image", () => ({ Image: "Image" }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn().mockResolvedValue({ type: "cancel" }),
}));
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));
jest.mock("@/services/home.service", () => ({
  fetchRegistryActivity: jest.fn(),
  fetchFeaturedGifts: jest.fn(),
}));
jest.mock("@/services/guides.service", () => ({
  fetchGuidesHomeData: jest.fn(),
}));
jest.mock("@/store/notifications", () => ({
  useNotificationNavigation: (select: any) =>
    select({ setPending: mockPending }),
}));
jest.mock("@/utils/helper", () => ({
  getUserSub: () => "viewer",
  getEnArName: (en: string) => en,
  getImageUrl: (s: string) => s,
  formatPrice: () => "12 KWD",
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      key === "registryOverview.hoursAgo" ? `${options?.count} hours ago` : key,
    i18n: { language: "en" },
  }),
}));

let tree: ReactTestRenderer;
let client: QueryClient;
const activityKey = ["home", "viewer", "en", "activity", "overview"];
const settle = async () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
const text = () =>
  tree.root
    .findAll((node) => node.type === ("Text" as any))
    .map((node) => node.props.children)
    .join(" ");
const press = async (label: string) =>
  act(async () => {
    tree.root
      .findAll(
        (node) =>
          typeof node.props.onPress === "function" &&
          node.findAll(
            (child) =>
              child.type === ("Text" as any) && child.props.children === label,
          ).length > 0,
      )[0]
      .props.onPress();
  });
const render = async (element: React.ReactNode) => {
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>{element}</QueryClientProvider>,
    );
  });
  await settle();
};
beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  });
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client.clear();
});

it("shows the actual product, registry and time, then uses notification navigation for a purchase", async () => {
  const data = {
    registryId: "baby",
    itemId: "purchased",
    notificationId: "event",
    recipientId: "viewer",
    type: "REGISTRY_PURCHASE",
  };
  client.setQueryData(activityKey, {
    data: [
      {
        id: "event",
        type: "REGISTRY_PURCHASE",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        product: { nameEn: "Dinner set" },
        data,
      },
    ],
    nextCursor: null,
  });
  await render(
    <OverviewActivity
      registries={[{ id: "baby", title: "Baby Ibrahim" } as any]}
    />,
  );
  expect(text()).toContain("Dinner set");
  expect(text()).toContain("Baby Ibrahim · 2 hours ago");
  await press("registryOverview.giftPurchased");
  expect(mockPending).toHaveBeenCalledWith(data);
  expect(mockSelectRegistry).toHaveBeenCalledWith("baby");
});

it("retries a failed activity request and shows the real empty state after recovery", async () => {
  (fetchRegistryActivity as jest.Mock)
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValue({ data: [], nextCursor: null });
  await render(<OverviewActivity registries={[]} />);
  expect(text()).toContain("homeDesign.retry");
  await act(async () => tree.root.findByType(HomeLoadState).props.onRetry());
  await settle();
  expect(text()).toContain("homeDesign.noActivity");
});

it("opens a featured gift and links to the full featured catalog", async () => {
  client.setQueryData(["home", "viewer", "en", "gifts", "registry-overview"], {
    data: [
      {
        id: "vase",
        nameEn: "Vase set",
        price: 12,
        currencyCode: "KWD",
        images: [],
      },
    ],
  });
  await render(<OverviewIdeas />);
  await press("Vase set");
  expect(router.push).toHaveBeenLastCalledWith({
    pathname: "/(protected)/products/[id]",
    params: { id: "vase" },
  });
  await press("homeDesign.allFeaturedGifts");
  expect(router.push).toHaveBeenLastCalledWith("/featured-gifts");
});

it("opens published guides once per guide and reports a missing guide URL", async () => {
  const guide = {
    id: "one",
    nameEn: "Registry essentials",
    url: "/registry-essentials",
  };
  client.setQueryData(
    ["guides", "home", "en"],
    [{ guides: [guide] }, { guides: [guide] }],
  );
  const previous = process.env.EXPO_PUBLIC_GUIDES_URL;
  try {
    process.env.EXPO_PUBLIC_GUIDES_URL = "https://guides.example.invalid/";
    await render(<OverviewGuides />);
    expect(
      tree.root.findAll(
        (node) =>
          node.type === ("Text" as any) && node.props.children === guide.nameEn,
      ),
    ).toHaveLength(1);
    await press(guide.nameEn);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      "https://guides.example.invalid/registry-essentials",
      expect.any(Object),
    );
    Reflect.deleteProperty(process.env, "EXPO_PUBLIC_GUIDES_URL");
    await press(guide.nameEn);
    expect(Toast.show).toHaveBeenCalledWith({
      type: "error",
      text1: "registryOverview.guideError",
    });
  } finally {
    if (previous === undefined)
      Reflect.deleteProperty(process.env, "EXPO_PUBLIC_GUIDES_URL");
    else process.env.EXPO_PUBLIC_GUIDES_URL = previous;
  }
});
