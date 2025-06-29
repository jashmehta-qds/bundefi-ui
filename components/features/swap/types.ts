
export interface SwapManagerProps {
  fromTokenAddress?: string; // Optional to handle both use cases
  setOpen: (open: boolean) => void;
}

export interface SwapAsset {
  symbol: string;
  name: string;
  address: string;
  decimals?: number;
  value?: number;
  rawBalance?: string;
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  route?: SwapRouteStep[];
}

export interface SwapRouteStep {
  protocol: string;
  action: string;
  tokenIn: string[];
  tokenOut: string[];
} 