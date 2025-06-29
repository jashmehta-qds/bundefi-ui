// Real service that fetches protocol data from the API

import type { ApiResponse, Pool, Protocol, Strategy } from "@/types/protocols";

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";


// Service functions
export async function getProtocols(): Promise<Protocol[]> {
  try {
    const response = await fetch(`${API_URL}/protocols?network=base`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error fetching protocols: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    
    // Transform data to match our frontend format
    return data.protocols.map((protocol) => {
      // Create pool data from markets
      const pools = protocol.markets.map((market) => ({
        id: `${protocol.id}-${market.symbol.toLowerCase()}`,
        name: market.symbol,
        type: "Market",
        tvl: market.tvl,
        apy: market.apy,
        risk: "Medium",
      }));

      return {
        id: protocol.id,
        name: protocol.name,
        description: `DeFi protocol with ${protocol.markets.length} assets and ${(protocol.tvl / 1e6).toFixed(2)}M TVL`,
        type: protocol.markets.some(m => m.tokenAddresses && m.tokenAddresses.length > 1  ) ? "Liquidity Pool" : "Lending / Borrowing",
        tvl: protocol.tvl,
        avgApy: protocol.apy,
        riskLevel: "Medium",
        pools,
        integratedSince: "2023-06-01",
      };
    });
  } catch (error) {
    console.error("Error fetching protocols:", error);
    // Return mock data in case of error
    return getMockProtocols();
  }
}

export async function getProtocolById(id: string): Promise<Protocol | undefined> {
  try {
    // Get protocol data from the list
    const protocols = await getProtocols();
    const baseProtocol = protocols.find((p) => p.id === id);

    if (!baseProtocol) {
      throw new Error(`Protocol with ID ${id} not found`);
    }

    // Get detailed protocol data from API
    const response = await fetch(`${API_URL}/protocols?network=base`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error fetching protocol details: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    const apiProtocol = data.protocols.find(p => p.id === id);

    if (!apiProtocol) {
      throw new Error(`Protocol details not found for ID ${id}`);
    }

    // Transform markets to pools with token addresses
    const pools = apiProtocol.markets.map((market) => ({
      id: `${apiProtocol.id}-${market.symbol.toLowerCase()}`,
      name: market.symbol,
      type: market.symbol.includes('/') ? "Liquidity Pool" : "Supply Market",
      tvl: market.tvl,
      apy: market.apy,
      risk: market.tvl > 1000000 ? "Low" : "Medium",
      tokenAddresses: market.tokenAddresses || [],
    }));

    // Add additional detail fields
    return {
      ...baseProtocol,
      description: baseProtocol.description || `DeFi protocol with ${pools.length} assets and ${(apiProtocol.tvl / 1e6).toFixed(2)}M TVL`,
      longDescription: baseProtocol.longDescription || getMockLongDescription(id),
      features: baseProtocol.features || getMockFeatures(id),
      supportedAssets: baseProtocol.supportedAssets || pools.map(p => p.name).join(', '),
      auditedBy: baseProtocol.auditedBy || "Multiple security firms",
      pools,
      strategies: baseProtocol.strategies || getMockStrategies(id),
    };
  } catch (error) {
    console.error("Error fetching protocol details:", error);
    // Fallback to mock data
    return getMockProtocolById(id);
  }
}

export async function getPoolsByProtocol(protocolId: string): Promise<Pool[]> {
  const protocol = await getProtocolById(protocolId);
  return protocol?.pools || [];
}

export async function getTopStrategies(): Promise<Strategy[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock strategies
  return [
    {
      id: "stablecoin-yield",
      name: "Stablecoin Yield Optimizer",
      description: "Maximize stablecoin yields across lending protocols",
      protocols: ["aave", "compound"],
      assets: ["USDC", "DAI"],
      apy: 5.8,
      risk: "Low",
      tvl: 12500000,
    },
    {
      id: "eth-maximizer",
      name: "ETH Maximizer",
      description: "Optimize ETH yields with liquid staking and lending",
      protocols: ["lido", "aave"],
      assets: ["ETH"],
      apy: 6.2,
      risk: "Low",
      tvl: 18700000,
    },
    {
      id: "curve-boosted",
      name: "Curve Boosted Strategy",
      description: "Enhanced yields through Curve LP tokens and CRV rewards",
      protocols: ["curve", "convex"],
      assets: ["USDC", "USDT", "DAI"],
      apy: 9.5,
      risk: "Medium",
      tvl: 8900000,
    },
  ]
}

// Fallback mock data
function getMockProtocols(): Protocol[] {
  return [
    {
      id: "aave",
      name: "Aave",
      description: "Leading decentralized lending protocol with multiple asset markets",
      type: "Lending",
      tvl: 5800000000,
      avgApy: 4.2,
      riskLevel: "Low",
      pools: [
        { id: "aave-eth", name: "ETH", type: "Supply Market", tvl: 1200000000, apy: 3.8, risk: "Low" },
        { id: "aave-usdc", name: "USDC", type: "Supply Market", tvl: 980000000, apy: 4.5, risk: "Low" },
        { id: "aave-wbtc", name: "WBTC", type: "Supply Market", tvl: 750000000, apy: 2.9, risk: "Low" },
      ],
      integratedSince: "2023-01-01",
    },
    {
      id: "compound",
      name: "Compound",
      description: "Algorithmic money market protocol for lending and borrowing",
      type: "Lending",
      tvl: 3200000000,
      avgApy: 5.1,
      riskLevel: "Low",
      pools: [
        { id: "compound-eth", name: "ETH", type: "Supply Market", tvl: 850000000, apy: 3.5, risk: "Low" },
        { id: "compound-usdc", name: "USDC", type: "Supply Market", tvl: 720000000, apy: 5.2, risk: "Low" },
        { id: "compound-dai", name: "DAI", type: "Supply Market", tvl: 580000000, apy: 4.9, risk: "Low" },
      ],
      integratedSince: "2023-01-01",
    },
    {
      id: "curve",
      name: "Curve",
      description: "Specialized AMM for stablecoin trading with low slippage",
      type: "DEX",
      tvl: 4100000000,
      avgApy: 8.3,
      riskLevel: "Medium",
      pools: [
        {
          id: "curve-3pool",
          name: "3pool (USDC/USDT/DAI)",
          type: "Liquidity Pool",
          tvl: 980000000,
          apy: 6.8,
          risk: "Low",
        },
        { id: "curve-steth", name: "stETH/ETH", type: "Liquidity Pool", tvl: 850000000, apy: 8.5, risk: "Medium" },
        { id: "curve-frax", name: "FRAX/USDC", type: "Liquidity Pool", tvl: 620000000, apy: 9.2, risk: "Medium" },
      ],
      integratedSince: "2023-01-01",
    },
  ];
}

// Mock helper functions
function getMockLongDescription(id: string): string {
  switch(id.toLowerCase()) {
    case 'aave':
      return "Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets. It enables users to deposit cryptocurrencies into lending pools to earn interest, while allowing others to borrow from these pools by posting collateral.";
    case 'compound':
      return "Compound is an algorithmic, autonomous interest rate protocol built for developers, to unlock a universe of open financial applications. It allows users to earn interest on their cryptocurrencies by depositing them into one of several pools supported by the platform.";
    case 'curve':
      return "Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading and low risk, supplemental fee income for liquidity providers, without an opportunity cost. It allows users to trade between stablecoins with low slippage and low fee algorithms.";
    default:
      return "A decentralized finance protocol that allows users to earn yield on their crypto assets through various mechanisms including lending, liquidity provision, and yield farming strategies.";
  }
}

function getMockFeatures(id: string): string[] {
  switch(id.toLowerCase()) {
    case 'aave':
      return [
        "Variable and stable interest rates",
        "Flash loans",
        "Collateralized borrowing",
        "Multiple asset markets",
        "Safety modules for risk mitigation",
      ];
    case 'compound':
      return [
        "Algorithmic interest rates",
        "Governance token (COMP)",
        "Collateralized borrowing",
        "Liquidity mining",
        "Community governance",
      ];
    case 'curve':
      return [
        "Low slippage stablecoin swaps",
        "Liquidity provider rewards",
        "CRV token rewards",
        "Gauge system for boosted rewards",
        "Vote-escrowed governance (veCRV)",
      ];
    default:
      return [
        "Yield optimization",
        "Asset diversification",
        "Risk management",
        "Automated strategies",
        "Governance mechanisms",
      ];
  }
}

function getMockStrategies(id: string): Strategy[] {
  switch(id.toLowerCase()) {
    case 'aave':
      return [
        {
          name: "Aave ETH Lending Strategy",
          description: "Optimize ETH lending with automatic rate switching",
          expectedApy: 4.2,
          risk: "Low",
        },
        {
          name: "Aave Stablecoin Maximizer",
          description: "Rotate between stablecoins for highest yields",
          expectedApy: 5.1,
          risk: "Low",
        },
      ];
    case 'compound':
      return [
        {
          name: "Compound USDC Yield Strategy",
          description: "Maximize USDC yields with COMP rewards",
          expectedApy: 5.8,
          risk: "Low",
        },
        {
          name: "Compound-Aave Optimizer",
          description: "Automatically switch between protocols for best rates",
          expectedApy: 5.5,
          risk: "Low",
        },
      ];
    case 'curve':
      return [
        {
          name: "Curve 3pool Strategy",
          description: "Stablecoin LP with boosted CRV rewards",
          expectedApy: 8.2,
          risk: "Low",
        },
        {
          name: "Curve ETH/stETH Strategy",
          description: "Liquid staking ETH with additional LP rewards",
          expectedApy: 9.5,
          risk: "Medium",
        },
      ];
    default:
      return [
        {
          name: "Yield Optimizer Strategy",
          description: "Automatically adjusts positions for best yields",
          expectedApy: 6.5,
          risk: "Medium",
        },
        {
          name: "Stable Yield Strategy",
          description: "Conservative strategy focused on consistent returns",
          expectedApy: 4.8,
          risk: "Low",
        },
      ];
  }
}

// Helper function to get complete mock protocol
function getMockProtocolById(id: string): Protocol | undefined {
  const protocols = getMockProtocols();
  const baseProtocol = protocols.find((p) => p.id === id);
  
  if (!baseProtocol) {
    return undefined;
  }
  
  return {
    ...baseProtocol,
    longDescription: getMockLongDescription(id),
    features: getMockFeatures(id),
    supportedAssets: "ETH, USDC, DAI, WBTC, and more",
    auditedBy: "Multiple security firms",
    strategies: getMockStrategies(id),
    icon: { type: 'icon', content: baseProtocol.name.charAt(0) } as any,
  };
}

