import { toast } from "@/components/ui/use-toast";
import { AssetBalance, useBalances, useNetwork } from "@/lib/contexts";
import { ensoService } from "@/lib/services";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CCIP_TOKENS } from "../const/ccip-tokens";
import { Protocol } from "../types";
import { useCCIPExecution } from "./useCCIPExecution";

export type Step =
  | "select-asset"
  | "select-protocol"
  | "confirm"
  | "transaction-confirmation"
  | "complete";

interface EnsoToken {
  address: string;
  name: string | null;
  symbol: string;
  decimals: number;
  protocolSlug: string | null;
  apy: number | null;
  tvl: number | null;
  underlyingTokens?: {
    address: string;
    symbol: string;
  }[];
  icon?: string;
}

interface DeployState {
  step: Step;
  selectedAsset: AssetBalance | null;
  selectedProtocol: string;
  isDeploying: boolean;
  isComplete: boolean;
  protocols: Protocol[];
  isLoading: boolean;
  isCCIPEnabled: boolean;
}

interface DeployContextType {
  state: DeployState;
  availableAssets: AssetBalance[];
  handleAssetSelect: (asset: AssetBalance) => void;
  handleProtocolSelect: (protocolId: string) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleDeploy: () => void;
  handleCCIPEnabled: (isEnabled: boolean) => void;
  fetchProtocols: (
    tokenAddress: `0x${string}`,
    chainId: number
  ) => Promise<void>;
  fetchMultipleProtocols: (
    tokenRoutes: Array<{ tokenAddress: `0x${string}`; chainId: number }>
  ) => Promise<void>;
  // CCIP-related functions
  ccipExecution: ReturnType<typeof useCCIPExecution>;
}

const DeployContext = createContext<DeployContextType | null>(null);

