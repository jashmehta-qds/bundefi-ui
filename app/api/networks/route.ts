import axios from 'axios';
import { NextResponse } from 'next/server';

// Enhanced fallback networks with logos and colors
const getFallbackNetworks = () => [
  {
    id: 1,
    chainId: 8453,
    name: 'Base',
    shortName: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    currencySymbol: 'ETH',
    isTestnet: false,
    logo: '/networks/base.svg',
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
    logo: '/networks/ethereum.png',
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
    logo: '/networks/bnb.png',
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
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
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
    logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
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
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    color: '#FF0420',
  },
  {
    id: 7,
    chainId: 43114,
    name: 'Avalanche',
    shortName: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    currencySymbol: 'AVAX',
    isTestnet: false,
    logo: '/networks/avalanche.png',
    color: '#E84142',
  },
];

export async function GET() {
  try {
    // Make request to your actual API
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6969';
    const response = await axios.get(`${API_BASE_URL}/networks`);
    
    let networksData = response.data;
    // Enhance network data with logos and colors if not present
    const fallbackNetworks = getFallbackNetworks();
    networksData = networksData.map((network: any) => {
      const fallbackNetwork = fallbackNetworks.find(fn => fn.chainId === network.chainId);
      return {
        ...network,
        logo: network.logo || fallbackNetwork?.logo || '🔗',
        color: network.color || fallbackNetwork?.color || '#6B7280',
        shortName: network.shortName || fallbackNetwork?.shortName || network.name,
      };
    });
    
    // Return the enhanced data with appropriate headers
    return NextResponse.json(networksData);
  } catch (error) {
    console.error('Error fetching networks:', error);
    
    // Return enhanced fallback data in case of error
    return NextResponse.json(getFallbackNetworks());
  }
} 