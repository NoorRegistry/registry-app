import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IAccessToken } from "@/types";
import { getApiErrorMessage } from "@/utils/api-error";
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

type AuthApiResponse<T> = T & {
  success?: boolean;
  status?: number;
  detail?: unknown;
  message?: unknown;
  error?: unknown;
};

const assertSuccessfulAuthResponse = <T>(
  response: AuthApiResponse<T>,
): AuthApiResponse<T> => {
  const failed =
    response.success === false ||
    (typeof response.status === "number" && response.status >= 400) ||
    response.error !== undefined;

  if (failed) {
    throw {
      detail: getApiErrorMessage(
        response,
        typeof response.message === "string"
          ? response.message
          : "Request failed",
      ),
    };
  }

  return response;
};

const assertAccessTokenResponse = (
  response: AuthApiResponse<Partial<IAccessToken>>,
): IAccessToken => {
  assertSuccessfulAuthResponse(response);

  if (!response.accessToken || !response.refreshToken) {
    throw {
      detail: getApiErrorMessage(response, "OTP verification failed"),
    };
  }

  return response as IAccessToken;
};

export const sendOtp = async (
  payload: ILoginPayload,
): Promise<{ message: string }> => {
  const response = await http.post<AuthApiResponse<{ message: string }>>(
    endpoints.authentication.login,
    payload,
  );
  return assertSuccessfulAuthResponse(response);
};

export const resendOtp = async (
  payload: ILoginPayload,
): Promise<{ message: string }> => {
  const response = await http.post<AuthApiResponse<{ message: string }>>(
    endpoints.authentication.login,
    payload,
  );
  return assertSuccessfulAuthResponse(response);
};

export const verifyOtp = async (
  payload: IOtpVerifyPayload,
): Promise<IAccessToken> => {
  const response = await http.post<AuthApiResponse<Partial<IAccessToken>>>(
    endpoints.authentication.verifyOtp,
    payload,
  );
  return assertAccessTokenResponse(response);
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
