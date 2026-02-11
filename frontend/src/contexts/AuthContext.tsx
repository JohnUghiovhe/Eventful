import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth.service';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isCreator: boolean;
  isEventee: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getUser();
        const token = localStorage.getItem('token');

        // If we have both user and token stored, try to validate the token
        if (storedUser && token) {
          try {
            // Make a simple API call to validate the token
            const response = await api.get('/auth/profile');
            if (response.data?.data) {
              setUser(response.data.data);
            } else {
              setUser(storedUser);
            }
          } catch (error) {
            // Token might be expired or invalid, clear it
            console.warn('Token validation failed, clearing auth:', error);
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    authService.setAuthData(token, userData);
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isCreator: user?.role === UserRole.CREATOR,
    isEventee: user?.role === UserRole.EVENTEE,
    login,
    logout,
    updateUser,
    isLoadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
