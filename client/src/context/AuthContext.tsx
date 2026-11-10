import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { authApi, setToken, clearToken, getToken } from '../api/client';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (creds: { email: string; password: string }) => Promise<void>;
  updateProfile: (data: { email: string; name?: string; currentPassword: string; newPassword?: string }) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (creds: { email: string; password: string }) => {
    const res = await authApi.login(creds);
    setToken(res.token);
    setUser(res.user);
  };

  const updateProfile = async (data: { email: string; name?: string; currentPassword: string; newPassword?: string }) => {
    const res = await authApi.updateProfile(data);
    setToken(res.token);
    setUser(res.user);
    return res.message;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      clearToken();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, updateProfile, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
