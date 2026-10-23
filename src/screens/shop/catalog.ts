import {
  CatalogFilter,
  fetchCatalogProducts,
} from "@/services/products.service";
import { infiniteQueryOptions } from "@tanstack/react-query";

export function catalogProductsOptions(filters: CatalogFilter) {
  return infiniteQueryOptions({
    queryKey: ["catalogProducts", filters],
    queryFn: ({ pageParam, signal }) =>
      fetchCatalogProducts(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page && last.totalPages && last.page < last.totalPages
        ? last.page + 1
        : undefined,
    staleTime: 30000,
  });
}
