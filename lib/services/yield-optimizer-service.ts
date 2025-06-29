import { ethers } from 'ethers';
import { createDeposit, createWithdrawal, getApyHistory, getOnChainBalances } from './api';

// Protocol ABIs (simplified for demonstration)
const aaveABI = [
  "function getReserveData(address asset) view returns (tuple(uint256 liquidityIndex, uint256 currentLiquidityRate, uint256 variableBorrowIndex, uint256 currentVariableBorrowRate, uint256 currentStableBorrowRate, uint256 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))",
  "function getReservesList() view returns (address[])",
  "function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
];

const compoundABI = [
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isComped)",
  "function supplyRatePerBlock() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function supply(address asset, uint256 amount) external returns (uint256)",
];

const yearnABI = [
  "function pricePerShare() view returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function deposit(uint256 amount) external returns (uint256)",
  "function token() view returns (address)",
  "function decimals() view returns (uint8)",
];

// ERC20 ABI for token interactions
const erc20ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// Example contract addresses on Base network
// Note: These are placeholder addresses and should be replaced with actual contract addresses
const PROTOCOL_ADDRESSES = {
  aave: {
    poolAddress: "0x0000000000000000000000000000000000000001", // Replace with actual Aave pool address on Base
    dataProvider: "0x0000000000000000000000000000000000000002", // Replace with actual Aave data provider on Base
  },
  compound: {
    controllerAddress: "0x0000000000000000000000000000000000000003", // Replace with actual Compound controller on Base
    markets: {
      USDC: "0x0000000000000000000000000000000000000004", // Replace with actual Compound USDC market on Base
      ETH: "0x0000000000000000000000000000000000000005", // Replace with actual Compound ETH market on Base
    },
  },
  yearn: {
    vaults: {
      USDC: "0x0000000000000000000000000000000000000006", // Replace with actual Yearn USDC vault on Base
      ETH: "0x0000000000000000000000000000000000000007", // Replace with actual Yearn ETH vault on Base
    },
  },
};

// Token addresses on Base network
const TOKEN_ADDRESSES = {
  USDC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", // Base USDC
  ETH: "0x4200000000000000000000000000000000000006", // Base ETH (WETH)
  DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", // Base DAI
  USDT: "0x7F5373AE26c3E8FfC4c77b7255DF7eC1A9aF52a6", // Base USDT
};

// Types
export interface ProtocolYield {
  name: string;
  apy: number;
  token: string;
  icon: string;
  color: string;
  address: string;
  networkId: number;
  tvl?: string;
}

export interface TokenData {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  decimals: number;
  logoURI?: string;
  networkId?: number;
  icon?: string;
  color?: string;
  usdValue?: string;
}

export interface DepositResult {
  success: boolean;
  message: string;
  txHash?: string;
}

// Cache for data
let protocolYieldsCache: Record<number, ProtocolYield[]> = {};
let tokenBalancesCache: Record<string, TokenData[]> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Helper function to calculate APY from rate
const calculateAPY = (rate: number): number => {
  // Convert rate to APY based on protocol's rate format
  return rate * 100;
};

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_EXPIRATION;
};

// Clear caches
export const clearCaches = () => {
  protocolYieldsCache = {};
  tokenBalancesCache = {};
};

// Fetch protocol yields from API
export const fetchProtocolYields = async (provider: ethers.providers.Web3Provider, networkId: number = 1): Promise<ProtocolYield[]> => {
  if (protocolYieldsCache[networkId]) {
    return protocolYieldsCache[networkId];
  }

  try {
    // Fetch APY history from API
    const apyData = await getApyHistory(undefined, networkId);
    
    // Group by protocol and get the latest APY for each
    const latestApyByProtocol: Record<string, any> = {};
    apyData.forEach((apy: any) => {
      const key = `${apy.protocol}-${apy.asset}`;
      if (!latestApyByProtocol[key] || new Date(apy.timestamp) > new Date(latestApyByProtocol[key].timestamp)) {
        latestApyByProtocol[key] = apy;
      }
    });
    
    // Convert to ProtocolYield format
    const protocols: ProtocolYield[] = Object.values(latestApyByProtocol).map((apy: any) => ({
      name: apy.protocol,
      apy: apy.apyValue,
      token: apy.asset,
      icon: getProtocolIcon(apy.protocol),
      color: getProtocolColor(apy.protocol),
      address: getProtocolAddress(apy.protocol),
      networkId: apy.networkId || networkId,
    }));
    
    protocolYieldsCache[networkId] = protocols;
    return protocols;
  } catch (error) {
    console.error('Error fetching protocol yields:', error);
    return getDefaultProtocols(networkId);
  }
};

