import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";
import RegistryCard from "..";
import { fetchRegistries } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { IRegistry } from "@/types";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/components/Commerce", () => ({ CommerceText: "Text" }));
jest.mock("@/components/RegistryAvatar", () => "Avatar");
jest.mock("../RegistryCardSkeleton", () => "Skeleton");
jest.mock("@expo/vector-icons/Feather", () => "Icon");
jest.mock("expo-linear-gradient", () => ({ LinearGradient: "Gradient" }));
jest.mock("react-native-reanimated", () => {
  const React = jest.requireActual("react");
  const builder: any = {};
  for (const method of [
    "duration",
    "reduceMotion",
    "springify",
    "damping",
    "stiffness",
  ])
    builder[method] = () => builder;
  return {
    __esModule: true,
    default: { View: "AnimatedView" },
    ReduceMotion: { System: "system" },
    LinearTransition: builder,
    FadeIn: builder,
    FadeOut: builder,
    useSharedValue: (value: number) => React.useRef({ value }).current,
  };
});
jest.mock("../PaginationDot", () => "PaginationDot");
jest.mock("@/services/registries.service", () => ({
  fetchRegistries: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@/store", () => {
  const { create } = jest.requireActual("zustand");
  return {
    useGlobalStore: create((set: any) => ({
      selectedRegistryId: undefined,
      setSelectedRegistryId: (selectedRegistryId: string) =>
        set({ selectedRegistryId }),
    })),
  };
});
jest.mock("react-native-reanimated-carousel", () => {
  const React = jest.requireActual("react");
  return {
    Carousel: React.forwardRef(function MockCarousel(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        scrollTo: ({ index }: any) => props.onSnapToItem(index),
      }));
      return React.createElement("Carousel", props);
    }),
  };
});

const rows = Array.from({ length: 10 }, (_, index) => ({
  id: String(index),
  title: `Registry ${index}`,
  logo: "",
  _count: { totalItems: 12, totalPurchased: 3 },
})) as IRegistry[];
let tree: ReactTestRenderer;
let client: QueryClient;
const press = async (id: string) =>
  act(async () => {
    tree.root
      .findAll(
        (node) =>
          node.props.testID === id && typeof node.props.onPress === "function",
      )[0]
      .props.onPress();
  });
const carousel = () => tree.root.findByType("Carousel" as any);
const render = async (data: IRegistry[]) => {
  client.setQueryData(["registries"], data);
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <RegistryCard />
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    tree.root
      .findAll((node) => typeof node.props.onLayout === "function")[0]
      .props.onLayout({ nativeEvent: { layout: { width: 328 } } });
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  (useGlobalStore as any).setState({ selectedRegistryId: "7" });
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

it("starts with the selected registry and keeps global selection unchanged while swiping", async () => {
  await render(rows);
  expect(carousel().props.data[0].id).toBe("7");
  await act(async () => carousel().props.onSnapToItem(6));
  const dots = tree.root.findAll(
    (node) =>
      node.props.testID?.startsWith("home-registry-dot-") && node.props.onPress,
  );
  expect(dots).toHaveLength(5);
  expect(
    dots.find((dot) => dot.props.accessibilityState.selected)?.props.testID,
  ).toBe("home-registry-dot-6");
  expect((useGlobalStore as any).getState().selectedRegistryId).toBe("7");
  await press("home-registry-dot-5");
  expect(
    tree.root.findAll(
      (node) =>
        node.props.testID === "home-registry-dot-5" && node.props.onPress,
    )[0].props.accessibilityState.selected,
  ).toBe(true);
});

it("opens a browsed registry and makes it the active registry", async () => {
  await render(rows);
  await act(async () => {
    const props = carousel().props;
    const row = props.renderItem({ item: rows[2] });
    row.props.onPress();
  });
  expect((useGlobalStore as any).getState().selectedRegistryId).toBe("2");
  expect(router.push).toHaveBeenCalledWith("/(protected)/(tabs)/registry");
  expect(carousel().props.data[0].id).toBe("2");
});

it("keeps the single registry chevron and navigation, with no pagination dots", async () => {
  await render([rows[0]]);
  expect(
    tree.root.findAll((node) => node.props.name === "chevron-right"),
  ).toHaveLength(1);
  await press("home-registry-0");
  expect(router.push).toHaveBeenCalledWith("/(protected)/(tabs)/registry");
  expect(tree.root.findAllByType("Carousel" as any)).toHaveLength(0);
  expect(
    tree.root.findAll(
      (node) => node.props.testID === "home-registry-pagination",
    ),
  ).toHaveLength(0);
  await act(async () => {
    client.setQueryData(["registries"], []);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  await press("home-create-registry");
  expect(router.push).toHaveBeenCalledWith("/(protected)/registry/create");
  expect(fetchRegistries).not.toHaveBeenCalled();
});
