import { useToast } from "@/components/ui/use-toast";
import { createTransaction, ensoService } from "@/lib/services";
import { ProtocolType } from "@/types/notifications";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { RouteData } from "../types";
import { useDeployManager } from "./useDeployManager";

export function useDeploymentFlow() {
  const {
    state,
    handleNext: onNext,
    availableAssets,
  } = useDeployManager();
  const { selectedAsset, selectedProtocol, protocols } = state;
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const connectedWallet = wallets[0];
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(0);
  const [isTokenApproved, setIsTokenApproved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isConfirmingTransaction, setIsConfirmingTransaction] = useState(false);
  const [txStatus, setTxStatus] = useState<null | "success" | "error">(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(20);

  const handleAmountChange = useCallback(
    (value: string) => {
      // Clear previous validation errors
      setValidationError(null);

      // Only allow numbers and decimal points
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
        setValidationError("Please enter a valid number");
        return;
      }

      // If no selectedAsset found, just set the amount
      if (!selectedAsset) {
        setAmount(value);
        setPercentage(0);
        return;
      }

      const totalBalance = parseFloat(selectedAsset.balance || "0");
      const maxDecimals = selectedAsset.decimals ?? 18;

      // Handle empty input
      if (value === "" || value === ".") {
        setAmount(value);
        setPercentage(0);
        return;
      }

      // Handle decimal precision limiting
      if (value.includes(".")) {
        const parts = value.split(".");
        // If we have more decimals than allowed, truncate
        if (parts[1] && parts[1].length > maxDecimals) {
          const formattedValue = `${parts[0]}.${parts[1].substring(
            0,
            maxDecimals
          )}`;
          setAmount(formattedValue);
          const newAmount = parseFloat(formattedValue) || 0;

          // Validate the truncated amount
          if (newAmount <= 0) {
            setValidationError("Amount must be greater than 0");
            setPercentage(0);
          } else if (newAmount > totalBalance) {
            setValidationError(
              `Amount exceeds available balance of ${totalBalance.toFixed(6)} ${
                selectedAsset.symbol
              }`
            );
            setPercentage(100);
          } else {
            const newPercentage =
              totalBalance > 0 ? (newAmount / totalBalance) * 100 : 0;
            setPercentage(Math.min(newPercentage, 100));
          }
          return;
        }
      }

      const numValue = parseFloat(value);

      // Set the amount first
      setAmount(value);

      // Validate and update percentage
      if (isNaN(numValue)) {
        setPercentage(0);
        return;
      }

      if (numValue <= 0) {
        setValidationError("Amount must be greater than 0");
        setPercentage(0);
      } else if (numValue > totalBalance) {
        setValidationError(
          `Amount exceeds available balance of ${totalBalance.toFixed(6)} ${
            selectedAsset.symbol
          }`
        );
        setPercentage(100);
      } else {
        // Valid amount - update percentage
        const newPercentage =
          totalBalance > 0 ? (numValue / totalBalance) * 100 : 0;
        setPercentage(Math.min(newPercentage, 100));
      }
    },
    [selectedAsset, availableAssets]
  );

  const handlePercentageChange = useCallback(
    (value: number[]) => {
      const newPercentage = value[0];
      setPercentage(newPercentage);
      setValidationError(null); // Clear any validation errors

      if (selectedAsset?.balance) {
        const totalBalance = parseFloat(selectedAsset.balance);
        const newAmount = (totalBalance * newPercentage) / 100;

        // Format the amount with appropriate decimals and remove trailing zeros
        const maxDecimals = Math.min(selectedAsset.decimals || 18, 8); // Limit to 8 for display
        let formattedAmount = newAmount.toFixed(maxDecimals);
        // Remove trailing zeros after decimal point
        formattedAmount = formattedAmount.replace(/\.?0+$/, "");

        setAmount(formattedAmount);
      }
    },
    [selectedAsset, availableAssets]
  );

  const handleDeployClick = useCallback(async () => {
    if (!selectedAsset || !selectedProtocol || !amount) return;

    try {
      const protocol = protocols.find((p) => p.id === selectedProtocol);
      if (!selectedAsset || !protocol || !connectedWallet.address) return;
      // TODO: handle multiple networks
      const connectedWalletAddress =
        connectedWallet.address.toLowerCase() as `0x${string}`;
      const result = await ensoService.route({
        chainId:
          protocol?.chainId || Number(connectedWallet.chainId.split(":")[1]),
        fromAddress: connectedWalletAddress,
        tokenIn: selectedAsset.address as `0x${string}`,
        tokenOut: protocol.address,
        amountIn: ethers.utils
          .parseUnits(amount, selectedAsset.decimals || 18)
          .toString(),
        slippage: 300,
        receiver: connectedWalletAddress,
        spender: connectedWalletAddress,
      });

      // Transform the result to match our RouteData type
      setRouteData({
        tx: {
          to: result.tx.to,
          value: result.tx.value.toString(),
          data: result.tx.data,
          gasLimit: "500000", // Default gas limit, adjust as needed
        },
        priceImpact: Number(result.priceImpact) || 0,
      });
    } catch (error) {
      console.error("Error fetching route:", error);
      toast({
        title: "Error",
        description: "Failed to fetch deployment route. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    selectedAsset,
    selectedProtocol,
    amount,
    availableAssets,
    protocols,
    connectedWallet,
    toast,
  ]);

  const handleConfirmTransaction = useCallback(async () => {
    if (!routeData?.tx || !user?.id) return;
    try {
      setIsConfirmingTransaction(true);
      const provider = await connectedWallet.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const txn = await signer.sendTransaction({
        to: routeData.tx.to,
        value: routeData.tx.value,
        data: routeData.tx.data,
        gasLimit: routeData.tx.gasLimit,
      });
      setTxHash(txn.hash);
      await txn.wait();
      setTxStatus("success");

      // Create transaction record in database
      const protocol = protocols.find((p) => p.id === selectedProtocol);
      if (protocol && selectedAsset) {
        const protocolName = protocol.name.toLowerCase().match(/(aave|compound|lido|uniswap|curve)/)?.[1] || "aave";

        await createTransaction(
          user.id,
          "deposit",
          parseFloat(amount),
          protocolName as ProtocolType,
          protocol.chainId,
          txn.hash,
          connectedWallet.address,
          routeData.tx.to,
          selectedAsset.address,
          selectedAsset.decimals,
          false // isCCIP
        );
      }

      onNext();
    } catch (error: any) {
      setTxStatus("error");
      setErrorMessage(error?.message || "Transaction failed");
      toast({
        title: "Error",
        description: "Failed to submit transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmingTransaction(false);
    }
  }, [
    routeData,
    connectedWallet,
    onNext,
    user?.id,
    selectedProtocol,
    protocols,
    selectedAsset,
    amount,
  ]);

  return {
    amount,
    percentage,
    isTokenApproved,
    routeData,
    isLoadingRoute,
    isConfirmingTransaction,
    txStatus,
    txHash,
    errorMessage,
    redirectCountdown,
    validationError,
    handleAmountChange,
    handlePercentageChange,
    handleDeployClick,
    handleConfirmTransaction,
    setIsTokenApproved,
  };
}
