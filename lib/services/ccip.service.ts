import { BUNDEFI_CONTRACTS, MULTICALL3_ADDRESS } from "@/components/features/deploy/const/bundefi-contracts";
import { CCIP_TOKENS } from "@/components/features/deploy/const/ccip-tokens";
import { Protocol } from "@/components/features/deploy/types";
import { ensoService } from "@/lib/services";
import { BigNumber, ethers } from "ethers";
import { AssetBalance } from "../contexts";

export interface CCIPExecutionParams {
  selectedAsset: AssetBalance;
  selectedProtocol: Protocol;
  amount: string;
  userAddress: `0x${string}`;
  sourceChainId: number;
}

export interface CCIPTransactionData {
  bunDefiAddress: `0x${string}`;
  destinationChainSelector: string;
  receiverAddress: `0x${string}`;
  targetContract: `0x${string}`;
  ethValue: string;
  additionalEth: string;
  tokenAddresses: `0x${string}`[];
  tokenAmounts: string[];
  callData: `0x${string}`;
  gasLimit: number;
}

export interface MulticallStep {
  target: `0x${string}`;
  value: string;
  callData: `0x${string}`;
  description: string;
}

class CCIPService {
  // Step 1: Predict executor address on destination chain
  async predictExecutorAddress(
    userAddress: `0x${string}`,
    destinationChainId: number
  ): Promise<`0x${string}`> {
    try {
      const bunDefiContract =
        BUNDEFI_CONTRACTS[
          destinationChainId as keyof typeof BUNDEFI_CONTRACTS
        ];
      if (!bunDefiContract) {
        throw new Error(
          `BunDefi contract not found for chain ${destinationChainId}`
        );
      }

      // Get destination network RPC URL
      const destinationNetwork = CCIP_TOKENS.find(
        (chain) => chain.chain_id === destinationChainId
      );
      if (!destinationNetwork) {
        throw new Error(
          `Destination network not found for chain ${destinationChainId}`
        );
      }

      // Create provider for destination network using network's RPC URL
      const destinationProvider = new ethers.providers.JsonRpcProvider(
        bunDefiContract.rpcUrl
      );

      // Get predicted executor address from contract on destination chain
      const bunDefiABI = [
        "function predictExecutorAddress(address sender) external view returns (address)",
      ];

      const contract = new ethers.Contract(
        bunDefiContract.address,
        bunDefiABI,
        destinationProvider
      );
      const predictedAddress = await contract.predictExecutorAddress(
        userAddress
      );

      return predictedAddress;
    } catch (error) {
      console.error("Error predicting executor address:", error);
      throw error;
    }
  }

  // // Step 2: Generate ERC20 approval calldata for source chain
  // generateSourceTokenApproval(
  //   tokenAddress: `0x${string}`,
  //   spenderAddress: `0x${string}`,
  //   amount: string
  // ): `0x${string}` {
  //   const approveInterface = new ethers.utils.Interface([
  //     "function approve(address spender, uint256 amount)",
  //   ]);

  //   return approveInterface.encodeFunctionData("approve", [
  //     spenderAddress,
  //     amount,
  //   ]) as `0x${string}`;
  // }

  // Helper function to get destination token
  private getDestinationToken(
    selectedAsset: { symbol: string; address: string },
    sourceChainId: number,
    destinationChainId: number,
  ): { tokenAddress: `0x${string}`; chainConfig: typeof CCIP_TOKENS[0] } {
    const destinationChainConfig = CCIP_TOKENS.find(
      (chain) => chain.chain_id === destinationChainId
    );

    const sourceToken = CCIP_TOKENS.find(
      (chain) => chain.chain_id === sourceChainId
    )?.tokens.find(
      (token) => token.tokenAddress.toLowerCase() === selectedAsset.address.toLowerCase()
    );

    if (!destinationChainConfig || !sourceToken) {
      throw new Error(
        `Destination chain ${destinationChainId} not found in CCIP_TOKENS or Source token ${selectedAsset.symbol} not found on source chain ${sourceChainId}`
      );
    }

    const destinationToken = destinationChainConfig.tokens.find(
      (token) => token.symbol.toLowerCase() === sourceToken.symbol.toLowerCase()
    );

    if (!destinationToken) {
      throw new Error(
        `Token ${selectedAsset.symbol} not found on destination chain ${destinationChainId}`
      );
    }

    return {
      tokenAddress: destinationToken.tokenAddress as `0x${string}`,
      chainConfig: destinationChainConfig,
    };
  }

