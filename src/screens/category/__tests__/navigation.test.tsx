import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";
import CategoryScreen from "..";
import CatalogProducts from "../../shop/components/CatalogProducts";
import { IProductCategory } from "@/types";
import CategoryTabs from "../components/CategoryTabs";
import { fetchCatalogProducts } from "@/services/products.service";
import { catalogProductsOptions } from "../../shop/catalog";

let mockParams: { id: string; view?: string };
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  router: { push: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock("@/components/CartBar", () => () => null);
jest.mock("@/components/Commerce", () => ({ CommerceText: "Text" }));
jest.mock("@/services/products.service", () => ({
  fetchProductCategories: jest.fn(),
  fetchCatalogProducts: jest.fn(),
}));
jest.mock("@/utils/helper", () => ({ getEnArName: (name: string) => name }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
jest.mock("react-native-reanimated", () => {
  const React = jest.requireActual("react");
  const fade: any = {};
  fade.duration = () => fade;
  fade.reduceMotion = () => fade;
  fade.easing = () => fade;
  return {
    __esModule: true,
    default: { View: "AnimatedView" },
    FadeInLeft: fade,
    FadeInRight: fade,
    FadeOut: fade,
    Easing: { out: (easing: unknown) => easing, cubic: jest.fn() },
    ReduceMotion: { System: "system" },
    useSharedValue: (value: number) => React.useRef({ value }).current,
    useAnimatedStyle: (style: () => object) => style(),
    withSpring: (value: number) => value,
  };
});
jest.mock("../../shop/components/CatalogProducts", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: (props: any) =>
      React.createElement("Catalog", props, props.header),
  };
});
jest.mock("../../shop/components/CategorySwitcher", () => "CategorySwitcher");
jest.mock("../../shop/components/Browse", () => ({
  BrowseHeader: "BrowseHeader",
  BrowseState: "BrowseState",
  CategoryGrid: "CategoryGrid",
  SearchEntry: "SearchEntry",
  SectionTitle: "SectionTitle",
}));

const leaf = (id: string) =>
  ({ id, nameEn: id, nameAr: id, children: false }) as IProductCategory;
const creams = leaf("creams");
const mats = leaf("mats");
const essentials = {
  ...leaf("essentials"),
  children: [creams, mats],
};
const diapering = {
  ...leaf("diapering"),
  children: [essentials, leaf("diapers")],
};
let tree: ReactTestRenderer;
let client: QueryClient;
const render = async () => {
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <CategoryScreen />
      </QueryClientProvider>,
    );
  });
};
const press = async (testID: string) => {
  await act(async () => {
    tree.root
      .findAll(
        (node) =>
          node.props.testID === testID &&
          typeof node.props.onPress === "function",
      )[0]
      .props.onPress();
  });
  await act(async () => {
    tree.update(
      <QueryClientProvider client={client}>
        <CategoryScreen />
      </QueryClientProvider>,
    );
  });
};
const selectedTabs = () =>
  tree.root.findAll(
    (node) =>
      typeof node.type === "string" &&
      node.props.accessibilityRole === "tab" &&
      node.props.accessibilityState.selected,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { id: "creams" };
  (router.setParams as jest.Mock).mockImplementation((params) => {
    mockParams = { ...mockParams, ...params };
  });
  client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity } },
  });
  client.setQueryData(["categories"], { data: [diapering] });
  (fetchCatalogProducts as jest.Mock).mockResolvedValue({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client.clear();
});

it("switches nested sibling tabs in place and updates products and search", async () => {
  await render();
  const tabs = tree.root.findByType(CategoryTabs);
  await press("category-tab-mats");
  expect(router.setParams).toHaveBeenLastCalledWith({
    id: "mats",
    view: undefined,
  });
  expect(router.push).not.toHaveBeenCalled();
  expect(tree.root.findByType(CatalogProducts).props.categoryId).toBe("mats");
  expect(selectedTabs().map((tab) => tab.props.testID)).toEqual([
    "category-tab-mats",
  ]);
  // The tab strip stays mounted, preserving its horizontal scroll position.
  expect(tree.root.findByType(tabs.type)).toBe(tabs);
  await act(async () => {
    tree.root.findByType("SearchEntry" as any).props.onPress();
  });
  expect(router.push).toHaveBeenLastCalledWith({
    pathname: "/catalog-search",
    params: { categoryId: "mats", name: "mats" },
  });
});

it("switches through All and siblings without adding navigation entries or retaining view=all", async () => {
  await render();
  await press("category-tab-all");
  expect(mockParams).toEqual({ id: "essentials", view: "all" });
  expect(tree.root.findByType(CatalogProducts).props.categoryId).toBe(
    "essentials",
  );
  expect(selectedTabs().map((tab) => tab.props.testID)).toEqual([
    "category-tab-all",
  ]);
  await press("category-tab-mats");
  expect(mockParams).toEqual({ id: "mats", view: undefined });
  await press("category-tab-creams");
  expect(router.setParams).toHaveBeenCalledTimes(3);
  expect(router.push).not.toHaveBeenCalled();
});

it("ignores the selected tab", async () => {
  await render();
  await press("category-tab-creams");
  expect(router.setParams).not.toHaveBeenCalled();
  expect(router.push).not.toHaveBeenCalled();
});

it("preloads All and nearby siblings with the same filters as the product list", async () => {
  await render();
  expect(fetchCatalogProducts).toHaveBeenCalledWith(
    { categoryId: "essentials", sort: "featured", language: "en" },
    1,
    expect.any(AbortSignal),
  );
  expect(fetchCatalogProducts).toHaveBeenCalledWith(
    { categoryId: "mats", sort: "featured", language: "en" },
    1,
    expect.any(AbortSignal),
  );
  expect(fetchCatalogProducts).toHaveBeenCalledTimes(2);
});

it("keeps previously loaded pages when warming sibling tabs", async () => {
  const options = catalogProductsOptions({
    categoryId: "mats",
    sort: "featured",
    language: "en",
  });
  const cached = {
    pages: [
      { data: [], page: 1, totalPages: 2, limit: 20, total: 40 },
      { data: [], page: 2, totalPages: 2, limit: 20, total: 40 },
    ],
    pageParams: [1, 2],
  };
  client.setQueryData(options.queryKey, cached, {
    updatedAt: Date.now() - 60000,
  });
  await render();
  expect(client.getQueryData(options.queryKey)).toEqual(cached);
  expect(fetchCatalogProducts).toHaveBeenCalledTimes(1);
});

it("keeps deeper category navigation while changing All products in place", async () => {
  mockParams = { id: "diapering" };
  await render();
  await act(async () => {
    tree.root.findByType("CategoryGrid" as any).props.onSelect(essentials);
  });
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/category/[id]",
    params: { id: "essentials" },
  });
  await act(async () => {
    tree.root.findByType("SectionTitle" as any).props.onPress();
  });
  expect(router.setParams).toHaveBeenCalledWith({
    id: "diapering",
    view: "all",
  });
});
