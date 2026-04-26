import api from "./api";

const startDirectUploadSession = async (payload) => {
  try {
    const response = await api.post("/google/drive/upload-session", payload);
    return response.data;
  } catch (error) {
    console.error("Error creando sesión de subida directa:", error);
    throw error;
  }
};

const uploadFileToGoogle = (uploadUrl, file, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }

      const percentCompleted = Math.round((event.loaded * 100) / event.total);
      onProgress(percentCompleted);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const responseData = xhr.responseText
            ? JSON.parse(xhr.responseText)
            : null;
          resolve(responseData);
        } catch {
          reject(new Error("Google Drive devolvió una respuesta inválida."));
        }
        return;
      }

      reject(
        new Error(`La subida directa a Google falló con estado ${xhr.status}.`)
      );
    };

    xhr.onerror = () => {
      reject(new Error("No se pudo completar la subida directa a Google."));
    };

    xhr.send(file);
  });

// `payload` debe incluir `uploadToken` (devuelto por startDirectUploadSession).
// El backend usa folder/assignedGroup desde el token firmado, no del body.
const finalizeDirectUpload = async (payload) => {
  if (!payload?.uploadToken) {
    throw new Error(
      "Falta uploadToken — debe pasarse el token devuelto por startDirectUploadSession."
    );
  }
  try {
    const response = await api.post("/google/drive/finalize", payload);
    return response.data;
  } catch (error) {
    console.error("Error finalizando subida directa:", error);
    throw error;
  }
};

const driveUploadService = {
  startDirectUploadSession,
  uploadFileToGoogle,
  finalizeDirectUpload,
};

export default driveUploadService;
