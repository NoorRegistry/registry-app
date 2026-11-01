import { http } from "@/api/http";
import { IProduct, IStore, IPaginatedResponse } from "@/types";
import { NotificationItem } from "./notifications.service";

export type RegistryActivityItem = NotificationItem & {
  product: { nameEn: string; nameAr: string } | null;
};
export type PublicRegistry = {
  id: string;
  title: string;
  ownerName: string | null;
  logo: string | null;
  eventDate: string | null;
  category: { name: string };
};
const home = "/v1/api/users/home";
export const fetchFeaturedGifts = (
  page = 1,
  limit = 12,
  signal?: AbortSignal,
) =>
  http.get<IPaginatedResponse<IProduct>>(`${home}/featured-gifts`, {
    params: { page, limit },
    signal,
  });
export const fetchFeaturedStores = (
  page = 1,
  limit = 12,
  signal?: AbortSignal,
) =>
  http.get<IPaginatedResponse<IStore>>(`${home}/featured-stores`, {
    params: { page, limit },
    signal,
  });
export const fetchRegistryActivity = (
  cursor?: string,
  limit = 20,
  signal?: AbortSignal,
) =>
  http.get<{ data: RegistryActivityItem[]; nextCursor: string | null }>(
    `${home}/activity`,
    { params: { cursor, limit }, signal },
  );
export const searchPublicRegistries = (
  search: string,
  page = 1,
  signal?: AbortSignal,
) =>
  http.get<IPaginatedResponse<PublicRegistry>>(
    "/v1/api/users/registries/public",
    { params: { search, page, limit: 20 }, signal },
  );
