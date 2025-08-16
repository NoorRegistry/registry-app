import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IAccessToken } from "@/types";
import { type PlatformOSType } from "react-native";

export interface ILoginPayload {
  email: string;
}

export interface IOtpVerifyPayload {
  email: string;
  otp: string;
}

interface IGoogleLoginPayload {
  idToken: string;
  deviceName?: string;
  devicePlatform?: PlatformOSType;
}

interface IAppleLoginPayload {
  idToken: string;
  deviceName?: string;
  devicePlatform?: PlatformOSType;
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

export const googleLogin = async (
  payload: IGoogleLoginPayload,
): Promise<IAccessToken> => {
  return await http.post<IAccessToken>(
    endpoints.authentication.googleLogin,
    payload,
  );
};

export const appleLogin = async (
  payload: IAppleLoginPayload,
): Promise<IAccessToken> => {
  return await http.post<IAccessToken>(
    endpoints.authentication.appleLogin,
    payload,
  );
};
