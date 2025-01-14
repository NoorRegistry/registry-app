import "core-js/stable/atob";
import i18n from "i18next";
import { jwtDecode } from "jwt-decode";

import { queryClient } from "@/api/queryClient";
import constants from "@/constants";
import { IAccessToken, IProductCategory, ITokenInfo } from "@/types";
import { getStorageItem, setStorageItem } from "@/utils/storage";

export const isAuthenticated = (): boolean => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  let isValidToken = false;
  if (token) {
    const parsedToken = JSON.parse(token) as IAccessToken;
    isValidToken = Boolean(token && !isTokenExpired(parsedToken.accessToken));
  }
  return Boolean(isValidToken);
};

export const getTokenExpireDate = (token: string) =>
  (jwtDecode(token).exp || 0) * 1000;

export const isTokenExpired = (token: string): boolean => {
  const jwtPayload = jwtDecode(token);
  // considering token expired before 60 seconds
  const isTokenExpired =
    jwtPayload.exp && (jwtPayload.exp - 60) * 1000 < Date.now();
  if (isTokenExpired) {
    // clearSessionData();
  }
  return Boolean(isTokenExpired);
};

export const clearSessionData = (): void => {
  setStorageItem(constants.ACCESS_TOKEN, null);
  // Clear react-query data
  queryClient.clear();
};

export const getUserEmail = () => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  return token ? jwtDecode<any>(token).email : "";
};

export const getUserFirstName = () => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  return token ? jwtDecode<ITokenInfo>(token).user.firstName : "";
};

/**
 * Function to get the user sub /uid for user tracking
 */
export const getUserSub = () => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  return token ? jwtDecode<any>(token).sub : "";
};

/**
 * Function to get the image path prefixed with asset domain
 */
export const getImageUrl = (path: string): string => {
  const BASE_URL = process.env.EXPO_PUBLIC_ASSET_URL;
  return `${BASE_URL}${path}`;
};

/**
 * Function to get the english or arabic names
 */
export const getEnArName = (en: string = "", ar: string = ""): string => {
  const lang = i18n.language;
  return lang === "ar" ? ar : en;
};

/**
 * Function to find category by ID recursively
 */
export const findCategoryById = (
  categories: IProductCategory[],
  id: string,
): IProductCategory | null => {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children && Array.isArray(category.children)) {
      const found = findCategoryById(category.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export function formatPrice(price: number = 0, currencyCode?: string): string {
  if (!currencyCode) currencyCode = "KWD";
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    });
    return formatter.format(price);
  } catch (error) {
    console.error(`Error formatting price: ${error}`);
    return `${currencyCode} ${price.toFixed(2)}`;
  }
}
