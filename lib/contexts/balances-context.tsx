"use client";

import {
  getOnChainBalances as fetchBalancesFromApi,
  getPoolPositions as fetchPoolPositionsFromApi,
} from "@/lib/services";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Define the balance types
export interface AssetBalance {
  name: string; // Asset name (e.g., "Ethereum")
  symbol: string; // Asset symbol (e.g., "ETH")
  balance: string; // Human-readable balance (e.g., "4.5 ETH")
  rawBalance: string; // Raw balance value as string
  value: number; // USD value
  allocation: number; // Percentage allocation in portfolio
  change24h: number; // 24-hour change percentage
  priceUsd: number; // Current price in USD
  logoUrl?: string; // URL to asset logo (optional)
  address: string; // Token contract address
  icon?: string; // Icon character/emoji
  color?: string; // Color class for the token
  usdValue?: number; // Alias for value (used in some components)
  isOtherRow?: boolean; // Flag to identify the "Other" row
  decimals?: number;
}

// Add this interface to match backend response
interface TokenBalance {
  token_address: string;
  symbol: string;
  name: string;
  logo: string;
  thumbnail: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_contract: boolean;
  balance_formatted: string;
  usd_price: string;
  usd_price_24hr_percent_change: string;
  usd_price_24hr_usd_change: string;
  usd_value: string;
  usd_value_24hr_usd_change: string;
  native_token: boolean;
  portfolio_percentage: number;
}

// Add this interface for pool positions
export interface PoolPosition {
  protocol: string;
  token: string;
  supplied: string;
  readableSupplied: string;
  borrowed: string;
  supplyApy: number;
  borrowApy: number;
  supplyRewardApy: number;
  borrowRewardApy: number;
  netSupplyApy: number;
  netBorrowApy: number;
  collateralFactor: number;
  usdValue: number;
  networkId: number;
  poolAddress: string;
  poolTokenAddress: string;
  underlyingAsset: string;
  underlyingAssetDecimals: number;
  availableLiquidity: string;
  utilizationRate: number;
}

// Keep mock data for fallback but don't use it by default
const mockBalances: AssetBalance[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    balance: "1.45 ETH",
    rawBalance: "1450000000000000000",
    value: 4350,
    allocation: 45,
    change24h: 2.3,
    priceUsd: 3000,
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    address: "0x0000000000000000000000000000000000000000",
    icon: "🌐",
    color: "text-green-500",
    usdValue: 4350,
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    balance: "2500 USDC",
    rawBalance: "2500000000",
    value: 2500,
    allocation: 30,
    change24h: 0.1,
    priceUsd: 1,
    logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    address: "0x0000000000000000000000000000000000000000",
    icon: "$",
    color: "text-blue-500",
    usdValue: 2500,
  },
  {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    balance: "0.05 WBTC",
    rawBalance: "5000000",
    value: 2750,
    allocation: 25,
    change24h: -1.2,
    priceUsd: 55000,
    logoUrl: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
    address: "0x0000000000000000000000000000000000000000",
    icon: "🪙",
    color: "text-yellow-500",
    usdValue: 2750,
  },
];

// Update the BalancesContextType interface
interface BalancesContextType {
  balances: AssetBalance[];
  positions: PoolPosition[];
  totalValue: number;
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  clearStates: () => void;
}

// Update the context default value
const BalancesContext = createContext<BalancesContextType>({
  balances: [],
  positions: [],
  totalValue: 0,
  isLoading: false,
  error: null,
  refreshBalances: async () => {},
  clearStates: () => {},
});

// Create a hook for accessing the balances context
export const useBalances = () => useContext(BalancesContext);

// Helper functions to assign icons and colors based on token symbols
function getTokenIcon(symbol: string): string {
  const icons: Record<string, string> = {
    ETH: "🌐",
    WETH: "🌐",
    USDC: "💵",
    USDT: "💵",
    DAI: "🔶",
    WBTC: "₿",
    BTC: "₿",
  };
  return icons[symbol] || "💰";
}

function getTokenColor(symbol: string): string {
  const colors: Record<string, string> = {
    ETH: "from-primary-500 to-primary-600",
    WETH: "from-primary-500 to-primary-600",
    USDC: "from-blue-400 to-blue-600",
    USDT: "from-green-400 to-green-600",
    DAI: "from-yellow-400 to-yellow-600",
    WBTC: "from-orange-400 to-orange-600",
    BTC: "from-orange-400 to-orange-600",
  };
  return colors[symbol] || "from-gray-500 to-gray-700";
}

const formatLargeNumber = (num: number): { display: string; full: string } => {
  if (num >= 1e9) {
    return {
      display: `${(num / 1e9).toFixed(2)}B`,
      full: num.toFixed(2),
    };
  }
  if (num >= 1e6) {
    return {
      display: `${(num / 1e6).toFixed(2)}M`,
      full: num.toFixed(2),
    };
  }

  return {
    display: num.toFixed(2),
    full: num.toFixed(2),
  };
};

const formatCryptoBalance = (
  balance: string,
  symbol: string
): { display: string; full: string } => {
  const num = parseFloat(balance);

  // Stablecoins (show 2 decimals)
  if (["USDC", "USDT", "DAI", "BUSD"].includes(symbol)) {
    return {
      display: `${formatLargeNumber(num).display} `,
      full: `${num.toFixed(2)} `,
    };
  }

  // For very small numbers, use scientific notation
  if (num < 0.000001) {
    return {
      display: `${num.toExponential(4)} `,
      full: `${num.toExponential(4)} `,
    };
  }

  // For small numbers (less than 1), show more decimals
  if (num < 1) {
    return {
      display: `${num.toFixed(6)} `,
      full: `${num.toFixed(6)} `,
    };
  }

  // For larger numbers, use K/M/B formatting
  if (num >= 1000) {
    return {
      display: `${formatLargeNumber(num).display} `,
      full: `${num.toFixed(4)} `,
    };
  }

  // Default format for regular numbers
  return {
    display: `${num.toFixed(4)} `,
    full: `${num.toFixed(4)} `,
  };
};

