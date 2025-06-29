export type DeployStep =
  | "select-asset"
  | "select-protocol"
  | "confirm"
  | "transaction-confirmation"
  | "complete";

export interface Protocol {
  id: string;
  name: string;
  apy: number;
  icon: string;
  description: string;
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  protocolSlug: string;
  tvl: number;
  chainId?: number;
  underlyingTokens: {
    address: string;
    symbol: string;
  }[];
  priceUsd?: number;
}

export interface Asset {
  symbol: string;
  address: `0x${string}`;
  balance: string;
  decimals: number;
  priceUsd: number;
}

export interface RouteData {
  tx: {
    to: string;
    value: string;
    data: string;
    gasLimit: string;
  };
  priceImpact: number;
}

export interface DeploymentState {
  step: DeployStep;
  selectedAsset: string | null;
  selectedProtocol: string | null;
  isDeploying: boolean;
  isComplete: boolean;
  protocols: Protocol[];
  isLoading: boolean;
} 