import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  ICreateRegistryItem,
  ICreateRegistryItemPurchase,
  ICreateRegistryPayload,
  IRegistry,
  IRegistryCategory,
  IRegistryDetails,
  IRegistryItemDetails,
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
    `${endpoints.registries.index}/guest-view?${query}`,
  );
};

export const fetchRegistryItemById = async (id: string) => {
  return await http.get<IRegistryItemDetails>(
    `${endpoints.registries.index}/items/${id}`,
  );
};

export const addItemToRegistry = async (payload: ICreateRegistryItem) => {
  return await http.post<IRegistryDetails>(
    `${endpoints.registries.index}/items`,
    payload,
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
