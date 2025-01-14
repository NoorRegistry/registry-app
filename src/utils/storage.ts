import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Pass value as null to delete the key
 */
export function setStorageItem(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    if (value == null) {
      SecureStore.deleteItemAsync(key);
    } else {
      SecureStore.setItem(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK, // Ensures accessibility at all times
      });
    }
  }
}

export function getStorageItem(key: string) {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    return SecureStore.getItem(key, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK, // Ensures accessibility
    });
  }
}

export default { setStorageItem, getStorageItem };
