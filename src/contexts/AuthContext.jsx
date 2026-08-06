import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import usersService from "../services/usersService";
import { decodeJwt, isJwtExpired } from "../utils/jwt";

const AuthContext = createContext(null);

function mapJwtToAuthUser(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const isAdmin = Boolean(payload.isAdmin);
  const isRecruiter = Boolean(payload.isRecruiter);
  const role = isAdmin ? "admin" : isRecruiter ? "recruiter" : "registered";

  return {
    id: payload.id || payload.sub || payload.userId || "",
    isAdmin,
    isRecruiter,
    role,
  };
}

function hydrateAuthFromStorage() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return null;
  }

  if (isJwtExpired(token)) {
    localStorage.removeItem("authToken");
    return null;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    localStorage.removeItem("authToken");
    return null;
  }

  return mapJwtToAuthUser(payload);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => hydrateAuthFromStorage());

  useEffect(() => {
    const syncFromStorage = () => {
      setUser(hydrateAuthFromStorage());
    };

    window.addEventListener("auth-token-changed", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener("auth-token-changed", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await usersService.login(credentials);
    const token =
      data?.token || data?.jwt || data?.accessToken || data?.data?.token;

    const payload = decodeJwt(token);
    const nextUser = mapJwtToAuthUser(payload);

    if (!nextUser) {
      throw new Error("Login succeeded but token payload is invalid.");
    }

    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    await usersService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
