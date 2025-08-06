import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, connectWallet, disconnectWallet } = useAuth();
  const { account, balance, isConnected, connectWallet: connectMetaMask, disconnectWallet: disconnectMetaMask, isConnecting, chainId, switchToPolygon } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleConnectWallet = async () => {
    try {
      const walletAddress = await connectMetaMask();
      const result = await connectWallet(walletAddress);
      
      if (!result.success) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      disconnectMetaMask();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleSwitchToPolygon = async () => {
    const success = await switchToPolygon();
    if (!success) {
      alert('Failed to switch to Polygon network. Please switch manually in MetaMask.');
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(4);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard">
            <span className="brand-icon">🎯</span>
            Stake-for-Shame
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-item">
            Dashboard
          </Link>
          <Link to="/create-habit" className="navbar-item">
            Create Habit
          </Link>
          <Link to="/transactions" className="navbar-item">
            Transactions
          </Link>
        </div>

        <div className="navbar-actions">
          {/* Wallet Connection */}
          <div className="wallet-section">
            {!user?.isWalletConnected ? (
              <button 
                onClick={handleConnectWallet} 
                disabled={isConnecting}
                className="connect-wallet-btn"
              >
                {isConnecting ? 'Connecting...' : '🦊 Connect Wallet'}
              </button>
            ) : (
              <div className="wallet-info" onClick={() => setShowWalletMenu(!showWalletMenu)}>
                <div className="wallet-address">
                  <span className="wallet-icon">💰</span>
                  {formatAddress(account)}
                </div>
                <div className="wallet-balance">
                  {formatBalance(balance)} MATIC
                </div>
                
                {showWalletMenu && (
                  <div className="wallet-menu">
                    <div className="wallet-menu-item">
                      <strong>Address:</strong> {account}
                    </div>
                    <div className="wallet-menu-item">
                      <strong>Balance:</strong> {formatBalance(balance)} MATIC
                    </div>
                    <div className="wallet-menu-item">
                      <strong>Network:</strong> {chainId === 137 ? 'Polygon' : `Chain ${chainId}`}
                    </div>
                    
                    {chainId !== 137 && (
                      <button 
                        onClick={handleSwitchToPolygon}
                        className="wallet-menu-button switch-network"
                      >
                        Switch to Polygon
                      </button>
                    )}
                    
                    <button 
                      onClick={handleDisconnectWallet}
                      className="wallet-menu-button disconnect"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="user-section">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
