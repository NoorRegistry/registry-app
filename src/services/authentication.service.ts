import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IAccessToken } from "@/types";

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ISignupPayload {
  email: string;
  password: string;
}

export const login = async (payload: ILoginPayload): Promise<IAccessToken> => {
  return await http.post<IAccessToken>(endpoints.authentication.login, payload);
};

export const refreshToken = async (): Promise<IAccessToken> => {
  return await http.get<IAccessToken>(endpoints.authentication.refreshToken);
};
