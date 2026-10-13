import axios from "axios";
import constants from "@/constants";
import { getStorageItem, setStorageItem } from "../storage";
import { handleRefreshToken } from "../auth-helper";

jest.mock("axios");
jest.mock("@/api/base-url", () => ({
  getApiBaseUrl: () => "http://test.invalid",
}));
jest.mock("../storage", () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
}));
jest.mock("../helper", () => ({
  isTokenExpired: (token: string) => token.startsWith("expired"),
}));
const post = axios.post as jest.Mock;
const setStorage = setStorageItem as jest.Mock;
const stored = JSON.stringify({
  accessToken: "expired-access",
  refreshToken: "valid-refresh",
});

beforeEach(() => {
  jest.clearAllMocks();
  (getStorageItem as jest.Mock).mockReturnValue(stored);
  (axios.isAxiosError as unknown as jest.Mock).mockImplementation((error) =>
    Boolean(error?.isAxiosError),
  );
});

it.each([undefined, 500, 429])(
  "preserves the session on transient refresh failure (%s)",
  async (status) => {
    post.mockRejectedValue({
      isAxiosError: true,
      response: status ? { status } : undefined,
    });
    await expect(handleRefreshToken()).rejects.toBeDefined();
    expect(setStorage).not.toHaveBeenCalled();
  },
);

it.each([401, 403])(
  "clears the session when refresh is rejected (%s)",
  async (status) => {
    post.mockRejectedValue({ isAxiosError: true, response: { status } });
    await expect(handleRefreshToken()).rejects.toBeDefined();
    expect(setStorage).toHaveBeenCalledWith(constants.ACCESS_TOKEN, null);
  },
);

it("bounds an unreachable refresh request and preserves the session", async () => {
  post.mockRejectedValue({ isAxiosError: true, code: "ECONNABORTED" });
  await expect(handleRefreshToken()).rejects.toBeDefined();
  expect(post.mock.calls[0][2].timeout).toBe(15000);
  expect(setStorage).not.toHaveBeenCalled();
});

it("shares one rotation between simultaneous API requests", async () => {
  const refreshed = { accessToken: "new-access", refreshToken: "new-refresh" };
  post.mockResolvedValue({ data: refreshed });
  await Promise.all([
    handleRefreshToken(),
    handleRefreshToken(),
    handleRefreshToken(),
  ]);
  expect(post).toHaveBeenCalledTimes(1);
  expect(setStorage).toHaveBeenCalledWith(
    constants.ACCESS_TOKEN,
    JSON.stringify(refreshed),
  );
});

it("clears expired refresh tokens without making an API request", async () => {
  (getStorageItem as jest.Mock).mockReturnValue(
    JSON.stringify({
      accessToken: "expired-access",
      refreshToken: "expired-refresh",
    }),
  );
  await handleRefreshToken();
  expect(post).not.toHaveBeenCalled();
  expect(setStorage).toHaveBeenCalledWith(constants.ACCESS_TOKEN, null);
});

it("does not overwrite a session with a malformed server response", async () => {
  post.mockResolvedValue({ data: {} });
  await expect(handleRefreshToken()).rejects.toThrow(
    "Invalid refresh response",
  );
  expect(setStorage).not.toHaveBeenCalled();
});
