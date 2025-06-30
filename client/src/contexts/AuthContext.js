/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
/* eslint-disable prettier/prettier */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create Axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAuthState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initializeAuth();
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Registration failed';
      throw new Error(errorMessage);
    }
  };

  // Login existing user
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
      return response.data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Login failed. Please check your credentials';
      throw new Error(errorMessage);
    }
  };

  // Social login
  const socialLogin = async (provider) => {
    try {
      window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/${provider}`;
    } catch (error) {
      throw error;
    }
  };

  // Reset password request
  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Password reset request failed';
      throw new Error(errorMessage);
    }
  };

  // Reset password confirm
  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Password reset failed';
      throw new Error(errorMessage);
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      
      // Update auth state
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Store the new token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Email verification failed. The link may have expired.';
      throw new Error(errorMessage);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        register,
        login,
        logout,
        socialLogin,
        forgotPassword,
        resetPassword,
        verifyEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);