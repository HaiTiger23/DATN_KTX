import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const onAuthFail = () => {
      logout();
    };
    window.addEventListener('ktx:auth-failed', onAuthFail);
    return () => window.removeEventListener('ktx:auth-failed', onAuthFail);
  }, [logout]);

  const loginSuccess = useCallback((data) => {
    setToken(data.token);
    setUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    showToast('Đăng nhập thành công');
  }, [showToast]);

  const registerSuccess = useCallback((data) => {
    setToken(data.token);
    setUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    showToast('Đăng ký thành công');
  }, [showToast]);

  const updateUserLocal = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      setUser,
      logout,
      loginSuccess,
      registerSuccess,
      updateUserLocal,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user, logout, loginSuccess, registerSuccess, updateUserLocal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