const processBalances = (balances: TokenBalance[]) => {
  // First, convert all balances to AssetBalance format
  const allBalances = balances.map((item) => ({
    name: item.name || "Unknown",
    symbol: item.symbol || "???",
    balance: formatCryptoBalance(item.balance_formatted, item.symbol).display,
    rawBalance: item.balance,
    decimals: item.decimals,
    value: parseFloat(item.usd_value),
    allocation: item.portfolio_percentage,
    change24h: parseFloat(item.usd_price_24hr_percent_change),
    priceUsd: parseFloat(item.usd_price),
    logoUrl: item.logo,
    address: item.token_address,
    usdValue: parseFloat(item.usd_value),
    icon: getTokenIcon(item.symbol),
    color: getTokenColor(item.symbol),
  }));

  // Separate balances into main positions and small positions
  const mainPositions = allBalances.filter((asset) => asset.value >= 1);
  const smallPositions = allBalances.filter((asset) => asset.value < 1);

  // If there are small positions, create an "Other" entry
  if (smallPositions.length > 0) {
    const otherValue = smallPositions.reduce(
      (sum, asset) => sum + asset.value,
      0
    );
    const otherAllocation = smallPositions.reduce(
      (sum, asset) => sum + asset.allocation,
      0
    );

    const otherEntry: AssetBalance = {
      name: "Dust Positions",
      symbol: "OTHER",
      balance: `${smallPositions.length} tokens`,
      rawBalance: "0",
      value: otherValue,
      allocation: otherAllocation,
      change24h: 0, // Can't meaningfully calculate change for aggregated positions
      priceUsd: 0,
      decimals: 0,
      address: "",
      icon: "💼",
      color: "from-gray-500 to-gray-700",
      usdValue: otherValue,
      isOtherRow: true,
    };

    return [...mainPositions, otherEntry].sort((a, b) => b.value - a.value);
  }

  return mainPositions.sort((a, b) => b.value - a.value);
};

// Update the getOnChainBalances function
const getOnChainBalances = async (address: string): Promise<AssetBalance[]> => {
  const result = await fetchBalancesFromApi(address);
  return processBalances(result);
};

// Update the getOnChainBalances function
const getPoolPositions = async (address: string): Promise<PoolPosition[]> => {
  const result = await fetchPoolPositionsFromApi(address);
  return result.filter((pos: PoolPosition) => pos.usdValue > 0.01).sort((a: { usdValue: number; }, b: { usdValue: number; }) => b.usdValue - a.usdValue).map((pos: PoolPosition) => ({
    ...pos,
    supplyApy: pos.supplyApy * 100, // Convert to percentage
    borrowApy: pos.borrowApy * 100, // Convert to percentage
    supplyRewardApy: pos.supplyRewardApy * 100, // Convert to percentage
    borrowRewardApy: pos.borrowRewardApy * 100, // Convert to percentage
    netSupplyApy: pos.netSupplyApy * 100, // Convert to percentage
    netBorrowApy: pos.netBorrowApy * 100, // Convert to percentage
    collateralFactor: pos.collateralFactor * 100,
    readableSupplied: ethers.utils.formatUnits(
      pos.supplied,
      pos.underlyingAssetDecimals
    ),
    // Convert to percentage
  }));
};

// Update the BalancesProvider component
export function BalancesProvider({ children }: { children: ReactNode }) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [positions, setPositions] = useState<PoolPosition[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const address = wallets.length > 0 ? wallets[0].address : undefined;
  const isConnected = authenticated && wallets.length > 0;

  const clearStates = () => {
    setBalances([]);
    setPositions([]);
    setTotalValue(0);
    setError(null);
    setIsLoading(false);
  };

  const fetchBalances = async () => {
    if (!isConnected || !address) {
      clearStates();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (useMockData) {
        // Use mock data for development/testing
        setTimeout(() => {
          setBalances(mockBalances);
          const total = mockBalances.reduce(
            (sum, asset) => sum + asset.value,
            0
          );
          setTotalValue(total);
          setIsLoading(false);
        }, 1000); // Simulate network delay
        return;
      }

      // Fetch balances from API
      const processedBalances = await getOnChainBalances(address);

      // Fetch pool positions
      const poolPositions = await getPoolPositions(address);

      setPositions(poolPositions);

      // Process the results
      if (processedBalances && processedBalances.length > 0) {
        const total = processedBalances.reduce(
          (sum, asset) => sum + asset.value,
          0
        );

        if (total > 0) {
          setTotalValue(total);
          setBalances(processedBalances);
        } else {
          setBalances([]);
          setTotalValue(0);
          setError("No tokens with value found in wallet.");
        }
      } else {
        setBalances([]);
        setTotalValue(0);
        setError("No balance data received from API.");
      }
    } catch (err) {
      console.error("Error fetching balances:", err);
      setError("Failed to fetch balances. Please try again.");
      setBalances([]);
      setPositions([]);
      setTotalValue(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balances whenever wallet connects or address changes
  useEffect(() => {
    if (isConnected && address) {
      fetchBalances();
    } else {
      clearStates();
    }
  }, [isConnected, address]);

  // Return the context provider
  return (
    <BalancesContext.Provider
      value={{
        balances,
        positions,
        totalValue,
        isLoading,
        error,
        refreshBalances: fetchBalances,
        clearStates,
      }}
    >
      {children}
    </BalancesContext.Provider>
  );
}
