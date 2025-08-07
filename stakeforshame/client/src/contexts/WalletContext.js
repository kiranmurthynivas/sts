import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const response = await axios.get('/api/wallet/info');
      if (response.data.walletInfo.address) {
        setWalletAddress(response.data.walletInfo.address);
        setIsConnected(true);
        await fetchBalance();
      }
    } catch (error) {
      // Wallet not connected
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed. Please install MetaMask first.');
        return { success: false };
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        toast.error('No accounts found');
        return { success: false };
      }

      const address = accounts[0];
      
      // Connect to backend
      const response = await axios.post('/api/wallet/connect', {
        walletAddress: address
      });

      setWalletAddress(address);
      setIsConnected(true);
      await fetchBalance();
      
      toast.success('Wallet connected successfully!');
      return { success: true, address };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to connect wallet';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await axios.post('/api/wallet/disconnect');
      setWalletAddress(null);
      setIsConnected(false);
      setBalance(null);
      toast.success('Wallet disconnected');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    }
  };

  const fetchBalance = async () => {
    if (!walletAddress) return;
    
    try {
      const response = await axios.get('/api/wallet/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const sendTransaction = async (toAddress, amount, type = 'stake') => {
    try {
      const response = await axios.post('/api/transactions', {
        toAddress,
        amount,
        type
      });
      
      toast.success('Transaction sent successfully!');
      return { success: true, transactionHash: response.data.transactionHash };
    } catch (error) {
      const message = error.response?.data?.error || 'Transaction failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getTransactionHistory = async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/transactions?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch transaction history');
      return { transactions: [], pagination: {} };
    }
  };

  const value = {
    walletAddress,
    isConnected,
    balance,
    loading,
    connectWallet,
    disconnectWallet,
    fetchBalance,
    sendTransaction,
    getTransactionHistory
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
