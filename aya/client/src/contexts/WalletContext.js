import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setProvider(provider);
          const signer = await provider.getSigner();
          setSigner(signer);
          const address = await signer.getAddress();
          setAccount(address);
          
          const balance = await provider.getBalance(address);
          setBalance(ethers.formatEther(balance));
          
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    setIsConnecting(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setBalance(ethers.formatEther(balance));
      setChainId(Number(network.chainId));
      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setBalance('0');
    setChainId(null);
  };

  const switchToPolygon = async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Polygon Mainnet
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Polygon network:', addError);
          return false;
        }
      }
      console.error('Error switching to Polygon:', switchError);
      return false;
    }
  };

  const sendTransaction = async (to, value, gasLimit = 21000) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = {
        to,
        value: ethers.parseEther(value.toString()),
        gasLimit
      };

      const transaction = await signer.sendTransaction(tx);
      return transaction;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      checkConnection();
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16));
    checkConnection();
  };

  const refreshBalance = async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  const value = {
    provider,
    signer,
    account,
    balance,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    sendTransaction,
    refreshBalance,
    isConnected: !!account,
    isPolygon: chainId === 137
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
