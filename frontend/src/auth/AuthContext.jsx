import React, { createContext, useContext, useMemo, useState } from "react";
import { apiLogin, logoutApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const isAuthenticated = !!token;

  const login = async (email, password) => {
    const { token } = await apiLogin(email, password);
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    logoutApi();
    setToken(null);
  };

  const value = useMemo(
    () => ({ token, isAuthenticated, login, logout }),
    [token, isAuthenticated]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}