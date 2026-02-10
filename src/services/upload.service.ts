import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";

interface IUploadResponse {
  status: number;
  message: string;
  id?: string;
  path: string;
}

export const uploadRegistryLogo = async (payload: {
  uri: string;
  fileName?: string;
  mimeType?: string;
}) => {
  const formData = new FormData();

  formData.append("file", {
    uri: payload.uri,
    name: payload.fileName ?? `registry-logo-${Date.now()}.jpg`,
    type: payload.mimeType ?? "image/jpeg",
  } as any);

  return await http.post<IUploadResponse>(
    `${endpoints.upload.index}?type=registry`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export const deleteUploadedImageByPath = async (url: string) => {
  return await http.post<{ status: number; message: string }>(
    `${endpoints.upload.index}/delete`,
    { url },
  );
};
