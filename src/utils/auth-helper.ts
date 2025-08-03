import constants from "@/constants";
import endpoints from "@/constants/endpoints";
import { IAccessToken } from "@/types";
import axios from "axios";
import { isTokenExpired } from "./helper";
import { getStorageItem, setStorageItem } from "./storage";

export const handleRefreshToken = async () => {
  try {
    const token = getStorageItem(constants.ACCESS_TOKEN);
    if (token) {
      const parsedToken = JSON.parse(token) as IAccessToken;
      if (
        isTokenExpired(parsedToken.accessToken) &&
        !isTokenExpired(parsedToken.refreshToken)
      ) {
        const response = await axios.post<IAccessToken>(
          `${process.env.EXPO_PUBLIC_API_URL}${endpoints.authentication.refreshToken}`,
          parsedToken,
          {
            headers: {
              Authorization: "Bearer " + parsedToken.accessToken,
              Accept: "application/json",
              "Content-Type": "application/json; charset=utf-8",
            },
          },
        );
        console.log("token refreshed", response.data);
        setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(response.data));
      } else if (isTokenExpired(parsedToken.refreshToken)) {
        // If refresh token is expired, remove token from storage
        console.log("refresh token expired- deleting token completely");
        setStorageItem(constants.ACCESS_TOKEN, null);
      }
    }
  } catch (error) {
    console.error("error", error);
    throw new Error("Problem retrieving refresh token");
  }
};

export const getAuthorizationHeaders = () => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  if (token) {
    const parsedToken = JSON.parse(token) as IAccessToken;
    return { Authorization: `Bearer ${parsedToken.accessToken}` };
  }
};
