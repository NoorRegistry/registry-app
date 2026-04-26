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

export const fetchRegistryGuestView = async (id: string, code?: string) => {
  const query = `id=${encodeURIComponent(id)}${
    code ? `&code=${encodeURIComponent(code)}` : ""
  }`;
  return await http.get<IRegistryDetails>(
    `${endpoints.registries.publicGuestView}?${query}`,
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
