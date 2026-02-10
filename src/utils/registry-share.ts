const REGISTRY_GUEST_VIEW_PATH = "registry/guest-view";

export const buildRegistryShareLink = (registryId: string): string => {
  const normalizedId = registryId.trim();
  const shareBaseUrl = process.env.EXPO_PUBLIC_SHARE_BASE_URL?.trim();

  if (!shareBaseUrl) {
    throw new Error("EXPO_PUBLIC_SHARE_BASE_URL is required for sharing.");
  }

  const base = shareBaseUrl.endsWith("/")
    ? shareBaseUrl.slice(0, -1)
    : shareBaseUrl;

  return `${base}/${REGISTRY_GUEST_VIEW_PATH}?id=${encodeURIComponent(normalizedId)}`;
};
