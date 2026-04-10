export type AdminMediaUploadScope = "product" | "team";

export interface AdminMediaUploadResponse {
  bytes: number;
  contentType: string;
  height: number;
  url: string;
  width: number;
}

export async function uploadAdminMedia(
  file: File,
  scope: AdminMediaUploadScope,
): Promise<AdminMediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("scope", scope);

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | (AdminMediaUploadResponse & { error?: string })
    | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.error ?? "No se pudo subir la imagen.");
  }

  return payload;
}
