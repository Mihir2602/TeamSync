/* eslint-disable prettier/prettier */
// authService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  // Helper method for API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Register user
  async registerUser(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Login user
  async loginUser(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Verify token
  async verifyToken(token) {
    return this.makeRequest('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Request password reset
  async resetPasswordRequest(email) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Confirm password reset
  async resetPasswordConfirm(token, password) {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Verify email token
  async verifyEmailToken(token) {
    return this.makeRequest(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  }

  // Refresh token
  async refreshToken() {
    return this.makeRequest('/auth/refresh', {
      method: 'POST',
    });
  }

  // Logout (if you have server-side logout logic)
  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }
}

// Create singleton instance
const authService = new AuthService();

// Export individual methods for backward compatibility
export const registerUser = (userData) => authService.registerUser(userData);
export const loginUser = (credentials) => authService.loginUser(credentials);
export const verifyToken = (token) => authService.verifyToken(token);
export const resetPasswordRequest = (email) => authService.resetPasswordRequest(email);
export const resetPasswordConfirm = (token, password) => authService.resetPasswordConfirm(token, password);
export const verifyEmailToken = (token) => authService.verifyEmailToken(token);

// Export service instance
export default authService;