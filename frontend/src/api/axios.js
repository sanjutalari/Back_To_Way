import axios from "axios";

const defaultBaseURL = window.location.hostname.endsWith("onrender.com")
  ? `${window.location.origin}/api`
  : "http://localhost:5001/api";

export const apiOrigin = (import.meta.env.VITE_API_BASE_URL || defaultBaseURL).replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseURL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (config.headers && config.headers.set) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
