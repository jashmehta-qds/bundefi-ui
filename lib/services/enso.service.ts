import { BundleAction, EnsoClient } from "@ensofinance/sdk";

export interface EnsoRouteParams {
  chainId: number;
  fromAddress: `0x${string}`;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: string;
  slippage: number;
  receiver: `0x${string}`;
  spender: `0x${string}`;
}

export interface EnsoBundleParams {
  chainId: number;
  fromAddress: `0x${string}`;
  operations: BundleAction[];
}

export interface EnsoApprovalParams {
  chainId: number;
  fromAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  amount: string;
}

export interface EnsoTokenDataParams {
  address?: `0x${string}` | `0x${string}`[];
  underlyingTokensExact?: `0x${string}` | `0x${string}`[];
  chainId?: number;
  type?: "defi" | "base";
}

class EnsoService {
  private ensoClient: EnsoClient;

  constructor() {
    this.ensoClient = new EnsoClient({
      apiKey: process.env.ENSO_API_KEY || "",
    });
  }

  async route(params: EnsoRouteParams) {
    try {
      return await this.ensoClient.getRouteData({
        chainId: params.chainId,
        fromAddress: params.fromAddress,
        routingStrategy: "router",
        tokenIn: [params.tokenIn],
        tokenOut: [params.tokenOut],
        amountIn: [params.amountIn],
        slippage: params.slippage,
        receiver: params.receiver,
        spender: params.spender,
      });
    } catch (error) {
      console.error("Error in Enso route:", error);
      throw error;
    }
  }

  async bundle(params: EnsoBundleParams) {
    try {
      return await this.ensoClient.getBundleData(
        {
          chainId: params.chainId,
          fromAddress: params.fromAddress,
          routingStrategy: "router",
        },
        params.operations
      );
    } catch (error) {
      console.error("Error in Enso bundle:", error);
      throw error;
    }
  }
  // 0x625e7708f30ca75bfd92586e17077590c60eb4cd
  async getApprovalData(params: EnsoApprovalParams) {
    try {
      return await this.ensoClient.getApprovalData({
        chainId: params.chainId,
        fromAddress: params.fromAddress,
        tokenAddress: params.tokenAddress,
        amount: params.amount,
      });
    } catch (error) {
      console.error("Error getting approval data:", error);
      throw error;
    }
  }

  async getTokenData(params: EnsoTokenDataParams) {
    try {
      const result = await this.ensoClient.getTokenData({
        underlyingTokensExact: params.underlyingTokensExact,
        address: params.address,
        chainId: params.chainId || 1,
        includeMetadata: true,
        type: params.type,
      });

      return result.data.map(token => ({
        ...token,
        address: token.address.toLowerCase() as `0x${string}`,
        icon: token.logosUri?.[0] || `/placeholder.svg?height=40&width=40`,
      }));
    } catch (error) {
      console.error("Error getting token data:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const ensoService = new EnsoService();
