"use client";

import { useWallet } from "@/components/shared/wallet/WalletProvider";
import { useBalances } from "@/lib/contexts/balances-context";
import { useNetwork } from "@/lib/contexts/network-context";

/**
 * Custom hook to handle logout and clear all application states
 */
export function useLogout() {
  const { clearStates: clearBalances } = useBalances();
  const { clearStates: clearNetwork } = useNetwork();
  const { clearStates: clearWallet } = useWallet();

  const clearAllStates = () => {
    // Clear all context states
    clearBalances();
    clearWallet();
    
    // Clear any localStorage items that might be user-specific
    if (typeof window !== 'undefined') {
      // Clear any user-specific localStorage items
      const keysToRemove = [
        'selectedNetwork', // This will be re-set by network context
        // Add any other user-specific keys here
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key: ${key}`, error);
        }
      });
    }
  };

  return {
    clearAllStates,
  };
} 