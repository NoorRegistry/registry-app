import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IPaginatedResponse, IStore, IStoreDetails } from "@/types";

export const fetchStores = async () => {
  return await http.get<IPaginatedResponse<IStore>>(endpoints.stores.index);
};

export const fetchStore = async (id: string) => {
  return await http.get<IStoreDetails>(`${endpoints.stores.index}/${id}`);
};
