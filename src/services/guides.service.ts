import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IGuideCategory, IGuideHomeCategory } from "@/types";

export const fetchGuidesHomeData = async () => {
  return await http.get<IGuideHomeCategory[]>(`${endpoints.guides.index}/home`);
};

export const fetchGuidesCategoryData = async (id: string) => {
  return await http.get<IGuideCategory>(
    `${endpoints.guides.index}/categories/${id}`,
  );
};
