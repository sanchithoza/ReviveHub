"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { httpClient, registerViewOnlyErrorHandler, unregisterViewOnlyErrorHandler } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
  view_only: boolean;
  customer_id: number | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  viewOnlyErrorMessage: string | null;
  clearViewOnlyError: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("auth_token");
}

function storeToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

function clearToken(): void {
  localStorage.removeItem("auth_token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewOnlyErrorMessage, setViewOnlyErrorMessage] = useState<string | null>(null);

  const clearViewOnlyError = useCallback(() => {
    setViewOnlyErrorMessage(null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearToken();
    delete httpClient.defaults.headers.common["Authorization"];
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await httpClient.post("/auth/login", { username, password });
    const data = response.data;
    storeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    httpClient.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  }, []);

  useEffect(() => {
    registerViewOnlyErrorHandler((message: string) => {
      setViewOnlyErrorMessage(message);
    });

    return () => {
      unregisterViewOnlyErrorHandler();
    };
  }, []);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setIsInitialized(true);
      return;
    }

    httpClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

    httpClient
      .get("/auth/me")
      .then((response) => {
        setUser(response.data);
        setToken(storedToken);
      })
      .catch(() => {
        clearToken();
        delete httpClient.defaults.headers.common["Authorization"];
      })
      .finally(() => {
        setIsInitialized(true);
      });
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: user !== null,
    isInitialized,
    viewOnlyErrorMessage,
    clearViewOnlyError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
