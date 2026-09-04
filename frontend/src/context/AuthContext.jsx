import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/musicApi';

const AuthContext = createContext(null);

export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (jwtToken) => {
    if (!jwtToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Try decoding locally first for instantaneous rendering
    const decoded = parseJwt(jwtToken);
    if (decoded) {
      setUser({
        email: decoded.sub,
        name: decoded.name || decoded.sub?.split('@')[0] || 'User',
        profilePicture: decoded.picture || null,
        role: decoded.role || 'USER',
      });
    }

    try {
      const liveUser = await authApi.getMe();
      if (liveUser) {
        setUser(liveUser);
      }
    } catch (err) {
      // If token expired or invalid
      console.warn('Could not fetch current user profile:', err.message);
      if (err.message.includes('401') || err.message.includes('403')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile(token);
  }, [token, fetchProfile]);

  const login = useCallback((newToken) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    fetchProfile(newToken);
  }, [fetchProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token && !!user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
