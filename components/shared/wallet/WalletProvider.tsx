"use client"

import { usePrivyWallet } from "@/lib/hooks"
import { ethers } from "ethers"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Create a context for wallet state
type WalletContextType = {
  isConnected: boolean
  address: string | undefined
  balance: string
  provider: ethers.providers.Web3Provider | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnecting: boolean
  error: string | null
  clearStates: () => void
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: undefined,
  balance: "0",
  provider: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
  error: null,
  clearStates: () => {},
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const {
    isConnected,
    isConnecting,
    provider,
    address,
    error,
    connect,
    disconnect,
  } = usePrivyWallet();
  
  const [balance, setBalance] = useState("0");

  const clearStates = () => {
    setBalance("0");
  };

  // Fetch balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && provider && address) {
        try {
          const balanceWei = await provider.getBalance(address);
          const balanceEth = ethers.utils.formatEther(balanceWei);
          setBalance(parseFloat(balanceEth).toFixed(4) + " ETH");
        } catch (err) {
          console.error("Error fetching balance:", err);
          setBalance("Error");
        }
      } else {
        setBalance("0");
      }
    };

    fetchBalance();
    
    // Set up an interval to refresh the balance
    const intervalId = setInterval(fetchBalance, 30000); // every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [isConnected, provider, address]);

  // Connect wallet using Privy
  const connectWallet = async () => {
    await connect();
  };

  // Disconnect wallet using Privy
  const disconnectWallet = () => {
    disconnect();
    clearStates();
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address: address || undefined,
        balance,
        provider,
        connectWallet,
        disconnectWallet,
        isConnecting,
        error,
        clearStates,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

