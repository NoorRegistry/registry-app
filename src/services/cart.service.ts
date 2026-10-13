import { http } from "@/api/http";

const base = "/v1/api/users/cart";

export type CartProduct = {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  currencyCode: string;
  images: { id: string; path: string }[];
  store: { id: string; nameEn: string; nameAr: string };
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  availableQuantity: number;
  availability: "AVAILABLE" | "INSUFFICIENT" | "UNAVAILABLE";
  product: CartProduct;
};

export type Cart = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currencyCode: string;
  hasUnavailableItems: boolean;
};

export const fetchCart = () => http.get<Cart>(base);
export const addCartItem = (productId: string) =>
  http.post<Cart>(`${base}/items`, { productId });
export const setCartQuantity = (productId: string, quantity: number) =>
  http.patch<Cart>(`${base}/items/${productId}`, { quantity });
export const removeCartItem = (productId: string) =>
  http.delete<Cart>(`${base}/items/${productId}`);
