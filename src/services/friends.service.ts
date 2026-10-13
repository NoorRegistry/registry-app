import { http } from "@/api/http";

const base = "/v1/api/users/friends";
export type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileCode: string;
};
export type Friendship = {
  id: string;
  since: string;
  friend: Person;
  sharedCount: number;
  totalRegistries: number;
};
export type DiscoveryPerson = Person & {
  relationship: "NONE" | "FRIEND" | "SENT" | "INCOMING";
  requestId: string | null;
};
export type FriendRequest = {
  id: string;
  sender: Person;
  recipient: Person;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  direction: "incoming" | "sent";
  createdAt: string;
  friendId?: string;
  isFriend?: boolean;
};
export type FriendsPage<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type FriendsSummary = {
  friends: number;
  incoming: number;
  sent: number;
  discoverable: boolean;
  profileCode: string;
};
export type SharedRegistry = {
  id: string;
  title: string;
  logo: string | null;
  category: { nameEn: string; nameAr: string };
  isShared?: boolean;
};
export type FriendDetails = Omit<
  Friendship,
  "sharedCount" | "totalRegistries"
> & {
  sharedWithYou: SharedRegistry[];
  yourRegistries: SharedRegistry[];
};

export const fetchFriends = (
  page: number,
  search: string,
  signal?: AbortSignal,
) =>
  http.get<FriendsPage<Friendship>>(base, {
    params: { page, limit: 20, search },
    signal,
  });
export const fetchFriendsSummary = () =>
  http.get<FriendsSummary>(`${base}/summary`);
export const discoverFriends = (
  page: number,
  search: string,
  signal?: AbortSignal,
) =>
  http.get<FriendsPage<DiscoveryPerson>>(`${base}/discover`, {
    params: { page, limit: 20, search },
    signal,
  });
export const fetchFriendRequests = (
  page: number,
  direction: "incoming" | "sent",
  signal?: AbortSignal,
) =>
  http.get<FriendsPage<FriendRequest>>(`${base}/requests`, {
    params: { page, limit: 20, direction },
    signal,
  });
export const fetchFriendRequest = (id: string) =>
  http.get<FriendRequest>(`${base}/requests/${id}`);
export const sendFriendRequest = (recipientId: string) =>
  http.post<FriendRequest>(`${base}/requests`, { recipientId });
export const respondToFriendRequest = (
  id: string,
  action: "accept" | "decline" | "cancel",
) => http.post<{ friendId: string }>(`${base}/requests/${id}/${action}`);
export const fetchFriendDetails = (id: string) =>
  http.get<FriendDetails>(`${base}/${id}`);
export const shareFriendRegistry = (
  id: string,
  registryId: string,
  shared: boolean,
) =>
  http.put<{ registryId: string; shared: boolean }>(
    `${base}/${id}/registries/${registryId}`,
    { shared },
  );
export const removeFriend = (id: string) => http.delete(`${base}/${id}`);
export const updateFriendDiscoverability = (discoverable: boolean) =>
  http.patch(`${base}/settings`, { discoverable });

export type PersonProfile = {
  person: Person;
  memberSince: string | null;
  connectedAt: string | null;
  relationship: "SELF" | DiscoveryPerson["relationship"];
  requestId: string | null;
  sharedRegistries: SharedRegistry[];
};
export const fetchPersonProfile = (id: string) =>
  http.get<PersonProfile>(`${base}/people/${id}`);
