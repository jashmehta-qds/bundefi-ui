// Protocol types for the frontend
export interface Protocol {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  type: string;
  tvl: number;
  avgApy: number;
  riskLevel: string;
  pools: Pool[];
  integratedSince: string;
  supportedAssets?: string;
  auditedBy?: string;
  features?: string[];
  strategies?: Strategy[];
  icon?: React.ReactNode;
}

export interface Pool {
  id: string;
  name: string;
  type: string;
  tvl: number;
  apy: number;
  risk: string;
  tokenAddresses?: string[];
}

export interface Strategy {
  id?: string;
  name: string;
  description: string;
  protocols?: string[];
  assets?: string[];
  apy?: number;
  expectedApy?: number;
  risk: string;
  tvl?: number;
}

// API response types
export interface ApiResponse {
  protocols: ApiProtocol[];
  lastUpdated: string;
  cacheStatus: 'hit' | 'miss' | 'expired' | 'error';
}

export interface ApiProtocol {
  id: string;
  name: string;
  logo: string;
  tvl: number;
  apy: number;
  markets: ApiMarket[];
  lastUpdated: string;
}

export interface ApiMarket {
  asset: string;
  symbol: string;
  tvl: number;
  apy: number;
  price?: number;
  borrowApy?: number;
  tokenAddresses?: string[];
} 