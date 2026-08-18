import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Token verification failed:", e);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const googleLogin = async (idToken) => {
    const data = await authService.googleLogin(idToken);
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };
  
  const register = async (userData) => {
    const { confirm, confirmPassword, ...payload } = userData;
    const data = await authService.register(payload);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
