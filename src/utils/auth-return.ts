import { getStorageItem, setStorageItem } from "./storage";

const key = "auth-registry-return";
export function registryReturnPath(path: string): string | null {
  if (path.includes("\\") || /[\r\n]/.test(path)) return null;
  const match = /^\/registry\/guest-view\?id=([a-zA-Z0-9-]+)$/.exec(path);
  return match ? path : null;
}
export function saveRegistryReturn(id: string) {
  const path = registryReturnPath(`/registry/guest-view?id=${id}`);
  if (path) setStorageItem(key, path);
}
export function takeRegistryReturn() {
  const path = registryReturnPath(getStorageItem(key) ?? "");
  setStorageItem(key, null);
  return path;
}
