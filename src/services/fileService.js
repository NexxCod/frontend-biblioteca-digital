import api from "./api";

const listFiles = async (folderId, params = {}) => {
  if (!folderId) {
    console.error("listFiles requiere un folderId");
    return [];
  }

  try {
    const queryParams = new URLSearchParams({ folderId, ...params });

    Object.keys(params).forEach((key) => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        params[key] === ""
      ) {
        queryParams.delete(key);
      }
    });

    const response = await api.get(`/files?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error listando archivos para carpeta ${folderId}:`, error);
    throw error;
  }
};

const uploadFile = async (formData, onProgress) => {
  try {
    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total || !onProgress) {
          return;
        }

        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error subiendo archivo:", error);
    throw error;
  }
};

const addLink = async (payload) => {
  try {
    const response = await api.post("/files/add-link", payload);
    return response.data;
  } catch (error) {
    console.error("Error añadiendo enlace:", error);
    throw error;
  }
};

const deleteFile = async (fileId) => {
  if (!fileId) {
    throw new Error("Se requiere fileId para eliminar archivo.");
  }

  try {
    await api.delete(`/files/${fileId}`);
  } catch (error) {
    console.error(`Error eliminando archivo ${fileId}:`, error);
    throw error;
  }
};

const updateFile = async (fileId, updateData) => {
  if (!fileId) {
    throw new Error("Se requiere fileId para actualizar archivo/enlace.");
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    console.warn("updateFile llamado sin datos para actualizar.");
    return null;
  }

  try {
    const response = await api.put(`/files/${fileId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error actualizando archivo/enlace ${fileId}:`, error);
    throw error;
  }
};

const fileService = {
  listFiles,
  uploadFile,
  addLink,
  deleteFile,
  updateFile,
};

export default fileService;
