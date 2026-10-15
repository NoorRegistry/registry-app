import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IPaginatedResponse, IStore, IStoreDetails } from "@/types";

export const fetchStores = async () => {
  return await http.get<IPaginatedResponse<IStore>>(endpoints.stores.index);
};

export const fetchStore = async (id: string) => {
  const store = await http.get<IStoreDetails>(
    `${endpoints.stores.index}/${id}`,
  );
  return {
    ...store,
    products: store.products.map((product) => ({
      ...product,
      store: { id: store.id, nameEn: store.nameEn, nameAr: store.nameAr },
    })),
  };
};

export const fetchShopStores = () =>
  http.get<IPaginatedResponse<IStore>>(endpoints.stores.index, {
    params: { page: 1, limit: 8 },
  });
