import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { queryClient } from "@/api/queryClient";
import { updateRegistry } from "@/services/registries.service";
import {
  uploadRegistryLogo,
  deleteUploadedImageByPath,
} from "@/services/upload.service";
import { IRegistryDetails } from "@/types";
import { getApiErrorMessage } from "@/utils/api-error";
import { cacheRegistryUpdate } from "@/utils/registry-cache";

export function useRegistryPhoto(registry: IRegistryDetails) {
  const { t } = useTranslation();
  const busy = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string>();
  const selectPhoto = async () => {
    if (busy.current) return;
    busy.current = true;
    const registryId = registry.id;
    let uploadedPath: string | undefined;
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: t("registry.photoPermissionRequired"),
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        selectionLimit: 1,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setPreviewUri(asset.uri);
      setIsUploading(true);
      const uploaded = await uploadRegistryLogo({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });
      uploadedPath = uploaded.path;
      const updated = await updateRegistry(registryId, { logo: uploaded.path });
      cacheRegistryUpdate(updated);
      Toast.show({ type: "success", text1: t("common.saved") });
    } catch (error) {
      // A timeout may happen after a successful save. Only remove the upload
      // when the API explicitly rejected it, then reload the stored registry.
      const status = (error as { status?: number })?.status;
      if (uploadedPath && status && status >= 400 && status < 500) {
        void deleteUploadedImageByPath(uploadedPath).catch(() => undefined);
      }
      if (uploadedPath)
        void queryClient.invalidateQueries({
          queryKey: ["registryById", registryId],
        });
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("registry.logoUploadFailed")),
      });
    } finally {
      busy.current = false;
      setIsUploading(false);
      setPreviewUri(undefined);
    }
  };
  return { selectPhoto, isUploading, previewUri };
}
