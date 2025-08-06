'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { shortenAddress } from '@/lib/utils';

export default function WalletConnectButton() {
  const { 
    address, 
    isConnected, 
    connect, 
    disconnect, 
    chainId, 
    loading, 
    error 
  } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);

  // Fix for Next.js hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Error connecting wallet:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDisconnect(false);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };

  if (!mounted) {
    return (
      <button 
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
        disabled
      >
        Loading...
      </button>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDisconnect(!showDisconnect)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span>{shortenAddress(address)}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${showDisconnect ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </button>
        
        {showDisconnect && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={handleDisconnect}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        loading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
