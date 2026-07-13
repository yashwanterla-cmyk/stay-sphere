import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("[API] Request:", config.method, config.url, "headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// Interceptor to handle session expiration (unauthorized response)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally reload or redirect to login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    console.error("[API] Response error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
