import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IAccessToken } from "@/types";

export interface ILoginPayload {
  email: string;
}

export interface IOtpVerifyPayload {
  email: string;
  otp: string;
}

export interface IUserInfoUpdate {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  countryCode?: string;
  gender?: "Male" | "Female";
}

export const sendOtp = async (
  payload: ILoginPayload,
): Promise<{ message: string }> => {
  return await http.post<{ message: string }>(
    endpoints.authentication.login,
    payload,
  );
};

export const resendOtp = async (
  payload: ILoginPayload,
): Promise<{ message: string }> => {
  return await http.post<{ message: string }>(
    endpoints.authentication.login,
    payload,
  );
};

export const verifyOtp = async (
  payload: IOtpVerifyPayload,
): Promise<IAccessToken> => {
  return await http.post<IAccessToken>(
    endpoints.authentication.verifyOtp,
    payload,
  );
};

export const refreshToken = async (): Promise<IAccessToken> => {
  return await http.get<IAccessToken>(endpoints.authentication.refreshToken);
};

export const updateUserInfo = async (
  payload: IUserInfoUpdate,
): Promise<IAccessToken> => {
  return await http.patch<IAccessToken>(
    endpoints.authentication.updateUserInfo,
    payload,
  );
};
