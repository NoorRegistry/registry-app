import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  IPaginatedResponse,
  IProduct,
  IProductCategory,
  IProductCategoryDetails,
  IProductDetails,
} from "@/types";

export const fetchProductCategories = async () => {
  return await http.get<IPaginatedResponse<IProductCategory>>(
    `${endpoints.products.index}/categories`,
  );
};

export const fetchProductCategoryById = async (categoryId: string) => {
  return await http.get<IProductCategoryDetails>(
    `${endpoints.products.index}/categories/${categoryId}?allowChildren=true`,
  );
};

export const fetchProductsByCategoryId = async (categoryId: string) => {
  return await http.get<IPaginatedResponse<IProduct>>(
    `${endpoints.products.index}?categoryId=${categoryId}`,
  );
};

export const fetchProductById = async (productId: string) => {
  return await http.get<IProductDetails>(
    `${endpoints.products.index}/${productId}`,
  );
};

export const fetchRelatedProductById = async (productId: string) => {
  return await http.get<IProduct[]>(
    `${endpoints.products.index}/${productId}/related`,
  );
};

export const fetchMostAddedProducts = async () => {
  return await http.get<IProduct[]>(endpoints.products.mostAdded);
};

export type CatalogSort = "featured" | "priceAsc" | "priceDesc" | "name";
export type CatalogFilter = {
  categoryId?: string;
  storeId?: string;
  search?: string;
  sort?: CatalogSort;
  language?: string;
};
export const fetchCatalogProducts = (
  filters: CatalogFilter,
  page = 1,
  signal?: AbortSignal,
) =>
  http.get<IPaginatedResponse<IProduct>>(endpoints.products.index, {
    params: { ...filters, page, limit: 20 },
    signal,
  });