export function DeployProvider({ children }: { children: ReactNode }) {
  const { balances = [] } = useBalances();
  const { selectedNetwork } = useNetwork();
  const ccipExecution = useCCIPExecution();
  
  const [state, setState] = useState<DeployState>({
    step: "select-asset",
    selectedAsset: null,
    selectedProtocol: "",
    isDeploying: false,
    isComplete: false,
    protocols: [],
    isLoading: false,
    isCCIPEnabled: false,
  });

  // Add a ref to track if fetchMultipleProtocols is currently running
  const isFetchingMultiple = useRef(false);

  // Filter out assets with zero balance
  const availableAssets = balances
    .filter((asset) => asset.usdValue && asset.usdValue > 0)
    .map((asset) => ({
      ...asset,
      icon: `/placeholder.svg?height=20&width=20`,
    }));

  const fetchProtocols = async (
    tokenAddress: `0x${string}`,
    chainId: number
  ) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const underlyingTokens: `0x${string}`[] = [];
      if (
        tokenAddress.toLowerCase() ===
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      ) {
        underlyingTokens.push("0x4200000000000000000000000000000000000006");
      }
      underlyingTokens.push(tokenAddress);

      // Use the Enso API to get protocols based on the token
      const tokens = (await ensoService.getTokenData({
        underlyingTokensExact: underlyingTokens,
        chainId: chainId,
      })) as EnsoToken[];

      // Filter and map the tokens to our protocol format
      const protocols = tokens
        .filter(
          (token: EnsoToken) =>
            token.apy !== null &&
            token.tvl !== null &&
            token.tvl > 100000 &&
            (token.apy || 0) > 0 &&
            token.name?.match(
              /Aave|Compound|Curve|Moonwell|Lido|Rocket Pool|StakeWise/
            )
        )
        .map((token: EnsoToken) => ({
          id: Math.random().toString(36).substring(2, 15),
          name: token.name || token.symbol,
          apy: typeof token.apy === "number" ? token.apy : 0,
          icon: token.icon || "",
          description: `${token.name}`,
          address: token.address.toLowerCase() as `0x${string}`,
          symbol: token.symbol,
          decimals: token.decimals,
          protocolSlug: token.protocolSlug || "Unknown",
          tvl: token.tvl ?? 0,
          underlyingTokens: token.underlyingTokens?.map(
            (ut: { address: string; symbol: string }) => ({
              address: ut.address,
              symbol: ut.symbol,
            })
          ) || [{ address: token.address, symbol: token.symbol }],
        }));

      // Sort by APY, highest first
      protocols.sort((a: Protocol, b: Protocol) => b.apy - a.apy);

      setState((prev) => ({ ...prev, protocols }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available protocols",
        variant: "destructive",
      });
      setState((prev) => ({ ...prev, protocols: [] }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const fetchMultipleProtocols = async (
    tokenRoutes: Array<{ tokenAddress: `0x${string}`; chainId: number }>
  ) => {
    // Prevent multiple simultaneous executions
    if (isFetchingMultiple.current) {
      return;
    }

    isFetchingMultiple.current = true;

    // Helper function to create a delay
    const delay = async (ms: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      });
    };

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (!tokenRoutes || tokenRoutes.length === 0) {
        return;
      }

      const allProtocols: Protocol[] = [];

      // Process requests sequentially with delay between each
      for (let i = 0; i < tokenRoutes.length; i++) {
        const { tokenAddress, chainId } = tokenRoutes[i];

        try {
          const underlyingTokens: `0x${string}`[] = [];
          if (
            tokenAddress.toLowerCase() ===
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          ) {
            underlyingTokens.push("0x4200000000000000000000000000000000000006");
          }
          underlyingTokens.push(tokenAddress);

          // Use the Enso API to get protocols based on the token
          const tokens = (await ensoService.getTokenData({
            underlyingTokensExact: underlyingTokens,
            chainId: chainId,
          })) as EnsoToken[];

          // Filter and map the tokens to our protocol format
          const protocols = tokens
            .filter(
              (token: EnsoToken) =>
                token.apy !== null &&
                token.tvl !== null &&
                token.tvl > 100000 &&
                (token.apy || 0) > 0 &&
                token.name?.match(
                  /Aave|Compound|Curve|Moonwell|Lido|Rocket Pool|StakeWise/
                )
            )
            .map((token: EnsoToken) => ({
              id: Math.random().toString(36).substring(2, 15),
              name: token.name || token.symbol,
              apy: typeof token.apy === "number" ? token.apy : 0,
              icon: token.icon || "",
              description: `${token.name} (Chain: ${chainId})`,
              address: token.address.toLowerCase() as `0x${string}`,
              symbol: token.symbol,
              decimals: token.decimals,
              protocolSlug: token.protocolSlug || "Unknown",
              tvl: token.tvl ?? 0,
              chainId,
              underlyingTokens: token.underlyingTokens?.map(
                (ut: { address: string; symbol: string }) => ({
                  address: ut.address,
                  symbol: ut.symbol,
                })
              ) || [{ address: token.address, symbol: token.symbol }],
            }));

          allProtocols.push(...protocols);

          // Add delay between requests (except for the last one)
          if (i < tokenRoutes.length - 1) {
            await delay(1000);
          }
        } catch (error) {
          // Continue with next request even if this one fails
        }
      }

      // Remove duplicates based on protocol name and chain
      const uniqueProtocols = allProtocols.reduce(
        (acc: Protocol[], current: Protocol) => {
          const exists = acc.find(
            (p) => p.name === current.name && p.chainId === current.chainId
          );
          if (!exists) {
            acc.push(current);
          }
          return acc;
        },
        []
      );

      // Sort by APY, highest first
      uniqueProtocols.sort((a: Protocol, b: Protocol) => b.apy - a.apy);

      setState((prev) => ({ ...prev, protocols: uniqueProtocols }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cross-chain protocols",
        variant: "destructive",
      });
      setState((prev) => ({ ...prev, protocols: [] }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
      isFetchingMultiple.current = false;
    }
  };

  // Handle asset selection
  const handleAssetSelect = (asset: AssetBalance) => {
    setState((prev) => ({
      ...prev,
      selectedAsset: asset,
      selectedProtocol: "",
    }));
  };

  // Handle protocol selection
  const handleProtocolSelect = (protocolId: string) => {
    setState((prev) => ({
      ...prev,
      selectedProtocol: protocolId,
    }));
  };

  // Move to next step
  const handleNext = useCallback(() => {
    setState((prev) => {
      let nextStep = prev.step;
      if (prev.step === "select-asset") {
        nextStep = "select-protocol";
      } else if (prev.step === "select-protocol") {
        nextStep = "confirm";
      } else if (prev.step === "transaction-confirmation") {
        nextStep = "complete";
      }
      return { ...prev, step: nextStep };
    });
  }, []);

  // Handle deployment - proceed to transaction confirmation
  const handleDeploy = async () => {
    setState((prev) => ({
      ...prev,
      step: "transaction-confirmation",
    }));
  };

  const handleCCIPEnabled = (isEnabled: boolean) => {
    setState((prev) => ({
      ...prev,
      isCCIPEnabled: isEnabled,
    }));
    
    // Reset CCIP execution state when toggling
    ccipExecution.reset();
  };

  // Handle back navigation
  const handleBack = () => {
    setState((prev) => {
      let prevStep = prev.step;
      if (prev.step === "select-protocol") {
        prevStep = "select-asset";
      } else if (prev.step === "confirm") {
        prevStep = "select-protocol";
      } else if (prev.step === "transaction-confirmation") {
        prevStep = "confirm";
      }
      return { ...prev, step: prevStep };
    });
  };

  // Fetch protocols when asset is selected
  useEffect(() => {
    if (
      !(
        state.selectedAsset &&
        state.step === "select-protocol" &&
        selectedNetwork
      )
    ) {
      return;
    }
    else if (!state.isCCIPEnabled) {
      fetchProtocols(
        state.selectedAsset.address as `0x${string}`,
        selectedNetwork.chainId
      );
    } else if (state.isCCIPEnabled) {

      const CCIP_OG_NETWORK_TOKENS = CCIP_TOKENS.find(
        (protocol) => protocol.chain_id === selectedNetwork.chainId
      )?.tokens;
      const CCIP_TOKEN_SYMBOL = CCIP_OG_NETWORK_TOKENS?.find(
        (token) =>
          token.tokenAddress.toLowerCase() ===
          state.selectedAsset?.address.toLowerCase()
      )?.symbol;

      if (CCIP_TOKEN_SYMBOL) {
        const CCIP_TOKEN_ROUTES = CCIP_TOKENS.map((protocol) => {
          const CCT = protocol.tokens.filter(
            (token) => token.symbol === CCIP_TOKEN_SYMBOL &&  token.tokenAddress.toLowerCase() !==
            state.selectedAsset?.address.toLowerCase()
          );
          if (CCT.length > 0) {
            return {
              ...protocol,
              token: CCT[0],
            };
          }
          return null;
        });

        const CCIP_TOKEN_ROUTES_ARRAY = CCIP_TOKEN_ROUTES.filter(
          (t) => !!t
        ).map((t) => {
          return {
            tokenAddress: t.token.tokenAddress as `0x${string}`,
            chainId: t.chain_id,
          };
        });

        fetchMultipleProtocols(CCIP_TOKEN_ROUTES_ARRAY);
      }
    }
  }, [state.selectedAsset, state.step, state.isCCIPEnabled, selectedNetwork]);

  // Reset when complete
  useEffect(() => {
    if (state.isComplete) {
      const timer = setTimeout(() => {
        setState({
          step: "select-asset",
          selectedAsset: null,
          selectedProtocol: "",
          isDeploying: false,
          isComplete: false,
          protocols: [],
          isLoading: false,
          isCCIPEnabled: false,
        });
        ccipExecution.reset();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.isComplete, ccipExecution]);

  const value: DeployContextType = {
    state,
    availableAssets,
    handleAssetSelect,
    handleProtocolSelect,
    handleNext,
    handleBack,
    handleDeploy,
    fetchProtocols,
    handleCCIPEnabled,
    fetchMultipleProtocols,
    ccipExecution,
  };

  return (
    <DeployContext.Provider value={value}>{children}</DeployContext.Provider>
  );
}

export function useDeployManager() {
  const context = useContext(DeployContext);
  if (!context) {
    throw new Error("useDeployManager must be used within a DeployProvider");
  }
  return context;
}
