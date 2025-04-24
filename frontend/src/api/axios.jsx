import axios from "axios";
import { getAuthHeader } from "../utils/auth";

const api = axios.create({
  baseURL: "https://probwe.rikpetik.site/api/v1",
});

// Tambahkan token ke header setiap request
api.interceptors.request.use((config) => {
  const authHeader = getAuthHeader();
  if (authHeader.headers.Authorization) {
    config.headers = {
      ...config.headers,
      ...authHeader.headers,
    };
  }
  return config;
});

// Handle error 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/"; // Redirect ke login jika token invalid
    }
    return Promise.reject(error);
  }
);

export default api;
