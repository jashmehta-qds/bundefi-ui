export interface EnsoRouteAction {
  action: string;
  primary: string;
  protocol: string;
  tokenIn: string[];
  tokenOut: string[];
}

export interface EnsoBundleAction {
  protocol: string;
  action: string;
  args: {
    tokenIn: string | string[] | { useOutputOfCallAt: number };
    tokenOut: string | string[];
    amountIn?: string | string[] | { useOutputOfCallAt: number };
    slippage?: string;
  };
}

export interface EnsoTransaction {
  data: string;
  to: string;
  from: string;
  value: string;
}

export interface EnsoLiquidityResponse {
  success: boolean;
  data: {
    gas: string;
    amountOut: string;
    priceImpact: number;
    createdAt: number;
    tx: EnsoTransaction;
    route?: EnsoRouteAction[];
    bundle?: EnsoBundleAction[];
  };
  message: string;
} 