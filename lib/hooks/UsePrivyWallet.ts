"use client";

import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

// Define wallet interface to fix type errors
interface Wallet {
  walletClientType: string;
  getEthereumProvider: () => Promise<any>;
}

export function usePrivyWallet() {
  const { 
    ready,
    authenticated,
    user,
    login,
    logout,
    connectWallet,
    linkWallet,
    unlinkWallet,
    createWallet,
    // @ts-ignore - wallets exists in the Privy interface but TypeScript definitions might be outdated
    wallets,
  } = usePrivy();

  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and address when wallets change
  useEffect(() => {
    const initializeWallet = async () => {
      if (!ready || !authenticated || !wallets || wallets.length === 0) {
        setProvider(null);
        setAddress(null);
        return;
      }

      try {
        // Get the first connected wallet
        const wallet = wallets[0];
        
        if (wallet.walletClientType === 'privy') {
          // For embedded wallets
          const provider = await wallet.getEthereumProvider();
          const ethersProvider = new ethers.providers.Web3Provider(provider);
          setProvider(ethersProvider);
          
          const signer = ethersProvider.getSigner();
          const address = await signer.getAddress();
          setAddress(address);
        } else {
          // For external wallets
          const provider = await wallet.getEthereumProvider();
          const ethersProvider = new ethers.providers.Web3Provider(provider);
          setProvider(ethersProvider);
          
          const signer = ethersProvider.getSigner();
          const address = await signer.getAddress();
          setAddress(address);
        }
      } catch (err) {
        console.error('Error initializing wallet:', err);
        setError('Failed to initialize wallet');
        setProvider(null);
        setAddress(null);
      }
    };

    initializeWallet();
  }, [ready, authenticated, wallets]);

  // Handle wallet connection
  const handleConnect = async () => {
    if (!ready) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      if (!authenticated) {
        await login();
      } else if (!wallets || wallets.length === 0) {
        // If authenticated but no wallet, create or connect one
        const hasEmbeddedWallet = wallets?.some((w: Wallet) => w.walletClientType === 'privy');
        
        if (!hasEmbeddedWallet) {
          // Try to connect an external wallet first
          await connectWallet();
        } else {
          // Create an embedded wallet if needed
          await createWallet();
        }
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    if (!ready || !authenticated) return;
    
    try {
      await logout();
      setProvider(null);
      setAddress(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet');
    }
  };

  return {
    isConnected: !!provider && !!address,
    isConnecting,
    provider,
    address,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
    user,
    wallets,
  };
} 