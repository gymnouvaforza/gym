export interface AdminVideoUploadResponse {
  bytes: number;
  contentType: string;
  url: string;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
}

export async function uploadAdminVideo(
  file: File,
  options?: UploadOptions,
): Promise<AdminVideoUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options?.onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        options.onProgress(percent);
      }
    };

    xhr.onload = () => {
      let payload: (AdminVideoUploadResponse & { error?: string }) | null = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // Fallback if not JSON
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload) {
        resolve(payload);
      } else {
        reject(new Error(payload?.error ?? "No se pudo subir el video."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Error de red al intentar subir el video."));
    };

    xhr.onabort = () => {
      reject(new Error("Subida cancelada."));
    };

    xhr.open("POST", "/api/admin/media/video");
    xhr.send(formData);
  });
}
