import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IGlobalSearchResults } from "@/types";

export const fetchSearchResults = async (search: string) => {
  return await http.get<IGlobalSearchResults>(
    `${endpoints.search.index}?search=${search}`,
  );
};
