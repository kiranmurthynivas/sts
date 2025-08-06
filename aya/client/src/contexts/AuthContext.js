import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://localhost:3000/api';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post('/auth/register', { email, password });
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on client side even if server request fails
      setUser(null);
      return { success: true };
    }
  };

  const connectWallet = async (walletAddress) => {
    try {
      const response = await axios.post('/auth/connect-wallet', { walletAddress });
      setUser(response.data.user);
      return { success: true, user: response.data.user, balance: response.data.walletBalance };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to connect wallet';
      return { success: false, error: message };
    }
  };

  const disconnectWallet = async () => {
    try {
      const response = await axios.post('/auth/disconnect-wallet');
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to disconnect wallet';
      return { success: false, error: message };
    }
  };

  const getWalletBalance = async () => {
    try {
      const response = await axios.get('/auth/wallet-balance');
      return { success: true, balance: response.data.balance };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to get wallet balance';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    connectWallet,
    disconnectWallet,
    getWalletBalance,
    refreshUser: checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