  // Step 3: Generate Enso token approval calldata for destination chain
  async generateEnsoTokenApproval(
    selectedAsset: { symbol: string; address: string },
    executorAddress: `0x${string}`,
    amount: string,
    sourceChainId: number,
    destinationChainId: number
  ): Promise<`0x${string}`> {
    try {
      // Get destination token using helper function
      const { tokenAddress } = this.getDestinationToken(selectedAsset, sourceChainId, destinationChainId);

      // Get approval data from Enso API
      const approvalData = await ensoService.getApprovalData({
        chainId: destinationChainId,
        fromAddress: executorAddress,
        tokenAddress: tokenAddress,
        amount: amount,
      });

      return (approvalData.tx?.data as `0x${string}`) || "0x";
    } catch (error) {
      console.error("Error generating Enso token approval:", error);
      throw error;
    }
  }

  // Step 4: Generate Enso route calldata
  async generateEnsoRoute(
    selectedAsset: { symbol: string; address: string },
    selectedProtocol: Protocol,
    executorAddress: `0x${string}`,
    userAddress: `0x${string}`,
    amount: string,
    sourceChainId: number,
    destinationChainId: number
  ): Promise<`0x${string}`> {
    try {
      // Get destination token using helper function
      const { tokenAddress } = this.getDestinationToken(selectedAsset, sourceChainId, destinationChainId);

      // Get route data from Enso API
      const routeData = await ensoService.route({
        chainId: destinationChainId,
        fromAddress: executorAddress,
        tokenIn: tokenAddress,
        tokenOut: selectedProtocol.address as `0x${string}`,
        amountIn: amount,
        slippage: 300, // 3% slippage hardcoded as requested
        receiver: userAddress,
        spender: executorAddress,
      });

      return (routeData.tx?.data as `0x${string}`) || "0x";
    } catch (error) {
      console.error("Error generating Enso route:", error);
      throw error;
    }
  }

  // Step 5: Generate multicall data
  generateMulticallData(steps: MulticallStep[]): `0x${string}` {
    try {
      const multicall3Interface = new ethers.utils.Interface([
        "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)",
      ]);

      const calls = steps.map((step) => ({
        target: step.target,
        allowFailure: false, // Set to false for strict execution
        callData: step.callData,
      }));

      return multicall3Interface.encodeFunctionData("aggregate3", [
        calls,
      ]) as `0x${string}`;
    } catch (error) {
      console.error("Error generating multicall data:", error);
      throw error;
    }
  }

