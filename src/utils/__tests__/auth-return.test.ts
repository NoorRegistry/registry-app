import {
  registryReturnPath,
  saveRegistryReturn,
  takeRegistryReturn,
} from "../auth-return";
import { getStorageItem, setStorageItem } from "../storage";
jest.mock("../storage", () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());
it("preserves a registry link through login and consumes it only once", () => {
  saveRegistryReturn("00000000-0000-4000-8000-000000000001");
  const path = "/registry/guest-view?id=00000000-0000-4000-8000-000000000001";
  expect(setStorageItem).toHaveBeenCalledWith("auth-registry-return", path);
  (getStorageItem as jest.Mock)
    .mockReturnValueOnce(path)
    .mockReturnValueOnce(null);
  expect(takeRegistryReturn()).toBe(path);
  expect(setStorageItem).toHaveBeenLastCalledWith("auth-registry-return", null);
  expect(takeRegistryReturn()).toBeNull();
});
it.each([
  "https://evil.invalid",
  "//evil.invalid",
  "/registry/guest-view?id=abc&code=123456",
  "/registry/guest-view?id=../profile",
  "/registry/guest-view?id=a\r\n",
  "/profile",
])("rejects unsafe or unrelated destinations (%s)", (path) => {
  expect(registryReturnPath(path)).toBeNull();
});
