import { http } from "@/api/http";
export const supportTopics = [
  "ORDERS",
  "REGISTRIES",
  "GIFTS",
  "FRIENDS",
  "ACCOUNT",
  "APP",
] as const;
export type SupportTopic = (typeof supportTopics)[number];
export type SupportMessage = {
  id: number;
  clientId: string;
  sender: "REQUESTER" | "SUPPORT" | "SYSTEM";
  actorName: string;
  body: string;
  createdAt: string;
};
export type SupportRequest = {
  id: string;
  subject: string;
  topic: SupportTopic;
  status: "OPEN" | "RESOLVED";
  orderId: string | null;
  orderReference: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: SupportMessage | null;
  unreadCount: number;
};
export type SupportDetail = SupportRequest & {
  messages: SupportMessage[];
  nextBefore: number | null;
};
export type SupportArticle = {
  id: string;
  topic: SupportTopic;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
};
export type SupportPage = {
  data: SupportRequest[];
  page: number;
  totalPages: number;
  total: number;
};
const base = "/v1/api/users/support";
export const fetchSupportRequests = (page = 1, status?: string, limit = 20) =>
  http.get<SupportPage>(base, { params: { page, limit, status } });
export const fetchSupportDetail = (id: string, before?: number) =>
  http.get<SupportDetail>(`${base}/${id}`, { params: { before } });
export const createSupportRequest = (body: {
  id: string;
  topic: SupportTopic;
  subject: string;
  message: string;
  orderId?: string;
}) => http.post<SupportDetail>(base, body);
export const sendSupportReply = (
  id: string,
  body: { clientId: string; message: string },
) => http.post<SupportDetail>(`${base}/${id}/messages`, body);
export const setSupportStatus = (id: string, status: "OPEN" | "RESOLVED") =>
  http.patch<SupportDetail>(`${base}/${id}/status`, { status });
export const readSupportRequest = (id: string, through: number) =>
  http.post(`${base}/${id}/read`, { through });
export const fetchSupportArticles = () =>
  http.get<SupportArticle[]>(`${base}/articles`);