// Fetch user token balances from on-chain data
export const fetchUserTokenBalances = async (
  provider: ethers.providers.Web3Provider,
  address: string,
  networkId: number = 1
): Promise<TokenData[]> => {
  const cacheKey = `${address}-${networkId}`;
  if (tokenBalancesCache[cacheKey]) {
    return tokenBalancesCache[cacheKey];
  }

  try {
    // Fetch on-chain balances from API
    const balanceData = await getOnChainBalances(address, networkId);
    
    // Convert to TokenData format
    const tokens: TokenData[] = balanceData.data.items
      .filter((item: any) => item.balance !== '0')
      .map((item: any) => ({
        symbol: item.contract_ticker_symbol,
        name: item.contract_name,
        address: item.contract_address,
        balance: ethers.utils.formatUnits(item.balance, item.contract_decimals),
        decimals: item.contract_decimals,
        logoURI: item.logo_url,
        networkId,
      }));
    
    tokenBalancesCache[cacheKey] = tokens;
    return tokens;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return getDefaultTokens(networkId);
  }
};

// Get highest yield protocol
export const getHighestYieldProtocol = (protocols: ProtocolYield[]): ProtocolYield | null => {
  if (protocols.length === 0) return null;
  return protocols.reduce((highest, current) => (current.apy > highest.apy ? current : highest), protocols[0]);
};

// Deposit to highest yield protocol
export const depositToHighestYield = async (
  provider: ethers.providers.Web3Provider,
  tokenAddress: string,
  amount: string,
  protocols: ProtocolYield[],
  networkId: number = 1
): Promise<{ success: boolean; message: string; txHash?: string }> => {
  try {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // Find highest yield protocol
    const highestYieldProtocol = getHighestYieldProtocol(protocols);
    if (!highestYieldProtocol) {
      return { success: false, message: 'No protocols available' };
    }
    
    // In a real implementation, this would interact with the protocol's smart contract
    // For this MVP, we'll just record the transaction in our backend
    await createDeposit(address, parseFloat(amount), highestYieldProtocol.name, networkId);
    
    return {
      success: true,
      message: `Successfully deposited ${amount} to ${highestYieldProtocol.name} (${highestYieldProtocol.apy}% APY)`,
      txHash: `0x${Math.random().toString(16).substring(2, 42)}`, // Mock transaction hash
    };
  } catch (error) {
    console.error('Error depositing to highest yield:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
    };
  }
};

// Withdraw from protocol
export const withdrawFromProtocol = async (
  provider: ethers.providers.Web3Provider,
  protocol: string,
  amount: string,
  networkId: number = 1
): Promise<{ success: boolean; message: string; txHash?: string }> => {
  try {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // In a real implementation, this would interact with the protocol's smart contract
    // For this MVP, we'll just record the transaction in our backend
    await createWithdrawal(address, parseFloat(amount), protocol, networkId);
    
    return {
      success: true,
      message: `Successfully withdrew ${amount} from ${protocol}`,
      txHash: `0x${Math.random().toString(16).substring(2, 42)}`, // Mock transaction hash
    };
  } catch (error) {
    console.error('Error withdrawing from protocol:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
    };
  }
};

// Helper functions
const getProtocolIcon = (protocol: string): string => {
  const icons: Record<string, string> = {
    'Aave': '🔷',
    'Compound': '🟢',
    'Lido': '🔶',
    'Curve': '🔴',
    'Yearn': '🔵',
  };
  return icons[protocol] || '💰';
};

const getProtocolColor = (protocol: string): string => {
  const colors: Record<string, string> = {
    'Aave': 'from-purple-500 to-purple-700',
    'Compound': 'from-green-500 to-green-700',
    'Lido': 'from-blue-500 to-blue-700',
    'Curve': 'from-red-500 to-red-700',
    'Yearn': 'from-yellow-500 to-yellow-700',
  };
  return colors[protocol] || 'from-gray-500 to-gray-700';
};

const getProtocolAddress = (protocol: string): string => {
  const addresses: Record<string, string> = {
    'Aave': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    'Compound': '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    'Lido': '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    'Curve': '0xD533a949740bb3306d119CC777fa900bA034cd52',
    'Yearn': '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  };
  return addresses[protocol] || '0x0000000000000000000000000000000000000000';
};

// Default data for fallbacks
const getDefaultProtocols = (networkId: number = 1): ProtocolYield[] => [
  {
    name: 'Aave',
    apy: 4.2,
    token: 'ETH',
    icon: '🔷',
    color: 'from-purple-500 to-purple-700',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    networkId,
  },
  {
    name: 'Compound',
    apy: 5.8,
    token: 'USDC',
    icon: '🟢',
    color: 'from-green-500 to-green-700',
    address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    networkId,
  },
  {
    name: 'Lido',
    apy: 4.5,
    token: 'ETH',
    icon: '🔶',
    color: 'from-blue-500 to-blue-700',
    address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    networkId,
  },
];

const getDefaultTokens = (networkId: number = 1): TokenData[] => [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    balance: '1.5',
    decimals: 18,
    networkId,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    balance: '1000',
    decimals: 6,
  },
]; 