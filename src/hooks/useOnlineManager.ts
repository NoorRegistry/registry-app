import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import * as React from "react";
import { Platform } from "react-native";

export function useOnlineManager() {
  React.useEffect(() => {
    // React Query already supports on reconnect auto refetch in web browser
    if (Platform.OS !== "web") {
      return NetInfo.addEventListener((state) => {
        // Connectivity probes can be unknown or fail while our API is reachable
        // (including local development servers). Let requests try on a connected
        // network and use their own timeout/error handling.
        onlineManager.setOnline(state.isConnected !== false);
      });
    }
  }, []);
}
