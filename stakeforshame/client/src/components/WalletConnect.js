import React, { useState } from 'react';
import { Wallet, Copy, ExternalLink } from 'lucide-react';

const WalletConnect = ({ wallet, walletAddress, connectWallet, disconnectWallet }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExplorer = () => {
    window.open(`https://polygonscan.com/address/${walletAddress}`, '_blank');
  };

  if (walletAddress) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-2">
          <Wallet className="h-4 w-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyAddress}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy address"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={openExplorer}
            className="text-gray-400 hover:text-white transition-colors"
            title="View on explorer"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleDisconnect}
            className="text-gray-400 hover:text-red-400 transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>
        
        {copied && (
          <span className="text-green-400 text-sm">Address copied!</span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
};

export default WalletConnect;
