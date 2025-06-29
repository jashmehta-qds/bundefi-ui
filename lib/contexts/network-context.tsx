"use client"

import { toast } from '@/components/ui/use-toast';
import { useWallets } from '@privy-io/react-auth';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Network interface representing a blockchain network
 */
export interface Network {
  id: number;
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  currencySymbol: string;
  isTestnet: boolean;
  logo?: string;
  color?: string;
  shortName?: string;
}

/**
 * Network context type providing network state and actions
 */
interface NetworkContextType {
  networks: Network[];
  selectedNetwork: Network | null;
  setSelectedNetwork: (network: Network) => void;
  isLoading: boolean;
  error: string | null;
  refreshNetworks: () => Promise<void>;
  clearStates: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
  networks: [],
  selectedNetwork: null,
  setSelectedNetwork: () => {},
  isLoading: true,
  error: null,
  refreshNetworks: async () => {},
  clearStates: () => {},
});

/**
 * Hook to access network context
 * @returns NetworkContextType
 */
export const useNetwork = () => useContext(NetworkContext);

/**
 * Custom hook for listening to network changes
 * @param callback Function to call when network changes
 */
export const useNetworkChange = (callback: (network: Network) => void) => {
  useEffect(() => {
    const handleNetworkChange = (event: CustomEvent<Network>) => {
      callback(event.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('networkChanged', handleNetworkChange as EventListener);
      
      return () => {
        window.removeEventListener('networkChanged', handleNetworkChange as EventListener);
      };
    }
  }, [callback]);
};

// Enhanced fallback networks with logos and colors
const getFallbackNetworks = (): Network[] => [
  {
    id: 1,
    chainId: 8453,
    name: 'Base',
    shortName: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    currencySymbol: 'ETH',
    isTestnet: false,
    logo: '/base-network-logo.svg',
    color: '#0052FF',
  },
  {
    id: 2,
    chainId: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/your-infura-key',
    explorerUrl: 'https://etherscan.io',
    currencySymbol: 'ETH',
    isTestnet: false,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040',
    color: '#627EEA',
  },
  {
    id: 3,
    chainId: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    currencySymbol: 'BNB',
    isTestnet: false,
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=040',
    color: '#F3BA2F',
  },
  {
    id: 4,
    chainId: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    currencySymbol: 'MATIC',
    isTestnet: false,
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=040',
    color: '#8247E5',
  },
  {
    id: 5,
    chainId: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    currencySymbol: 'ETH',
    isTestnet: false,
    logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=040',
    color: '#28A0F0',
  },
  {
    id: 6,
    chainId: 10,
    name: 'Optimism',
    shortName: 'OP',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    currencySymbol: 'ETH',
    isTestnet: false,
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=040',
    color: '#FF0420',
  },
];

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useWallets();

  const clearStates = () => {
    // Don't clear networks as they are static, but clear selected network
    setSelectedNetwork(null);
    setError(null);
    setIsLoading(false);
  };

  const fetchNetworks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the Next.js API route instead of direct call to avoid CORS
      const response = await axios.get('/api/networks');
      let networksData = response.data;
      
      // Enhance network data with logos and colors if not present
      networksData = networksData.map((network: Network) => {
        const fallbackNetwork = getFallbackNetworks().find(fn => fn.chainId === network.chainId);
        return {
          ...network,
          logo: network.logo || fallbackNetwork?.logo || '🔗',
          color: network.color || fallbackNetwork?.color || '#6B7280',
          shortName: network.shortName || fallbackNetwork?.shortName || network.name,
        };
      });
      
      setNetworks(networksData);
      
      // Set default network (Base) or first available
      const savedNetwork = typeof window !== 'undefined' 
        ? localStorage.getItem('selectedNetwork') 
        : null;
      
      let defaultNetwork: Network | null = null;
      
      if (savedNetwork) {
        try {
          const parsed = JSON.parse(savedNetwork);
          defaultNetwork = networksData.find((n: Network) => n.id === parsed.id) || null;
        } catch (e) {
          console.warn('Failed to parse saved network:', e);
        }
      }
      
      if (!defaultNetwork) {
        defaultNetwork = networksData.find((n: Network) => n.name === 'Base') || networksData[0];
      }
      
      setSelectedNetwork(defaultNetwork);
      
      // Save selected network to localStorage
      if (typeof window !== 'undefined' && defaultNetwork) {
        localStorage.setItem('selectedNetwork', JSON.stringify(defaultNetwork));
      }
    } catch (err) {
      console.error('Error fetching networks:', err);
      setError('Failed to load networks');
      
      // Use fallback networks if API fails
      const fallbackNetworks = getFallbackNetworks();
      setNetworks(fallbackNetworks);
      
      // Set Base as default or first available
      const defaultNetwork = fallbackNetworks.find(n => n.name === 'Base') || fallbackNetworks[0];
      setSelectedNetwork(defaultNetwork);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedNetwork', JSON.stringify(defaultNetwork));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if a network is supported by the wallet
  const isNetworkSupported = (chainId: number): boolean => {
    // Common supported networks by most wallets
    const commonSupportedNetworks = [1, 8453, 137, 42161, 10, 56, 43114];
    return commonSupportedNetworks.includes(chainId);
  };

  // Handle network change with wallet switching
  const handleNetworkChange = async (network: Network) => {
    const previousNetwork = selectedNetwork;
    setSelectedNetwork(network);
    
    // Save selected network to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedNetwork', JSON.stringify(network));
    }
    
    // Emit custom event for other components to listen to network changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('networkChanged', { detail: network }));
    }

    // If user has connected wallets, prompt them to switch network
    if (wallets && wallets.length > 0) {
      try {
        const wallet = wallets[0]; // Use the first connected wallet
        
        // Check if the wallet is already on the correct network
        const currentChainId = wallet.chainId ? parseInt(wallet.chainId, 16) : null;
        
        if (currentChainId !== network.chainId) {
          // Check if network is commonly supported
          if (!isNetworkSupported(network.chainId)) {
            toast({
              title: "Network May Not Be Supported",
              description: `${network.name} may not be supported by your wallet. Please add it manually if needed.`,
              variant: "default",
            });
          }

          // Prompt user to switch network
          toast({
            title: "Network Switch Required",
            description: `Please switch your wallet to ${network.name} to continue using the app.`,
            variant: "default",
          });

          try {
            // Attempt to switch the wallet's network
            await wallet.switchChain(network.chainId);
            
            toast({
              title: "Network Switched",
              description: `Successfully switched to ${network.name}`,
              variant: "default",
            });
          } catch (switchError: any) {
            console.error('Failed to switch network:', switchError);
            
            // If switching fails, revert to previous network
            if (previousNetwork) {
              setSelectedNetwork(previousNetwork);
              if (typeof window !== 'undefined') {
                localStorage.setItem('selectedNetwork', JSON.stringify(previousNetwork));
              }
            }
            
            let errorMessage = `Failed to switch to ${network.name}. Please switch manually in your wallet.`;
            
            // Provide more specific error messages
            if (switchError.message?.includes('network')) {
              errorMessage = `${network.name} is not configured in your wallet. Please add it manually.`;
            } else if (switchError.message?.includes('rejected')) {
              errorMessage = `Network switch was rejected. Please try again or switch manually in your wallet.`;
            }
            
            toast({
              title: "Network Switch Failed",
              description: errorMessage,
              variant: "destructive",
            });
          }
        }
      } catch (error: any) {
        console.error('Error checking wallet network:', error);
        toast({
          title: "Wallet Error",
          description: "Unable to check wallet network. Please ensure your wallet is connected.",
          variant: "destructive",
        });
      }
    }
  };

  // Load saved network on mount
  useEffect(() => {
    fetchNetworks();
  }, []);

  // Listen for wallet network changes and sync with selected network
  useEffect(() => {
    if (wallets && wallets.length > 0 && networks.length > 0) {
      const wallet = wallets[0];
      const currentChainId = wallet.chainId ? parseInt(wallet.chainId, 16) : null;
      
      // Find the network that matches the wallet's current chain ID
      const walletNetwork = networks.find(n => n.chainId === currentChainId);
      
      // If wallet is on a different network than our selected network, update it
      if (walletNetwork && selectedNetwork && walletNetwork.id !== selectedNetwork.id) {
        setSelectedNetwork(walletNetwork);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedNetwork', JSON.stringify(walletNetwork));
        }
        
        // Emit custom event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('networkChanged', { detail: walletNetwork }));
        }
      }
    }
  }, [wallets, networks, selectedNetwork]);

  return (
    <NetworkContext.Provider
      value={{
        networks,
        selectedNetwork,
        setSelectedNetwork: handleNetworkChange,
        isLoading,
        error,
        refreshNetworks: fetchNetworks,
        clearStates,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
} 