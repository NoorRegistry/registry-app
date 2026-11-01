import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";
import { FeaturedGifts, FeaturedStores } from "../Featured";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("expo-image", () => ({ Image: "Image" }));
jest.mock("@expo/vector-icons/Feather", () => "Icon");
jest.mock("@/components/Commerce", () => ({ CommerceText: "Text" }));
jest.mock("@/components/ProductCard", () => "ProductCard");
jest.mock("@/utils/helper", () => ({
  getUserSub: () => "alice",
  getImageUrl: () => "",
  getEnArName: (en: string) => en,
}));
jest.mock("@/services/home.service", () => ({
  fetchFeaturedGifts: jest.fn(),
  fetchFeaturedStores: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

let client: QueryClient;
let tree: ReactTestRenderer;
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
async function render(kind: "gifts" | "stores", data: unknown[]) {
  client.setQueryData(["home", "alice", "en", kind], {
    data,
    total: data.length,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        {kind === "gifts" ? <FeaturedGifts /> : <FeaturedStores />}
      </QueryClientProvider>,
    );
  });
}
const pressSeeAll = async (label: string) =>
  act(async () =>
    tree.root
      .findAll(
        (node) =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === "function",
      )[0]
      .props.onPress(),
  );

it("shows featured gifts in a horizontal row and ends with the filtered See all destination", async () => {
  await render("gifts", [{ id: "one" }, { id: "two" }, { id: "three" }]);
  expect(
    tree.root
      .findAllByType("ProductCard" as any)
      .map((node) => node.props.product.id),
  ).toEqual(["one", "two", "three"]);
  expect(
    tree.root.findAll((node) => node.props.horizontal === true).length,
  ).toBeGreaterThan(0);
  await pressSeeAll("homeDesign.allFeaturedGifts");
  expect(router.push).toHaveBeenCalledWith("/featured-gifts");
});
it("links store tiles to store details and See all to featured stores", async () => {
  await render("stores", [
    { id: "shop", nameEn: "Shop", nameAr: "متجر", storeLogo: null },
  ]);
  await act(async () =>
    tree.root
      .findAll(
        (node) =>
          node.props.accessibilityLabel === "Shop" && node.props.onPress,
      )[0]
      .props.onPress(),
  );
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/stores/[id]",
    params: { id: "shop", storeName: "Shop" },
  });
  await pressSeeAll("homeDesign.allFeaturedStores");
  expect(router.push).toHaveBeenCalledWith("/featured-stores");
});
it("hides empty featured sections without inserting popularity-based substitutes", async () => {
  await render("gifts", []);
  expect(tree.toJSON()).toBeNull();
  await act(async () => tree.unmount());
  await render("stores", []);
  expect(tree.toJSON()).toBeNull();
});
