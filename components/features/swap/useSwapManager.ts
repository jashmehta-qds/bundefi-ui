import { useToast } from "@/components/ui/use-toast";
import { AssetBalance, useBalances } from "@/lib/contexts";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { SwapAsset, SwapManagerProps } from "./types";

interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  isTokenApproved: boolean;
}

interface TransactionState {
  txStatus: "success" | "error" | null;
  txHash: string | null;
  errorMessage: string | null;
}

interface SwapState {
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  assets: AssetBalance[];
  fromUsdValue: number;
  toUsdValue: number;
  percentageUsed: number;
  slippage: number;
}

interface StepperState {
  currentStep: number;
  direction: number;
  confirmationData: any;
}

export const useSwapManager = ({ fromTokenAddress, setOpen }: SwapManagerProps) => {
  const { toast } = useToast();
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { balances } = useBalances();

  const isConnected = authenticated && wallets.length > 0;
  const connectedWallet = wallets[0];

  // Form state
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    isSubmitting: false,
    isTokenApproved: false,
  });

  // Transaction state
  const [transactionState, setTransactionState] = useState<TransactionState>({
    txStatus: null,
    txHash: null,
    errorMessage: null,
  });

  // Swap state
  const [swapState, setSwapState] = useState<SwapState>({
    fromAsset: "",
    toAsset: "",
    fromAmount: "",
    toAmount: "",
    assets: [],
    fromUsdValue: 0,
    toUsdValue: 0,
    percentageUsed: 0,
    slippage: 0.1, // Default slippage 0.5%
  });

  // Stepper state
  const [stepperState, setStepperState] = useState<StepperState>({
    currentStep: 0,
    direction: 0,
    confirmationData: null,
  });

  const totalSteps = 3;

  // Get details for the selected assets
  const selectedFromAsset = useMemo(() => {
    if (swapState.fromAsset === "") return null;
    return swapState.assets.find((b) => b.symbol === swapState.fromAsset);
  }, [swapState.fromAsset, swapState.assets]);

  const selectedToAsset = useMemo(() => {
    if (swapState.toAsset === "") return null;
    return swapState.assets.find((b) => b.symbol === swapState.toAsset);
  }, [swapState.toAsset, swapState.assets]);

  const availableFromBalance = useMemo(() => {
    return selectedFromAsset
      ? parseFloat((selectedFromAsset as SwapAsset).rawBalance || "0") /
        parseFloat(`1e${selectedFromAsset.decimals ?? 18}`)
      : 0;
  }, [selectedFromAsset]);
  
  const fromAssetPrice = useMemo(() => {
    return selectedFromAsset?.value && availableFromBalance > 0
      ? selectedFromAsset.value / availableFromBalance
      : 0;
  }, [selectedFromAsset, availableFromBalance]);

  const toAssetPrice = useMemo(() => {
    return selectedToAsset?.value && parseFloat(selectedToAsset.rawBalance || "0") > 0
      ? selectedToAsset.value / 
        (parseFloat(selectedToAsset.rawBalance || "0") / parseFloat(`1e${selectedToAsset.decimals ?? 18}`))
      : 0;
  }, [selectedToAsset]);

  // Load assets
  useEffect(() => {
    const availableAssets = balances.filter((b) => !b.isOtherRow);
    setSwapState((prev) => ({ ...prev, assets: availableAssets }));
  }, [balances]);

  // If fromTokenAddress is provided, set it as the selected fromAsset
  useEffect(() => {
    if (fromTokenAddress && swapState.assets.length > 0) {
      const asset = swapState.assets.find(a => a.address.toLowerCase() === fromTokenAddress.toLowerCase());
      if (asset) {
        setSwapState(prev => ({ ...prev, fromAsset: asset.symbol }));
      }
    }
  }, [fromTokenAddress, swapState.assets]);

  // Calculate USD values when amounts change
  useEffect(() => {
    if (swapState.fromAmount && !isNaN(parseFloat(swapState.fromAmount))) {
      const numAmount = parseFloat(swapState.fromAmount);
      setSwapState((prev) => ({
        ...prev,
        fromUsdValue: numAmount * fromAssetPrice,
        percentageUsed:
          availableFromBalance > 0 ? (numAmount / availableFromBalance) * 100 : 0,
      }));
    } else {
      setSwapState((prev) => ({
        ...prev,
        fromUsdValue: 0,
        percentageUsed: 0,
      }));
    }
  }, [swapState.fromAmount, fromAssetPrice, availableFromBalance]);

  useEffect(() => {
    if (swapState.toAmount && !isNaN(parseFloat(swapState.toAmount))) {
      const numAmount = parseFloat(swapState.toAmount);
      setSwapState((prev) => ({
        ...prev,
        toUsdValue: numAmount * toAssetPrice,
      }));
    } else {
      setSwapState((prev) => ({
        ...prev,
        toUsdValue: 0,
      }));
    }
  }, [swapState.toAmount, toAssetPrice]);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      
      if (isNaN(numValue) || numValue <= availableFromBalance) {
        // Format the decimal based on the selected asset's decimals
        if (value.includes('.') && !isNaN(numValue)) {
          const parts = value.split('.');
          const maxDecimals = selectedFromAsset?.decimals ?? 18;

          // If we have more decimals than allowed, truncate
          if (parts[1] && parts[1].length > maxDecimals) {
            const formattedValue = `${parts[0]}.${parts[1].substring(0, maxDecimals)}`;
            setSwapState((prev) => ({ ...prev, fromAmount: formattedValue }));
            getQuote(formattedValue, swapState.toAsset);
            return;
          }
        }
        
        setSwapState((prev) => ({ ...prev, fromAmount: value }));
        getQuote(value, swapState.toAsset);
      } else {
        // Format maximum value based on asset decimals
        const maxDecimals = selectedFromAsset?.decimals ?? 18;
        // Use toFixed but then remove trailing zeros
        let formattedMax = availableFromBalance.toFixed(maxDecimals);
        // Remove trailing zeros after decimal point and remove decimal point if no decimal digits
        formattedMax = formattedMax.replace(/\.?0+$/, '');
        
        setSwapState((prev) => ({
          ...prev,
          fromAmount: formattedMax,
        }));
        getQuote(formattedMax, swapState.toAsset);
      }
    }
  };

  const handleMaxClick = () => {
    // Format maximum value based on asset decimals
    const maxDecimals = selectedFromAsset?.decimals ?? 18;
    // Use toFixed but then remove trailing zeros
    let formattedMax = availableFromBalance.toFixed(Math.min(maxDecimals, 8));
    // Remove trailing zeros after decimal point and remove decimal point if no decimal digits
    formattedMax = formattedMax.replace(/\.?0+$/, '');
    
    setSwapState((prev) => ({
      ...prev,
      fromAmount: formattedMax,
      percentageUsed: 100,
    }));
    getQuote(formattedMax, swapState.toAsset);
  };

  const handleSwapAssets = () => {
    setSwapState(prev => ({
      ...prev,
      fromAsset: prev.toAsset,
      toAsset: prev.fromAsset,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
      fromUsdValue: prev.toUsdValue,
      toUsdValue: prev.fromUsdValue
    }));
    getQuote(swapState.toAmount, swapState.fromAsset);
  };

  const handleSlippageChange = (value: number) => {
    setSwapState(prev => ({
      ...prev,
      slippage: value
    }));
  };

  const goToNextStep = async () => {
    if (stepperState.currentStep === 0) {
      await fetchSwapQuote();
    } else if (stepperState.currentStep === 1) {
      await handleConfirmTransaction();
    }
  };

  const goToPreviousStep = () => {
    setStepperState((prev) => ({
      ...prev,
      direction: -1,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  };

  // Get a quote for the swap
  const getQuote = async (fromAmount: string, toAsset: string) => {
    if (!isConnected || !fromAmount || !selectedFromAsset || !toAsset) return;
    
    try {
      // Only get quote if we have valid input
      if (parseFloat(fromAmount) <= 0 || !selectedFromAsset || !toAsset) {
        setSwapState(prev => ({ ...prev, toAmount: "" }));
        return;
      }

      const toAssetObj = swapState.assets.find(a => a.symbol === toAsset);
      if (!toAssetObj) {
        setSwapState(prev => ({ ...prev, toAmount: "" }));
        return;
      }

      // Simple quote calculation for UI feedback
      // In a real app, this would call an API to get a real quote
      const mockRate = toAssetPrice > 0 && fromAssetPrice > 0 
        ? fromAssetPrice / toAssetPrice 
        : 1;
      
      const fromAmountValue = parseFloat(fromAmount);
      const estimatedToAmount = fromAmountValue * mockRate;
      
      // Format based on toAsset decimals
      const toDecimals = toAssetObj.decimals ?? 18;
      let formattedAmount = estimatedToAmount.toFixed(Math.min(toDecimals, 8));
      // Remove trailing zeros
      formattedAmount = formattedAmount.replace(/\.?0+$/, '');
      
      setSwapState(prev => ({ ...prev, toAmount: formattedAmount }));
    } catch (error) {
      console.error("Error getting quote:", error);
      setSwapState(prev => ({ ...prev, toAmount: "" }));
    }
  };

  const fetchSwapQuote = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to swap assets",
        variant: "destructive",
      });
      return;
    }

    if (!swapState.fromAmount || parseFloat(swapState.fromAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!swapState.fromAsset || !swapState.toAsset) {
      toast({
        title: "Assets not selected",
        description: "Please select assets to swap",
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (!selectedFromAsset || !selectedToAsset) {
        throw new Error("Asset not found");
      }

      const fromTokenAddress = selectedFromAsset.address;
      const toTokenAddress = selectedToAsset.address;
      const fromDecimals = selectedFromAsset.decimals ?? 18;
      const amountInBaseUnit = cleanAndParseAmount(swapState.fromAmount, fromDecimals);
      const slippageBps = Math.floor(swapState.slippage * 100); // Convert percentage to basis points

      // In a real app, this would make an API call to get a swap quote
      const requestBody = {
        chainId: connectedWallet.chainId.split(":")[1],
        fromAddress: connectedWallet?.address,
        tokenIn: fromTokenAddress,
        tokenOut: toTokenAddress,
        amountIn: amountInBaseUnit,
        slippage: slippageBps.toString()
      };

      // Mock API response for demonstration
      // In a real app, you would call an actual API endpoint
      const mockSwapQuoteResponse = {
        success: true,
        data: {
          gas: "500000",
          amountOut: swapState.toAmount,
          priceImpact: 0.05,
          tx: {
            to: "0xSwapContractAddress",
            from: connectedWallet?.address,
            data: "0xTransactionData",
            value: "0"
          },
          route: [
            {
              protocol: "enso",
              action: "swap",
              tokenIn: [fromTokenAddress],
              tokenOut: [toTokenAddress]
            }
          ]
        }
      };

      // Move to the next step with the quote data
      setStepperState((prev) => ({
        ...prev,
        confirmationData: mockSwapQuoteResponse,
        direction: 1,
        currentStep: 1,
      }));
    } catch (error) {
      console.error("Swap quote failed:", error);
      toast({
        title: "Failed to get swap quote",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while getting swap quote",
        variant: "destructive",
      });
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Helper function to clean and parse amount
  const cleanAndParseAmount = (amount: string, decimals: number): string => {
    let cleanAmount = amount.trim();
    if (cleanAmount === "" || cleanAmount === ".") {
      cleanAmount = "0";
    }
    if (cleanAmount.startsWith(".")) {
      cleanAmount = "0" + cleanAmount;
    }
    if (cleanAmount.endsWith(".")) {
      cleanAmount = cleanAmount.slice(0, -1);
    }
    return ethers.utils.parseUnits(cleanAmount, decimals).toString();
  };

  const handleConfirmTransaction = async () => {
    if (
      !stepperState.confirmationData ||
      !stepperState.confirmationData.success
    )
      return;

    const { gas, tx } = stepperState.confirmationData.data;

    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      if (!connectedWallet || !connectedWallet.address) {
        throw new Error("Wallet not connected");
      }

      const recalculatedGas = Math.floor(Number(gas) * 1.5);
      const provider = await connectedWallet.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      
      // In a real app, this would send an actual transaction
      // For demo purposes, we'll simulate success
      // const txn = await signer.sendTransaction({
      //   to: tx.to,
      //   value: tx.value,
      //   data: tx.data,
      //   gasLimit: recalculatedGas,
      // });
      // const receipt = await txn.wait();

      // Simulate transaction success
      setTimeout(() => {
        setTransactionState({
          txStatus: "success",
          txHash: "0xMockTransactionHash",
          errorMessage: null,
        });
        setStepperState((prev) => ({
          ...prev,
          direction: 1,
          currentStep: 2,
        }));
        setFormState((prev) => ({ ...prev, isSubmitting: false }));
      }, 2000);
      
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionState({
        txStatus: "error",
        txHash: null,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to submit transaction",
      });
      setStepperState((prev) => ({
        ...prev,
        direction: 1,
        currentStep: 2,
      }));
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    // State
    formState,
    transactionState,
    swapState,
    stepperState,
    totalSteps,
    selectedFromAsset,
    selectedToAsset,
    availableFromBalance,
    isConnected,
    connectedWallet,
    // Actions
    setFormState,
    setTransactionState,
    setSwapState,
    setStepperState,
    handleFromAmountChange,
    handleMaxClick,
    handleSwapAssets,
    handleSlippageChange,
    goToNextStep,
    goToPreviousStep,
    getQuote,
    handleConfirmTransaction,
    setOpen,
  };
}; 