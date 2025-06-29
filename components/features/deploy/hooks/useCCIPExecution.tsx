import { toast } from "@/components/ui/use-toast";
import { AssetBalance, useNetwork } from "@/lib/contexts";
import {
  CCIPExecutionParams,
  ccipService,
  CCIPTransactionData, createTransaction
} from "@/lib/services";
import { ProtocolType } from "@/types/notifications";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { Protocol } from "../types";

export interface CCIPExecutionState {
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
  stepDescriptions: string[];
  transactionData: CCIPTransactionData | null;
  estimatedFee: string | null;
  errorMessage: string | null;
  txHash: string | null;
  txStatus: "success" | "error" | null;
}

export function useCCIPExecution() {
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { selectedNetwork } = useNetwork();
  const connectedWallet = wallets[0];

  const [state, setState] = useState<CCIPExecutionState>({
    isLoading: false,
    currentStep: 0,
    totalSteps: 6,
    stepDescriptions: [
      "Predicting executor address on destination chain",
      "Generating source token approval",
      "Generating Enso token approval",
      "Generating Enso route data",
      "Assembling multicall",
      "Executing cross-chain transaction",
    ],
    transactionData: null,
    estimatedFee: null,
    errorMessage: null,
    txHash: null,
    txStatus: null,
  });

  const updateStep = useCallback((step: number, description?: string) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
      stepDescriptions: description
        ? prev.stepDescriptions.map((desc, index) =>
            index === step ? description : desc
          )
        : prev.stepDescriptions,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: false,
      errorMessage: error,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading,
      errorMessage: isLoading ? null : prev.errorMessage,
    }));
  }, []);

  // Step 1: Prepare CCIP transaction data
  const prepareCCIPTransaction = useCallback(
    async (
      params: CCIPExecutionParams
    ): Promise<CCIPTransactionData | null> => {
      if (!connectedWallet?.address || !selectedNetwork) {
        setError("Wallet not connected or network not selected");
        return null;
      }

      try {
        setLoading(true);
        updateStep(0);

        const transactionData = await ccipService.prepareCCIPTransaction(
          params
        );

        setState((prev) => ({
          ...prev,
          transactionData,
        }));

        return transactionData;
      } catch (error) {
        console.error("Error preparing CCIP transaction:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to prepare CCIP transaction"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      connectedWallet?.address,
      selectedNetwork,
      setError,
      setLoading,
      updateStep,
    ]
  );

  // Step 2: Estimate CCIP fees
  const estimateFees = useCallback(
    async (transactionData: CCIPTransactionData): Promise<string | null> => {
      try {
        updateStep(1, "💰 Estimating CCIP fees");

        const estimatedFee = await ccipService.estimateCCIPFee(transactionData);

        setState((prev) => ({
          ...prev,
          estimatedFee,
        }));

        return estimatedFee;
      } catch (error) {
        console.error("Error estimating fees:", error);
        setError(
          error instanceof Error ? error.message : "Failed to estimate fees"
        );
        return null;
      }
    },
    [setError, updateStep]
  );

  // Step 3: Execute source chain approval (if needed)
  const executeSourceApproval = useCallback(
    async (
      selectedAsset: AssetBalance,
      amount: string,
      transactionData: CCIPTransactionData
    ): Promise<boolean> => {
      if (!connectedWallet?.address) {
        setError("Wallet not connected");
        return false;
      }

      try {
        updateStep(2, "✅ Approving source token");

        // Check if approval is needed
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const tokenContract = new ethers.Contract(
          selectedAsset.address,
          [
            "function allowance(address,address) view returns (uint256)",
            "function approve(address,uint256) returns (bool)",
          ],
          signer
        );

        const currentAllowance = await tokenContract.allowance(
          connectedWallet.address,
          transactionData.bunDefiAddress
        );

        const requiredAmount = ethers.BigNumber.from(amount);

        if (currentAllowance.lt(requiredAmount)) {
          // Need approval
          const approveTx = await tokenContract.approve(
            transactionData.bunDefiAddress,
            requiredAmount
          );

          updateStep(2, "⏳ Waiting for approval confirmation");
          await approveTx.wait();

          toast({
            title: "Approval Successful",
            description: `Approved ${selectedAsset.symbol} for cross-chain transfer`,
          });
        } else {
          toast({
            title: "Approval Not Needed",
            description: `Sufficient ${selectedAsset.symbol} allowance already exists`,
          });
        }

        return true;
      } catch (error) {
        console.error("Error executing source approval:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to approve source token"
        );
        return false;
      }
    },
    [connectedWallet?.address, setError, updateStep]
  );

  // Step 4: Execute CCIP transaction
  const executeCCIPTransaction = useCallback(
    async (
      selectedAsset: AssetBalance,
      selectedProtocol: Protocol,
      amount: string,
      transactionData: CCIPTransactionData
    ): Promise<boolean> => {
      if (!connectedWallet?.address || !user?.id) {
        setError("Wallet not connected");
        return false;
      }

      try {
        updateStep(5, "🚀 Executing cross-chain transaction");

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Calculate total value to send (CCIP fee + additional ETH)
        const ccipFeeWei = ethers.utils.parseEther(state.estimatedFee || "0");
        const additionalEthWei = ethers.utils.parseEther(
          transactionData.additionalEth
        );
        const totalValue = ccipFeeWei.add(additionalEthWei);

        const bunDefiABI = [
          "function sendCrossChainExecution(uint64 destinationChainSelector, address receiver, address targetContract, uint256 value, address[] calldata tokenAddresses, uint256[] calldata tokenAmounts, bytes calldata callData, uint256 gasLimit) external payable",
        ];

        const bunDefiContract = new ethers.Contract(
          transactionData.bunDefiAddress,
          bunDefiABI,
          signer
        );

    

        const tx: ethers.ContractTransaction = await bunDefiContract.sendCrossChainExecution(
          transactionData.destinationChainSelector,
          transactionData.receiverAddress,
          transactionData.targetContract,
          transactionData.ethValue,
          transactionData.tokenAddresses,
          transactionData.tokenAmounts,
          transactionData.callData,
          transactionData.gasLimit,
          { value: totalValue }
        );

        updateStep(5, "⏳ Waiting for transaction confirmation");
        const receipt = await tx.wait();
        setState((prev) => ({
          ...prev,
          txHash: receipt.transactionHash,
          txStatus: "success",
        }));
      

        const protocol = selectedProtocol.name.toLowerCase().match(/(aave|compound|lido|uniswap|curve)/)?.[1] || "aave";

        // Create transaction record in database
        await createTransaction(
          connectedWallet.address,
          "deposit",
          parseFloat(amount),
          protocol as ProtocolType,
          selectedProtocol.chainId,
          receipt.transactionHash,
          connectedWallet.address,
          transactionData.bunDefiAddress,
          selectedAsset.address,
          selectedAsset.decimals,
          true // isCCIP
        );

        toast({
          title: "Transaction Successful",
          description: "Cross-chain transaction executed successfully",
        });

        return true;
      } catch (error) {
        console.error("Error executing CCIP transaction:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to execute CCIP transaction"
        );
        return false;
      }
    },
    [
      connectedWallet?.address,
      user?.id,
      setError,
      updateStep,
      state.estimatedFee,
    ]
  );

  // Execute complete CCIP flow
  const executeCCIPFlow = useCallback(
    async (
      selectedAsset: AssetBalance,
      selectedProtocol: Protocol,
      amount: string
    ): Promise<string | null> => {
      try {
        if (!connectedWallet?.address || !selectedNetwork) {
          setError("Wallet not connected or network not selected");
          return null;
        }
        const amountInWei = ethers.utils
          .parseUnits(amount, selectedAsset.decimals || 18)
          .toString();
  
        // Step 1: Prepare CCIP transaction data
        const transactionData = await prepareCCIPTransaction({
          selectedAsset,
          selectedProtocol,
          amount: amountInWei,
          userAddress: connectedWallet.address as `0x${string}`,
          sourceChainId: selectedNetwork.chainId,
        });

        if (!transactionData) {
          setError("Failed to prepare CCIP transaction data");
          return null;
        }

        // Step 2: Estimate CCIP fees
        const estimatedFee = await estimateFees(transactionData);
        if (!estimatedFee) {
          setError("Failed to estimate CCIP fees");
          return null;
        }

        // Step 3: Execute source chain approval
        const approvalSuccess = await executeSourceApproval(
          selectedAsset,
          amountInWei,
          transactionData
        );

        if (!approvalSuccess) {
          setError("Failed to approve source token");
          return null;
        }

        // Step 4: Execute CCIP transaction
        const txSuccess = await executeCCIPTransaction(
          selectedAsset,
          selectedProtocol,
          amountInWei,
          transactionData
        );

        return txSuccess ? transactionData.callData : null;
      } catch (error) {
        console.error("Error in CCIP flow:", error);
        setError(
          error instanceof Error ? error.message : "Failed to execute CCIP flow"
        );
        return null;
      }
    },
    [
      connectedWallet?.address,
      selectedNetwork,
      prepareCCIPTransaction,
      estimateFees,
      executeSourceApproval,
      executeCCIPTransaction,
      setError,
    ]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      currentStep: 0,
      totalSteps: 6,
      stepDescriptions: [
        "Predicting executor address on destination chain",
        "Generating source token approval",
        "Generating Enso token approval",
        "Generating Enso route data",
        "Assembling multicall",
        "Executing cross-chain transaction",
      ],
      transactionData: null,
      estimatedFee: null,
      errorMessage: null,
      txHash: null,
      txStatus: null,
    });
  }, []);

  return {
    state,
    executeCCIPFlow,
    prepareCCIPTransaction,
    estimateFees,
    executeSourceApproval,
    executeCCIPTransaction,
    reset,
  };
}
