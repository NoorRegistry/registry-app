import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  ICreateRegistryItem,
  ICreateRegistryPayload,
  IRegistry,
  IRegistryCategory,
  IRegistryDetails,
  IRegistryItemDetails,
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
