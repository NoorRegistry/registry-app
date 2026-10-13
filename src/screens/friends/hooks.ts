import { queryClient } from "@/api/queryClient";
import { getDecodedToken } from "@/utils/helper";
import { fetchFriendsSummary } from "@/services/friends.service";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export const useFriendsKey = () =>
  ["friends", getDecodedToken()?.user?.id ?? ""] as const;
export const useFriendsSummary = () => {
  const key = useFriendsKey();
  return useQuery({
    queryKey: [...key, "summary"],
    queryFn: fetchFriendsSummary,
    staleTime: 15000,
  });
};
export const useRefreshOnFocus = (refresh: () => unknown, enabled = true) => {
  useFocusEffect(
    useCallback(() => {
      if (enabled) void refresh();
    }, [refresh, enabled]),
  );
};
export const refreshFriendData = async () => {
  // Guest registry access may have changed. Clear old details immediately rather
  // than retaining previously granted access while the next fetch runs.
  await queryClient.cancelQueries({ queryKey: ["registryGuestView"] });
  queryClient.removeQueries({ queryKey: ["registryGuestView"] });
  await queryClient.invalidateQueries({ queryKey: ["friends"] });
};
export const nextFriendsPage = (page: { page: number; totalPages: number }) =>
  page.page < page.totalPages ? page.page + 1 : undefined;
