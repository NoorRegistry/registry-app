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
    `${endpoints.products.index}/categories/${categoryId}?allowchildren=true`,
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
