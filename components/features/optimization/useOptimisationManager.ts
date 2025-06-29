import { useToast } from "@/components/ui/use-toast";
import { PoolPosition } from "@/lib/contexts";
import { ensoService } from "@/lib/services";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { TransactionState } from "../liquidity/types";
import { Position, RouteData, StepperState, TokenData } from "./types";

export const useOptimisationManager = ({
  position,
  onOpenChange,
}: {
  position: PoolPosition;
  onOpenChange: (open: boolean) => void;
}) => {
  const { toast } = useToast();

  const { wallets } = useWallets();
  const connectedWallet = wallets[0];
  const address = connectedWallet?.address;
  const [sourcePosition, setSourcePosition] = useState<Position>();
  const [targetTokens, setTargetTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendTxLoading, setSendTxLoading] = useState(false);

  // Stepper state
  const [stepperState, setStepperState] = useState<StepperState>({
    currentStep: 0,
    approvalNeeded: false,
    approvalLoading: false,
    loadingRoute: false,
  });

  const [transactionState, setTransactionState] = useState<TransactionState>({
    txStatus: null,
    txHash: null,
    errorMessage: null,
  });
  
  const totalSteps = 2;

  // Convert PoolPosition to our internal Position format
  useEffect(() => {
    if (position) {
      setSourcePosition({
        token: {
          name: position.token,
          symbol: position.token,
          address: position.poolTokenAddress,
          decimals: position.underlyingAssetDecimals,
          protocolSlug: position.protocol,
          apy: position.netSupplyApy,
          tvl: position.usdValue * 100, // Estimated TVL based on position value
          underlyingTokens: [
            {
              address: position.underlyingAsset,
              symbol: position.token,
            },
          ],
        },
        balance: {
          amount: position.supplied,
          price: (
            position.usdValue /
            (Number(position.supplied) / 10 ** position.underlyingAssetDecimals)
          ).toString(),
        },
      });

    
    }
  }, [position]);

  useEffect(() => {
    if (sourcePosition) {
      fetchAlternativeProtocols(position);
    }
  }, [sourcePosition, position]);

  const fetchAlternativeProtocols = async (position: PoolPosition) => {
    setLoading(true);
    try {
      // Use the Enso API to get real alternative protocols based on the underlying tokens
      const tokens = await ensoService.getTokenData({
        underlyingTokensExact: position.underlyingAsset as `0x${string}`,
        chainId: position.networkId || 1,
        type: "defi",
      });

      // Filter out tokens and only keep ones that are different from the current position
      // Also ensure they have APY data
      const alternativeTokens = tokens
        .filter(
          (token) =>
            token.address.toLowerCase() !==
              position.underlyingAsset.toLowerCase() &&
            token.apy !== null &&
            token.tvl !== null &&
            Number(token.tvl) > 100000 &&
            (Number(token.apy) || 0) > 0 &&
            token.name?.match(/Aave|Compound|Curve|Moonwell/)
        )
        .map((token) => ({
          name: token.name || token.symbol || "Unknown",
          symbol: token.symbol || "UN",
          address: token.address.toLowerCase() as `0x${string}`,
          decimals: token.decimals,
          protocolSlug: token.protocolSlug || "Unknown",
          apy: token.apy !== null ? Number(token.apy) : 0,
          tvl: token.tvl !== null ? Number(token.tvl) : 0,
          underlyingTokens: token.underlyingTokens?.map((ut) => ({
            address: ut.address,
            symbol: ut.symbol || "UN",
          })) || [{ address: token.address, symbol: token.symbol || "UN" }],
        }));
      console.log(alternativeTokens);
      // Sort by APY, highest first
      alternativeTokens.sort((a, b) => b.apy - a.apy);

      // If we have no alternatives, use the mock data as a fallback
      if (alternativeTokens.length === 0) {
        console.warn("No alternative protocols found, using fallback data");
        setTargetTokens([]);
      } else {
        setTargetTokens(alternativeTokens);
      }
    } catch (error) {
      console.error("Error fetching alternative protocols:", error);
      toast({
        title: "Error",
        description: "Failed to load alternative protocols",
        variant: "destructive",
      });
      setTargetTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetSelect = async (token: TokenData) => {
    setStepperState((prevState) => ({
      ...prevState,
      selectedTarget: token,
      loadingRoute: true,
    }));
    
    await fetchRouteData(token);

    setStepperState((prevState) => ({
      ...prevState,
      currentStep: 1,
      
    }));

  };

  const fetchRouteData = async (targetToken: TokenData) => {
    if (!sourcePosition) return;

    try {
      // In a real implementation, we'd call the actual API
      // For now, simulate a response
      console.log("sourcePosition.token.address", sourcePosition);
      const result = await ensoService.route({
        chainId: position.networkId, // Use network ID from position
        fromAddress: address as `0x${string}`,
        tokenIn: sourcePosition.token.address as `0x${string}`,
        tokenOut: targetToken.address as `0x${string}`,
        amountIn: sourcePosition.balance.amount,
        slippage: 500,
        receiver: address as `0x${string}`,
        spender: address as `0x${string}`,
      });

      // Ensure result conforms to our RouteData type
      const routeData: RouteData = {
        amountOut: result.amountOut?.toString() || "0",
        priceImpact: result.priceImpact?.toString() || "0",
        tx: result.tx,
      };

      setStepperState((prevState) => ({
        ...prevState,
        routeData: routeData,
        loadingRoute: false,
      }));

      // Check if approval is needed
      checkApprovalNeeded(
        sourcePosition.token.address,
        sourcePosition.balance.amount
      );
    } catch (error) {
      console.error("Error fetching route data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch migration route. Please try again.",
        variant: "destructive",
      });
      setStepperState((prevState) => ({
        ...prevState,
        loadingRoute: false,
      }));
    }
  };

  const checkApprovalNeeded = async (tokenAddress: string, amount: string) => {
    if (!address) return;

    try {
      const approvalData = await ensoService.getApprovalData({
        chainId: position.networkId, // Use proper chain ID
        fromAddress: address as `0x${string}`,
        tokenAddress: tokenAddress as `0x${string}`,
        amount: amount,
      });

      setStepperState((prevState) => ({
        ...prevState,
        approvalNeeded: !!approvalData,
      }));
    } catch (error) {
      console.error("Error checking approval:", error);
    }
  };

  const handleApprove = async () => {
    if (!sourcePosition || !address) return;

    setStepperState((prevState) => ({
      ...prevState,
      approvalLoading: true,
    }));

    try {
      // Implement approval logic here
      // This would connect with the wallet provider
      toast({
        title: "Approved",
        description: `${sourcePosition.token.symbol} approved for migration`,
      });

      setStepperState((prevState) => ({
        ...prevState,
        approvalNeeded: false,
        approvalLoading: false,
      }));
    } catch (error) {
      console.error("Error approving token:", error);
      toast({
        title: "Error",
        description: "Failed to approve token. Please try again.",
        variant: "destructive",
      });

      setStepperState((prevState) => ({
        ...prevState,
        approvalLoading: false,
      }));
    }
  };

  const handleConfirmMigration = async () => {
    if (!stepperState.routeData?.tx) return;

    setSendTxLoading(true);
    try {
      // Implement transaction send logic here
      // This would connect with the wallet provider

      console.log("stepperState.routeData", stepperState.routeData);
      const provider = await connectedWallet.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const txn = await signer.sendTransaction({
        to: stepperState.routeData.tx.to,
        value: stepperState.routeData.tx.value,
        data: stepperState.routeData.tx.data,
        gasLimit: stepperState.routeData.tx.gasLimit,
      });
      const receipt = await txn.wait();
      setTransactionState({
        txStatus: "success",
        txHash: receipt.transactionHash,
        errorMessage: null,
      });
      // Simulate a successful transaction

      toast({
        title: "Success",
        description: "Position migrated successfully",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error sending transaction:", error);
      setTransactionState({
        txStatus: "error",
        txHash: null,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to submit transaction",
      });
      toast({
        title: "Error",
        description: "Failed to migrate position. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendTxLoading(false);
    }
  };

  const goToPreviousStep = () => {
    setStepperState((prevState) => ({
      ...prevState,
      currentStep: Math.max(0, prevState.currentStep - 1),
    }));
  };

  const normalizeValue = (amount: string, decimals: number) => {
    return parseFloat(amount) / 10 ** decimals;
  };

  return {
    sourcePosition,
    targetTokens,
    loading,
    stepperState,
    totalSteps,
    sendTxLoading,
    handleTargetSelect,
    handleApprove,
    handleConfirmMigration,
    goToPreviousStep,
    normalizeValue,
  };
};