  // Step 6: Prepare complete CCIP transaction data
  async prepareCCIPTransaction(
    params: CCIPExecutionParams
  ): Promise<CCIPTransactionData> {
    try {
      const {
        selectedAsset,
        selectedProtocol,
        amount,
        userAddress,
        sourceChainId,
      } = params;

      // Get destination chain ID from the selected protocol
      const destinationChainId = selectedProtocol.chainId || sourceChainId;

      // Step 1: Predict executor address
      const executorAddress = await this.predictExecutorAddress(
        userAddress,
        destinationChainId
      );

      // Step 3: Generate Enso token approval
      const ensoApprovalCallData = await this.generateEnsoTokenApproval(
        selectedAsset,
        executorAddress,
        amount,
        sourceChainId,
        destinationChainId
      );

      console.log("ensoApprovalCallData", ensoApprovalCallData);

      // Step 4: Generate Enso route
      const ensoRouteCallData = await this.generateEnsoRoute(
        selectedAsset,
        selectedProtocol,
        executorAddress,
        userAddress,
        amount,
        sourceChainId,
        destinationChainId
      );
      console.log("ensoRouteCallData", ensoRouteCallData);

      // Step 5: Create multicall steps
      const multicallSteps: MulticallStep[] = [];

      // Add Enso approval step if needed
      if (ensoApprovalCallData && ensoApprovalCallData !== "0x") {
        // Find the destination token for the target address

        const { tokenAddress } = this.getDestinationToken(selectedAsset, sourceChainId, destinationChainId);
        multicallSteps.push({
          target: tokenAddress,
          value: "0",
          callData: ensoApprovalCallData,
          description: `Approve ${selectedAsset.symbol} for Enso`,
        });
      }

      // Add Enso route step
      if (ensoRouteCallData && ensoRouteCallData !== "0x") {
        // The target would be the Enso router - for now using a placeholder
        // In production, you'd get this from the Enso API response
        multicallSteps.push({
          target: BUNDEFI_CONTRACTS[destinationChainId as keyof typeof BUNDEFI_CONTRACTS].ensoRouter as `0x${string}`, // Enso Router placeholder
          value: "0",
          callData: ensoRouteCallData,
          description: `Execute Enso route to ${selectedProtocol.name}`,
        });
      }

      // Generate multicall data
      const multicallData = this.generateMulticallData(multicallSteps);

      // Get contract addresses
      const sourceContract =
        BUNDEFI_CONTRACTS[sourceChainId as keyof typeof BUNDEFI_CONTRACTS];
      const destinationContract =
        BUNDEFI_CONTRACTS[
          destinationChainId as keyof typeof BUNDEFI_CONTRACTS
        ];

      if (!sourceContract || !destinationContract) {
        throw new Error(
          `Contract addresses not found for source chain ${sourceChainId} or destination chain ${destinationChainId}`
        );
      }

      // Calculate additional ETH (~$2 USD equivalent)
      const additionalEth = "0.001"; // Simplified - in production, you'd calculate based on current ETH price

      return {
        bunDefiAddress: sourceContract.address,
        destinationChainSelector: destinationContract.chainSelector,
        receiverAddress: destinationContract.address,
        targetContract: MULTICALL3_ADDRESS,
        ethValue: "0", // No ETH value for the execution itself
        additionalEth,
        tokenAddresses: [selectedAsset.address as `0x${string}`],
        tokenAmounts: [amount],
        callData: multicallData,
        gasLimit: 1_000_000, // Default as requested
      };
    } catch (error) {
      console.error("Error preparing CCIP transaction:", error);
      throw error;
    }
  }

  // Estimate CCIP fees
  async estimateCCIPFee(transactionData: CCIPTransactionData): Promise<string> {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // BunDefi contract ABI for estimateFee
      const bunDefiABI = [
        "function estimateFee(uint64 destinationChainSelector, address receiver, address targetContract, uint256 value, address[] calldata tokenAddresses, uint256[] calldata tokenAmounts, bytes calldata callData, uint256 gasLimit) external view returns (uint256)",
      ];

      const contract = new ethers.Contract(
        transactionData.bunDefiAddress,
        bunDefiABI,
        provider
      );

      const fee = (await contract.functions.estimateFee(
        transactionData.destinationChainSelector,
        transactionData.receiverAddress,
        transactionData.targetContract,
        transactionData.ethValue,
        transactionData.tokenAddresses,
        transactionData.tokenAmounts,
        transactionData.callData,
        transactionData.gasLimit
      )) as [BigNumber]; // Fee is returned as an array with one element

      // Convert hex string to BigNumber and then to ETH
      const feeBigNumber = fee[0]; // Get first element from the array

      // Convert fee from wei to ETH string
      return ethers.utils.formatEther(feeBigNumber);
    } catch (error) {
      console.error("Error estimating CCIP fee:", error);
      throw error;
    }
  }

  // Get native token price for calculating $2 USD equivalent
  async getNativeTokenPrice(chainId: number): Promise<number> {
    try {
      // This would typically call a price oracle or API
      // For now, returning hardcoded values
      const prices: Record<number, number> = {
        1: 3000, // ETH price in USD
        8453: 3000, // Base uses ETH
        43114: 40, // AVAX price in USD
        42161: 3000, // Arbitrum uses ETH
      };

      return prices[chainId] || 3000;
    } catch (error) {
      console.error("Error getting native token price:", error);
      return 3000; // Fallback to ETH price
    }
  }

  // Calculate USD equivalent in native token
  async calculateUSDEquivalent(
    usdAmount: number,
    chainId: number
  ): Promise<string> {
    try {
      const nativeTokenPrice = await this.getNativeTokenPrice(chainId);
      const nativeAmount = usdAmount / nativeTokenPrice;
      return nativeAmount.toString();
    } catch (error) {
      console.error("Error calculating USD equivalent:", error);
      return "0.001"; // Fallback
    }
  }
}

export const ccipService = new CCIPService();
