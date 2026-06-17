import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
  setAccessToken,
} from "../services/api";

const AuthContext = createContext(null);

/**
 * Provides authentication state and helpers to the entire app.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── On mount: try to rehydrate user from /auth/me ─────
  const rehydrate = useCallback(async () => {
    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  // ─── Register ──────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  // ─── Login ─────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  // ─── Logout ────────────────────────────────────────────
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // proceed even if server call fails
    }
    setAccessToken(null);
    setUser(null);
  };

  // ─── Update user profile in context ────────────────────
  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, rehydrate }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}