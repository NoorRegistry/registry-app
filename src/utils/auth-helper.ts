import { getApiBaseUrl } from "@/api/base-url";
import { API_REQUEST_TIMEOUT } from "@/api/config";
import constants from "@/constants";
import endpoints from "@/constants/endpoints";
import { IAccessToken } from "@/types";
import axios from "axios";
import { isTokenExpired } from "./helper";
import { getStorageItem, setStorageItem } from "./storage";

let refreshInFlight: Promise<void> | null = null;

const refreshStoredToken = async () => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  if (!token) return;

  let parsedToken: IAccessToken;
  try {
    parsedToken = JSON.parse(token) as IAccessToken;
    if (isTokenExpired(parsedToken.refreshToken)) {
      setStorageItem(constants.ACCESS_TOKEN, null);
      return;
    }
    if (!isTokenExpired(parsedToken.accessToken)) return;
  } catch {
    setStorageItem(constants.ACCESS_TOKEN, null);
    throw new Error("Invalid stored session");
  }

  try {
    const response = await axios.post<IAccessToken>(
      `${getApiBaseUrl()}${endpoints.authentication.refreshToken}`,
      { refreshToken: parsedToken.refreshToken },
      {
        timeout: API_REQUEST_TIMEOUT,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.data.accessToken || !response.data.refreshToken) {
      throw new Error("Invalid refresh response");
    }
    setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(response.data));
  } catch (error) {
    // Connectivity and server failures do not invalidate a valid refresh token.
    if (
      axios.isAxiosError(error) &&
      [401, 403].includes(error.response?.status ?? 0)
    ) {
      setStorageItem(constants.ACCESS_TOKEN, null);
    }
    throw error;
  }
};

export const handleRefreshToken = (): Promise<void> => {
  if (!refreshInFlight) {
    refreshInFlight = refreshStoredToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

export const getAuthorizationHeaders = () => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  if (token) {
    const parsedToken = JSON.parse(token) as IAccessToken;
    return { Authorization: `Bearer ${parsedToken.accessToken}` };
  }
};
