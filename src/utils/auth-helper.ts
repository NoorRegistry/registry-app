import constants from "@/constants";
import endpoints from "@/constants/endpoints";
import { IAccessToken } from "@/types";
import axios from "axios";
import { isTokenExpired } from "./helper";
import { getStorageItem, setStorageItem } from "./storage";

export const handleRefreshToken = async () => {
  try {
    const token = getStorageItem(constants.ACCESS_TOKEN);
    if (
      token &&
      isTokenExpired((JSON.parse(token) as IAccessToken).accessToken)
    ) {
      const parsedToken = JSON.parse(token) as IAccessToken;
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
      console.log("token refreshed");
      setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(response.data));
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
