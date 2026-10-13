import {
  fetchNotificationSummary,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationSettings,
} from "@/services/notifications.service";
import { useGlobalStore } from "@/store";
import { getUserSub } from "@/utils/helper";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useNotificationsKey() {
  return ["notifications", getUserSub()] as const;
}
export function useNotificationSummary() {
  const authenticated = useGlobalStore.use.isAuthenticated();
  const key = useNotificationsKey();
  return useQuery({
    queryKey: [...key, "summary"],
    queryFn: fetchNotificationSummary,
    enabled: authenticated && !!key[1],
    staleTime: 15000,
    refetchInterval: authenticated ? 60000 : false,
  });
}
export function useNotificationInbox() {
  const key = useNotificationsKey();
  return useInfiniteQuery({
    queryKey: [...key, "inbox"],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => fetchNotifications(pageParam, signal),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 15000,
  });
}
export function useNotificationRead() {
  const key = useNotificationsKey();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) =>
      id ? markNotificationRead(id) : markAllNotificationsRead(),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}
export function useNotificationSettings() {
  const key = useNotificationsKey();
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (summary) => client.setQueryData([...key, "summary"], summary),
  });
}
