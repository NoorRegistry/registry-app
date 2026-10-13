import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IGlobalSearchResults, TGlobalSearchResultsType } from "@/types";

export const fetchSearchResults = (
  search: string,
  type: TGlobalSearchResultsType = "all",
  page = 1,
  signal?: AbortSignal,
) =>
  http.get<IGlobalSearchResults>(endpoints.search.index, {
    params: { search, type, page, limit: 20 },
    signal,
  });
