import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { onlineManager } from "@tanstack/react-query";
import { useOnlineManager } from "../useOnlineManager";
import { useRegistryPhoto } from "../useRegistryPhoto";
import * as ImagePicker from "expo-image-picker";
import { updateRegistry } from "@/services/registries.service";
import {
  uploadRegistryLogo,
  deleteUploadedImageByPath,
} from "@/services/upload.service";
import { cacheRegistryUpdate } from "@/utils/registry-cache";
import Toast from "react-native-toast-message";

let mockNetwork: (state: unknown) => void;
jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    addEventListener: (callback: any) => {
      mockNetwork = callback;
      return () => {};
    },
  },
}));
jest.mock("@/api/queryClient", () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));
jest.mock("@/utils/registry-cache", () => ({ cacheRegistryUpdate: jest.fn() }));
jest.mock("@/services/registries.service", () => ({
  updateRegistry: jest.fn(),
}));
jest.mock("@/services/upload.service", () => ({
  uploadRegistryLogo: jest.fn(),
  deleteUploadedImageByPath: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));
let tree: ReactTestRenderer;
beforeEach(() => {
  jest.clearAllMocks();
  onlineManager.setOnline(true);
  (
    ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
  ).mockResolvedValue({ granted: true });
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
    canceled: false,
    assets: [
      { uri: "file://photo.png", fileName: "photo.png", mimeType: "image/png" },
    ],
  });
  (uploadRegistryLogo as jest.Mock).mockResolvedValue({
    path: "/new-photo.png",
  });
  (updateRegistry as jest.Mock).mockResolvedValue({
    id: "registry",
    logo: "/new-photo.png",
  });
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  onlineManager.setOnline(true);
});

it("allows API requests when a connected network has an unknown or failed internet probe", async () => {
  function Network() {
    useOnlineManager();
    return null;
  }
  await act(async () => {
    tree = create(<Network />);
  });
  for (const isInternetReachable of [null, false, true]) {
    mockNetwork({ isConnected: true, isInternetReachable });
    expect(onlineManager.isOnline()).toBe(true);
  }
  mockNetwork({ isConnected: false, isInternetReachable: false });
  expect(onlineManager.isOnline()).toBe(false);
});

async function photo() {
  function Photo() {
    const props = useRegistryPhoto({ id: "registry" } as any);
    return React.createElement("photo-control", props);
  }
  await act(async () => {
    tree = create(<Photo />);
  });
  return () => tree.root.findByType("photo-control" as any);
}

it("uploads a selected photo and saves its path to the registry", async () => {
  const control = await photo();
  await act(async () => control().props.selectPhoto());
  expect(updateRegistry).toHaveBeenCalledWith("registry", {
    logo: "/new-photo.png",
  });
  expect(cacheRegistryUpdate).toHaveBeenCalledWith({
    id: "registry",
    logo: "/new-photo.png",
  });
  expect(control().props.isUploading).toBe(false);
  expect(control().props.previewUri).toBeUndefined();
});

it("does not upload when the picker is cancelled or permission is denied", async () => {
  const control = await photo();
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
    canceled: true,
  });
  await act(async () => control().props.selectPhoto());
  (
    ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
  ).mockResolvedValueOnce({ granted: false });
  await act(async () => control().props.selectPhoto());
  expect(uploadRegistryLogo).not.toHaveBeenCalled();
  expect(updateRegistry).not.toHaveBeenCalled();
});

it("rolls back the preview and cleans an upload explicitly rejected by the API", async () => {
  const control = await photo();
  (updateRegistry as jest.Mock).mockRejectedValueOnce({
    detail: "Not allowed",
    status: 403,
  });
  await act(async () => control().props.selectPhoto());
  expect(cacheRegistryUpdate).not.toHaveBeenCalled();
  expect(deleteUploadedImageByPath).toHaveBeenCalledWith("/new-photo.png");
  expect(Toast.show).toHaveBeenCalledWith({
    type: "error",
    text1: "Not allowed",
  });
  expect(control().props.previewUri).toBeUndefined();
});

it("keeps the uploaded file after an ambiguous timeout so a committed photo is not deleted", async () => {
  const control = await photo();
  (updateRegistry as jest.Mock).mockRejectedValueOnce({ detail: "Timed out" });
  await act(async () => control().props.selectPhoto());
  expect(deleteUploadedImageByPath).not.toHaveBeenCalled();
});
