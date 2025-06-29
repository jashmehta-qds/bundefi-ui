import { PoolPosition } from "@/lib/contexts";

export interface OptimisationManagerProps {
  position: PoolPosition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TokenData {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  protocolSlug: string;
  apy: number;
  tvl: number;
  underlyingTokens: Array<{
    address: string;
    symbol: string;
  }>;
}

export interface Position {
  token: TokenData;
  balance: {
    amount: string;
    price: string;
  };
}

export interface RouteData {
  amountOut: string;
  priceImpact: string;
  tx?: any;
}

export interface StepperState {
  currentStep: number;
  selectedTarget?: TokenData;
  routeData?: RouteData;
  approvalNeeded?: boolean;
  approvalLoading?: boolean;
  loadingRoute?: boolean;
} 