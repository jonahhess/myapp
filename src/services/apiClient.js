import axios from "axios";
import { isJwtExpired } from "../utils/jwt";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      if (isJwtExpired(token)) {
        setAuthToken(null);
      } else {
        config.headers["token-auth-x"] = token;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || error?.message || "Request failed";

    if (status === 401) {
      setAuthToken(null);
    }

    return Promise.reject({
      status,
      message,
      data: error?.response?.data,
      originalError: error,
    });
  },
);

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }

  window.dispatchEvent(
    new CustomEvent("auth-token-changed", { detail: { token: token || "" } }),
  );
}

export default apiClient;
