export const BUNDEFI_CONTRACTS = {
  // Base
  8453: {
    name: "Base",
    address: "0x60BD626cbC6A68D3EAF7aDD0872551fA1738D4E3" as `0x${string}`,
    chainSelector: "15971525489660198786",
    ensoRouter: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf" as `0x${string}`,
    rpcUrl: "https://mainnet.base.org",
  },
  // Avalanche
  43114: {
    name: "Avalanche",
    address: "0x6b9C88C44Eb53A3d2994d05Fc14D86D542Ec0F75" as `0x${string}`,
    chainSelector: "6433500567565415381",
    ensoRouter: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf" as `0x${string}`,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
  },
  // Ethereum
  1: {
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`, // TODO: Replace with actual address
    chainSelector: "5009297550715157269",
    ensoRouter: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf" as `0x${string}`,
    rpcUrl: "https://mainnet.infura.io/",
  },
  // Arbitrum
  42161: {
    name: "Arbitrum",
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`, // TODO: Replace with actual address
    chainSelector: "4949039107694359620",
    ensoRouter: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf" as `0x${string}`,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
  },
} as const;

export const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11" as `0x${string}`;

// Chain ID to name mapping
export const CHAIN_NAMES = {
  1: "Ethereum",
  8453: "Base", 
  43114: "Avalanche",
  42161: "Arbitrum",
} as const;

// Chain selector to chain ID mapping
export const CHAIN_SELECTOR_TO_ID = {
  "5009297550715157269": 1, // Ethereum
  "15971525489660198786": 8453, // Base
  "6433500567565415381": 43114, // Avalanche
  "4949039107694359620": 42161, // Arbitrum
} as const; 