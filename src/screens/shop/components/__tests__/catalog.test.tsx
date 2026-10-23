import React from "react";
import { FlatList } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CatalogProducts from "../CatalogProducts";
import { catalogProductsOptions } from "../../catalog";
import { fetchCatalogProducts } from "@/services/products.service";
import { IProduct } from "@/types";

jest.mock("@/services/products.service", () => ({
  fetchCatalogProducts: jest.fn(),
}));
jest.mock("@/components/Commerce", () => ({ CommerceText: "Text" }));
jest.mock("@/components/ProductCard", () => "ProductCard");
jest.mock("@/components/Grid", () => ({
  useGridLayout: () => ({ itemWidth: 160, onLayout: jest.fn() }),
}));
jest.mock("@/hooks/useCart", () => ({
  useCart: () => ({ data: { itemCount: 0 } }),
}));
jest.mock("@expo/vector-icons/Ionicons", () => "Icon");
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("@/components/BottomSheet/AppBottomSheetModal", () => () => null);
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetBackdrop: () => null,
  BottomSheetView: "BottomSheetView",
}));
jest.mock("../Browse", () => ({
  BrowseState: "BrowseState",
  browseStyles: {},
}));

const options = catalogProductsOptions({
  categoryId: "mats",
  sort: "featured",
  language: "en",
});
const page = {
  data: [{ id: "mat" } as IProduct],
  page: 1,
  totalPages: 1,
  total: 1,
  limit: 20,
};
let client: QueryClient;
let tree: ReactTestRenderer;
const list = () => tree.root.findByType(FlatList);
const refreshControl = () => list().props.refreshControl!.props;
const seed = (stale = false) =>
  client.setQueryData(
    options.queryKey,
    { pages: [page], pageParams: [1] },
    { updatedAt: Date.now() - (stale ? 60000 : 0) },
  );
const render = async (onRefresh?: () => Promise<unknown>) => {
  await act(async () => {
    tree = create(
      <QueryClientProvider client={client}>
        <CatalogProducts categoryId="mats" onRefresh={onRefresh} />
      </QueryClientProvider>,
    );
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  (fetchCatalogProducts as jest.Mock).mockResolvedValue(page);
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  client.clear();
});

it("uses the prefetched first page immediately without a second request or refresh spinner", async () => {
  await client.prefetchInfiniteQuery({ ...options, pages: 1 });
  await render();
  expect(list().props.data).toEqual(page.data);
  expect(fetchCatalogProducts).toHaveBeenCalledTimes(1);
  expect(refreshControl().refreshing).toBe(false);
});

it("keeps cached products visible during a background refresh without showing the pull spinner", async () => {
  seed(true);
  let resolve!: (value: typeof page) => void;
  (fetchCatalogProducts as jest.Mock).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  await render();
  expect(fetchCatalogProducts).toHaveBeenCalledTimes(1);
  expect(list().props.data).toEqual(page.data);
  expect(refreshControl().refreshing).toBe(false);
  await act(async () => {
    resolve(page);
  });
});

it("shows the spinner only for a manual pull and waits for both products and categories", async () => {
  seed();
  let resolveProducts!: (value: typeof page) => void;
  let resolveCategories!: () => void;
  (fetchCatalogProducts as jest.Mock).mockReturnValue(
    new Promise((done) => {
      resolveProducts = done;
    }),
  );
  const onRefresh = jest.fn(
    () =>
      new Promise<void>((done) => {
        resolveCategories = done;
      }),
  );
  await render(onRefresh);
  let refresh!: Promise<void>;
  await act(async () => {
    refresh = refreshControl().onRefresh();
  });
  expect(refreshControl().refreshing).toBe(true);
  expect(onRefresh).toHaveBeenCalledTimes(1);
  await act(async () => {
    resolveProducts(page);
  });
  expect(refreshControl().refreshing).toBe(true);
  await act(async () => {
    resolveCategories();
    await refresh;
  });
  expect(refreshControl().refreshing).toBe(false);
});

it("stops the manual spinner when a product refresh fails", async () => {
  seed();
  (fetchCatalogProducts as jest.Mock).mockRejectedValueOnce(
    new Error("Offline"),
  );
  await render();
  await act(async () => {
    await refreshControl().onRefresh();
  });
  expect(refreshControl().refreshing).toBe(false);
  expect(list().props.data).toEqual(page.data);
});
