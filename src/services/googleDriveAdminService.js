import api from "./api";

const getStatus = async ({ verify = false } = {}) => {
  const response = await api.get("/google/admin/drive/status", {
    params: verify ? { verify: 1 } : undefined,
  });
  return response.data;
};

const requestAuthUrl = async () => {
  const response = await api.post("/google/admin/drive/auth-url");
  return response.data;
};

const saveManualToken = async (refreshToken, scopes) => {
  const response = await api.post("/google/admin/drive/refresh-token", {
    refreshToken,
    scopes,
  });
  return response.data;
};

const clearCredential = async () => {
  const response = await api.delete("/google/admin/drive/credential");
  return response.data;
};

const googleDriveAdminService = {
  getStatus,
  requestAuthUrl,
  saveManualToken,
  clearCredential,
};

export default googleDriveAdminService;
