'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { ethers } from 'ethers';
import { supabase } from '@/lib/supabase/client';

type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  error: string | null;
  loading: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { data: session, update } = useSession();
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            
            setProvider(provider);
            setSigner(signer);
            setAddress(address);
            setChainId(Number(network.chainId));
            setIsConnected(true);
            
            // Update user's wallet address in the database if logged in
            if (session?.user?.id) {
              await updateWalletAddress(session.user.id, address);
            }
          }
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
        setError('Failed to check wallet connection');
      } finally {
        setLoading(false);
      }
    };

    checkConnection();

    // Set up event listeners for account and chain changes
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // Disconnected
          setAddress(null);
          setIsConnected(false);
          setSigner(null);
          setChainId(null);
          
          // Clear wallet address in the database if logged in
          if (session?.user?.id) {
            await updateWalletAddress(session.user.id, null);
          }
        } else {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAddress(accounts[0]);
          setChainId(Number(network.chainId));
          setIsConnected(true);
          
          // Update user's wallet address in the database if logged in
          if (session?.user?.id) {
            await updateWalletAddress(session.user.id, accounts[0]);
          }
        }
      };

      const handleChainChanged = async () => {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [session]);

  const updateWalletAddress = async (userId: string, address: string | null) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ wallet_address: address })
        .eq('id', userId);

      if (error) throw error;
      
      // Update the session with the new wallet address
      await update({
        ...session,
        user: {
          ...session?.user,
          walletAddress: address,
        },
      });
    } catch (err) {
      console.error('Error updating wallet address:', err);
      throw new Error('Failed to update wallet address');
    }
  };

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Web3 provider');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access if needed
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      // Update user's wallet address in the database if logged in
      if (session?.user?.id) {
        await updateWalletAddress(session.user.id, address);
      }
      
      return address;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // There's no standard way to disconnect a wallet in MetaMask
      // We'll just reset our local state
      setAddress(null);
      setIsConnected(false);
      setProvider(null);
      setSigner(null);
      setChainId(null);
      
      // Clear wallet address in the database if logged in
      if (session?.user?.id) {
        await updateWalletAddress(session.user.id, null);
      }
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connect,
        disconnect,
        provider,
        signer,
        chainId,
        error,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
