"use client";

import { clearTokens, getUser, setTokens, setUser, StoredUser } from "@/lib/api";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  login: (user: StoredUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getUser();
    setUserState(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (u: StoredUser, accessToken: string, refreshToken: string) => {
      setTokens(accessToken, refreshToken);
      setUser(u);
      setUserState(u);
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    setUserState(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}