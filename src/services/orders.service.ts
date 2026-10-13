import { http } from "@/api/http";
export type Address = {
  id: string;
  label: string;
  addressType?: "APARTMENT" | "HOUSE" | "OFFICE";
  avenue?: string | null;
  fullName: string;
  phone: string;
  country: "KW";
  governorate?: string | null;
  area: string;
  block: string;
  street: string;
  building: string;
  floor?: string | null;
  apartment?: string | null;
  instructions?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};
export type AddressInput = Omit<Address, "id">;
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";
export type OrderItem = {
  id: string;
  productId: string;
  nameEn: string;
  nameAr: string;
  storeNameEn: string;
  storeNameAr: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
};
export type Order = {
  id: string;
  reference: string;
  status: OrderStatus;
  paymentStatus: "UNPAID" | "PAID";
  paymentMethod: "COD";
  currencyCode: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  shippingAddress: AddressInput;
  customerName: string;
  customerEmail: string;
  phone: string;
  createdAt: string;
  items: OrderItem[];
  events: { id: string; action: string; createdAt: string }[];
};
export type CheckoutQuote = {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currencyCode: string;
  cartFingerprint: string;
};
const base = "/v1/api/users";
export const fetchAddresses = () => http.get<Address[]>(`${base}/addresses`);
export const saveAddress = (body: AddressInput, id?: string) =>
  id
    ? http.put<Address>(`${base}/addresses/${id}`, body)
    : http.post<Address>(`${base}/addresses`, body);
export const deleteAddress = (id: string) =>
  http.delete(`${base}/addresses/${id}`);
export const fetchCheckoutQuote = () =>
  http.get<CheckoutQuote>(`${base}/orders/quote`);
export const placeOrder = (body: {
  addressId: string;
  idempotencyKey: string;
  cartFingerprint: string;
  expectedTotal: number;
  note?: string;
}) => http.post<Order>(`${base}/orders`, body, { timeout: 30000 });
export const fetchOrder = (id: string) =>
  http.get<Order>(`${base}/orders/${id}`);
export const fetchOrders = (page = 1) =>
  http.get<{ data: Order[]; page: number; totalPages: number }>(
    `${base}/orders`,
    { params: { page, limit: 20 } },
  );
