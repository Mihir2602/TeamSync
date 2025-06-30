/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data.user);
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Social login (Google)
  const socialLogin = async (provider, token) => {
    try {
      setIsLoading(true);
      setError(null);

      // Verify the token with backend
      const response = await axios.post('/api/auth/social', {
        token
      });

      // Set user data
      setUser(response.data.user);
      localStorage.setItem('token', token);

      // Return success status
      return true;
    } catch (err) {
      console.error(`${provider} login failed:`, err);
      setError(err.response?.data?.message || `${provider} login failed`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Regular login
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', credentials);
      
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      
      return response.data;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Check authentication status
  const isAuthenticated = () => {
    return !!user;
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    socialLogin,
    setError
  };
};

// Export the useAuth hook directly
export const useAuthHook = () => useAuth();

// Default export for backward compatibility
export default useAuthHook;