import { useToast } from "@/components/ui/use-toast";
import { AssetBalance, useBalances } from "@/lib/contexts";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Asset, LiquidityManagerProps, Position, TransactionState } from "./types";

interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  isTokenApproved: boolean;
}

interface AssetState {
  asset: string;
  amount: string;
  assets: AssetBalance[];
  positions: Position[];
  usdValue: number;
  percentageUsed: number;
}

interface StepperState {
  currentStep: number;
  direction: number;
  confirmationData: any;
}

export const useLiquidityManager = ({
  existingPosition,
  action,
  setOpen,
}: LiquidityManagerProps) => {
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

  // Asset state
  const [assetState, setAssetState] = useState<AssetState>({
    asset: "",
    amount: "",
    assets: [],
    positions: [],
    usdValue: 0,
    percentageUsed: 0,
  });

  // Stepper state
  const [stepperState, setStepperState] = useState<StepperState>({
    currentStep: 0,
    direction: 0,
    confirmationData: null,
  });

  const totalSteps = 3;

  // Get asset details for the selected asset
  const selectedAsset = useMemo(() => {
    if (assetState.asset === "" || action !== "add") return null;

    return assetState.assets.find((b) => b.symbol === assetState.asset);
  }, [assetState.asset, assetState.assets, assetState.positions, action]);

  // Get selected protocol details
  const selectedProtocol = useMemo(() => {
    if (assetState.asset === "" || action !== "remove") return null;

    const result : AssetBalance = {
      symbol: existingPosition?.token || "",
      name: existingPosition?.token || "",
      balance: (existingPosition?.readableSupplied || ""),
      decimals: existingPosition?.underlyingAssetDecimals || 18,
      value: existingPosition?.usdValue || 0,
      rawBalance: existingPosition?.supplied || "",
      allocation: 0,
      change24h: 0,
      priceUsd: 0,
      logoUrl: "",
      address: existingPosition?.poolTokenAddress|| "",
    }
    return result;
  }, [assetState.asset, assetState.assets, assetState.positions, action]);

  const availableBalance = useMemo(() => {
    switch (action) {
      case "add":
        return selectedAsset
          ? parseFloat((selectedAsset as Asset).rawBalance || "0") /
            parseFloat(`1e${selectedAsset.decimals ?? 18}`)
          : 0;
      case "remove":
        return selectedProtocol
          ? parseFloat(selectedProtocol.balance)
          : 0;
      default:
        return 0;
    }
  }, [action, selectedAsset, selectedProtocol]);
  

  const assetPrice = useMemo(() => {
    switch (action) {
      case "add":
        return selectedAsset?.value
          ? selectedAsset.value / availableBalance
          : 0;
      case "remove":
        return selectedProtocol?.value
          ? selectedProtocol.value / availableBalance
          : 0;
      default:
        return 0;
    }
  }, [selectedAsset, availableBalance,action]);
  // Load assets and positions
  useEffect(() => {
    if (action === "add") {
      const availableAssets = balances.filter((b) => !b.isOtherRow);

      setAssetState((prev) => ({ ...prev, assets: availableAssets }));
    } else {
      // Load user's positions
      const userPositions: Position[] = [
        {
          symbol: "USDC",
          name: "USDC Position",
          address: "0x...",
          balance: "1000",
          decimals: 18,
          value: 1000,
        },
      ];
      setAssetState((prev) => ({ ...prev, positions: userPositions }));
    }
  }, [balances, action]);

  // Calculate USD value and percentage used when amount changes
  useEffect(() => {
    if (assetState.amount && !isNaN(parseFloat(assetState.amount))) {
      const numAmount = parseFloat(assetState.amount);
      setAssetState((prev) => ({
        ...prev,
        usdValue: numAmount * assetPrice,
        percentageUsed:
          availableBalance > 0 ? (numAmount / availableBalance) * 100 : 0,
      }));
    } else {
      setAssetState((prev) => ({
        ...prev,
        usdValue: 0,
        percentageUsed: 0,
      }));
    }
  }, [assetState.amount, assetPrice, availableBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      
      if (isNaN(numValue) || numValue <= availableBalance) {
        // Format the decimal based on the selected asset's decimals
        if (value.includes('.') && !isNaN(numValue)) {
          const parts = value.split('.');
          const maxDecimals = ((action === 'add' ? selectedAsset?.decimals : selectedProtocol?.decimals) ?? 18);

          // If we have more decimals than allowed, truncate
          if (parts[1] && parts[1].length > maxDecimals) {
            const formattedValue = `${parts[0]}.${parts[1].substring(0, maxDecimals)}`;
            setAssetState((prev) => ({ ...prev, amount: formattedValue }));
            return;
          }
        }
        
        setAssetState((prev) => ({ ...prev, amount: value }));
      } else {
        // Format maximum value based on asset decimals
        const maxDecimals = (action === 'add' ? selectedAsset?.decimals : selectedProtocol?.decimals) ?? 18;
        const formattedMax = availableBalance.toFixed(maxDecimals); // Limit to 8 for display purposes
        
        setAssetState((prev) => ({
          ...prev,
          amount: formattedMax,
        }));
      }
    }
  };

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    const newAmount = (availableBalance * percentage) / 100;
    
    // Format according to asset decimals
    const maxDecimals = (action === 'add' ? selectedAsset?.decimals : selectedProtocol?.decimals) ?? 18;
    // Use toFixed but then remove trailing zeros
    let formattedAmount = newAmount.toFixed(Math.min(maxDecimals, 8));
    // Remove trailing zeros after decimal point and remove decimal point if no decimal digits
    formattedAmount = formattedAmount.replace(/\.?0+$/, '');
    
    setAssetState((prev) => ({ ...prev, amount: formattedAmount }));
  };

  const handleMaxClick = () => {
    // Format maximum value based on asset decimals
    const maxDecimals = (action === 'add' ? selectedAsset?.decimals : selectedProtocol?.decimals) ?? 18;
    // Use toFixed but then remove trailing zeros
    let formattedMax = availableBalance.toFixed(Math.min(maxDecimals, 8));
    // Remove trailing zeros after decimal point and remove decimal point if no decimal digits
    formattedMax = formattedMax.replace(/\.?0+$/, '');
    
    setAssetState((prev) => ({
      ...prev,
      amount: formattedMax,
      percentageUsed: 100,
    }));
  };

  const goToNextStep = async () => {
    if (stepperState.currentStep === 0) {
      await fetchLiquidityQuote();
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

  const fetchLiquidityQuote = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: `Please connect your wallet to ${action} liquidity`,
        variant: "destructive",
      });
      return;
    }

    if (!assetState.amount || parseFloat(assetState.amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!assetState.asset) {
      toast({
        title: `No ${action === "add" ? "asset" : "position"} selected`,
        description: `Please select an ${action === "add" ? "asset" : "position"}`,
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, isLoading: true }));

    try {
      let selectedItem;
      let requestBody;
      console.log("action", action);
      switch (action) {
        case "add": {
          selectedItem = selectedAsset;
          if (!selectedItem) {
            throw new Error("Asset not found");
          }

          const tokenAddress = selectedItem.address;
          const decimals = selectedItem.decimals ?? 18;
          const amountInBaseUnit = cleanAndParseAmount(assetState.amount, decimals);

          requestBody = {
            chainId: connectedWallet.chainId.split(":")[1],
            fromAddress: connectedWallet?.address,
            receiver: connectedWallet?.address,
            spender: "0x0000000000000000000000000000000000000000",
            tokenIn: [tokenAddress],
            tokenOut: [existingPosition?.poolTokenAddress],
            amountIn: [amountInBaseUnit],
            slippage: "200",
            isExistingPosition: !!existingPosition,
            pool: existingPosition?.poolAddress,
            underlyingAsset: existingPosition?.underlyingAsset,
            actionType: action,
          };
          break;
        }

        case "remove": {
          console.log("remove123", selectedProtocol);
          selectedItem = selectedProtocol;
          if (!selectedItem) {
            throw new Error("Position not found");
          }

          const tokenAddress = selectedItem.address;
          const decimals = selectedItem.decimals ?? 18;
          const amountOutBaseUnit = cleanAndParseAmount(assetState.amount, decimals);
          const BASE_NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
          requestBody = {
            chainId: connectedWallet.chainId.split(":")[1],
            fromAddress: connectedWallet?.address,
            receiver: connectedWallet?.address,
            spender: "0x0000000000000000000000000000000000000000",
            tokenIn: [tokenAddress],
            tokenOut: [BASE_NATIVE_ADDRESS],
            amountIn: [amountOutBaseUnit],
            slippage: "200",
            isExistingPosition: !!existingPosition,
            tokenAddress: existingPosition?.poolAddress,
            underlyingAsset: existingPosition?.underlyingAsset,
            actionType: action,
          };
          break;
        }

        default:
          throw new Error("Invalid action type");
      }
      const response = await fetch("/api/transactions/liquidity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse response data");
      });

      if (!data || !data.success) {
        throw new Error(data?.message || "Invalid response data");
      }

      setStepperState((prev) => ({
        ...prev,
        confirmationData: data,
        direction: 1,
        currentStep: 1,
      }));
    } catch (error) {
      console.error(`Liquidity ${action} failed:`, error);
      toast({
        title: `Failed to ${action} liquidity`,
        description:
          error instanceof Error
            ? error.message
            : `An unexpected error occurred while ${action}ing liquidity`,
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

    const { gas, tx, route } = stepperState.confirmationData.data;

    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      if (!connectedWallet || !connectedWallet.address) {
        throw new Error("Wallet not connected");
      }
      console.log("gas", gas);

      const recalculatedGas =  Math.floor(gas * 1.5)
      console.log("recalculatedGas", recalculatedGas.toString());
      const provider = await connectedWallet.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const txn = await signer.sendTransaction({
        to: tx.to,
        value: tx.value,
        data: tx.data,
        gasLimit: recalculatedGas,
      });
      const receipt = await txn.wait();

      setTransactionState({
        txStatus: "success",
        txHash: receipt.transactionHash,
        errorMessage: null,
      });
      setStepperState((prev) => ({
        ...prev,
        direction: 1,
        currentStep: 2,
      }));
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
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    // State
    formState,
    transactionState,
    assetState,
    stepperState,
    totalSteps,
    selectedAsset,
    availableBalance,
    isConnected,
    connectedWallet,
    action,
    existingPosition,
    selectedProtocol,
    // Actions
    setFormState,
    setTransactionState,
    setAssetState,
    setStepperState,
    handleAmountChange,
    handleSliderChange,
    handleMaxClick,
    goToNextStep,
    goToPreviousStep,
    handleConfirmTransaction,
    setOpen,
  };
};
