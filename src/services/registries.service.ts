import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  ICreateRegistryItem,
  ICreateRegistryItemResponse,
  ICreateRegistryItemPurchase,
  ICreateRegistryPayload,
  IRegistry,
  IRegistryCategory,
  IRegistryDetails,
  IRegistryItemDetails,
  IUpdateRegistryItemPayload,
  IUpdateRegistryPayload,
} from "@/types";

export const fetchRegistries = async () => {
  return await http.get<IRegistry[]>(endpoints.registries.index);
};

export type SharedRegistryOverview = Pick<
  IRegistry,
  "id" | "title" | "category" | "_count" | "eventDate"
> & { logo: string | null; ownerName: string | null };

export const fetchSharedRegistries = (signal?: AbortSignal) =>
  http.get<SharedRegistryOverview[]>(`${endpoints.registries.index}/shared`, {
    signal,
  });

export const fetchRegistriesCategories = async () => {
  return await http.get<IRegistryCategory[]>(
    `${endpoints.registries.index}/categories/`,
  );
};

export const fetchRegistry = async (id: string) => {
  return await http.get<IRegistryDetails>(
    `${endpoints.registries.index}/${id}`,
  );
};

export const fetchRegistryGuestView = async (id: string) => {
  return http.get<IRegistryDetails>(
    `${endpoints.registries.publicGuestView}?id=${encodeURIComponent(id)}`,
  );
};

export const fetchRegistryItemById = async (id: string) => {
  return await http.get<IRegistryItemDetails>(
    `${endpoints.registries.index}/items/${id}`,
  );
};

export const updateRegistryItem = async (
  id: string,
  payload: IUpdateRegistryItemPayload,
) => {
  return await http.patch<IRegistryItemDetails>(
    `${endpoints.registries.index}/items/${id}`,
    payload,
  );
};

export const addItemToRegistry = async (payload: ICreateRegistryItem) => {
  return await http.post<ICreateRegistryItemResponse>(
    `${endpoints.registries.index}/items`,
    payload,
  );
};

export const deleteRegistryItem = async (id: string) => {
  return await http.delete<{ status: number; message: string }>(
    `${endpoints.registries.index}/items/${id}`,
  );
};

export const postRegistry = async (payload: ICreateRegistryPayload) => {
  return await http.post<IRegistry>(endpoints.registries.index, payload);
};

export const postRegistryItemPurchase = async (
  payload: ICreateRegistryItemPurchase,
) => {
  return await http.post<IRegistry>(endpoints.registries.purchase, payload);
};

export const updateRegistry = async (
  id: string,
  payload: IUpdateRegistryPayload,
): Promise<IRegistryDetails> => {
  return await http.patch<IRegistryDetails>(
    `${endpoints.registries.index}/${id}`,
    payload,
  );
};
