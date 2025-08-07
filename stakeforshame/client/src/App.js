import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateHabit from './components/CreateHabit';
import HabitTracker from './components/HabitTracker';
import WalletConnect from './components/WalletConnect';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and set user
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      // In a real app, you'd verify the token with your backend
      // For now, we'll just check if it exists
      if (token) {
        // Decode JWT token (basic implementation)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.userId,
          email: payload.email
        });
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        
        setWallet(provider);
        setWalletAddress(address);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          setWalletAddress(accounts[0] || '');
        });
        
        return address;
      } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
      }
    } else {
      throw new Error('MetaMask not found. Please install MetaMask extension.');
    }
  };

  const logout = () => {
    setUser(null);
    setWallet(null);
    setWalletAddress('');
    localStorage.removeItem('token');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-white">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Dashboard 
                  user={user} 
                  wallet={wallet}
                  walletAddress={walletAddress}
                  connectWallet={connectWallet}
                  logout={logout}
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/create-habit" 
            element={
              user ? (
                <CreateHabit 
                  user={user}
                  wallet={wallet}
                  walletAddress={walletAddress}
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/habits" 
            element={
              user ? (
                <HabitTracker 
                  user={user}
                  wallet={wallet}
                  walletAddress={walletAddress}
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
