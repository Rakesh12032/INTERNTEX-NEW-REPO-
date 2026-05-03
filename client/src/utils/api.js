import axios from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("Interntex_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !error.config?.skipAuthRedirect) {
      localStorage.removeItem("Interntex_token");
      localStorage.removeItem("Interntex_user");
      window.dispatchEvent(new Event("Interntex:logout"));

      const loginPath = window.location.pathname.startsWith("/admin") ? "/admin-login" : "/login";

      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
