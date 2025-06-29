import { TokenApprovalFlow } from "@/components/shared/forms";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { Coins, Loader2, Zap } from "lucide-react";
import Image from "next/image";
import { CCIPStatus } from "./CCIPStatus";
import { useDeploymentFlowContext } from "./context/DeploymentFlowContext";
import { useDeployManager } from "./hooks/useDeployManager";
import { getChainLogo } from "./utils/chainLogos";

interface TransactionConfirmationStepProps {}

export function TransactionConfirmationStep({}: TransactionConfirmationStepProps) {
  const { wallets } = useWallets();
  const connectedWallet = wallets[0];
  const { state, handleBack, ccipExecution, handleNext } = useDeployManager();
  const selectedAsset = state.selectedAsset?.symbol || "";
  const selectedProtocol = state.selectedProtocol || "";

  const {
    amount,
    isTokenApproved,
    routeData,
    isConfirmingTransaction,
    handleConfirmTransaction,
    setIsTokenApproved,
  } = useDeploymentFlowContext();

  const selectedProtocolData = state.protocols.find(
    (p) => p.id === selectedProtocol
  );

  // Handle CCIP transaction confirmation
  const handleCCIPConfirmTransaction = async () => {
    try {
      const selectedProtocolObj = state.protocols.find(
        (p) => p.id === state.selectedProtocol
      );
      if (!selectedProtocolObj || !state.selectedAsset) {
        throw new Error("Selected protocol or asset not found");
      }

      const txHash = await ccipExecution.executeCCIPFlow(
        state.selectedAsset,
        selectedProtocolObj,
        amount
      );

      if (txHash) {
        toast({
          title: "Cross-Chain Deployment Successful!",
          description: `Your assets have been deployed cross-chain. Transaction: ${txHash}`,
        });

        // Move to complete step
        handleNext();
      }
    } catch (error) {
      console.error("CCIP deployment error:", error);
      toast({
        title: "Deployment Failed",
        description:
          error instanceof Error
            ? error.message
            : "Cross-chain deployment failed",
        variant: "destructive",
      });
    }
  };

  const isCCIPLoading = ccipExecution.state.isLoading;
  const hasCCIPError = !!ccipExecution.state.errorMessage;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[500px]"
    >
      {/* Content Area */}
      <div className="flex-1 min-h-0 mb-6 space-y-4">
        <h3 className="text-lg font-medium mb-4">Transaction Summary</h3>

        {/* Transaction Summary */}
        <div className="rounded-lg border p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Asset</span>
              <span className="font-medium">{selectedAsset}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Protocol</span>
              <span className="font-medium">
                {selectedProtocolData?.chainId &&
                  getChainLogo(selectedProtocolData?.chainId) && (
                    <Image
                      src={getChainLogo(selectedProtocolData?.chainId)!}
                      alt={selectedProtocolData?.name || "Chain"}
                      width={20}
                      height={20}
                      className="inline mr-2 -mt-1"
                    />
                  )}
                {selectedProtocolData?.name}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                {amount} {selectedAsset}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Expected APY</span>
              <span className="font-medium text-emerald-500">
                {selectedProtocolData?.apy.toFixed(2)}%
              </span>
            </div>

            {routeData &&
              routeData.priceImpact !== undefined &&
              routeData.priceImpact >= 0 && (
                <div className="flex justify-between items-center pb-2">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className="font-medium">
                    {routeData.priceImpact.toFixed(2)}%
                  </span>
                </div>
              )}
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-muted/30 rounded-md p-3 pt-0 overflow-y-auto">
          {state.isCCIPEnabled ? (
            // Show CCIP status and token approval when CCIP is enabled
            <div className="space-y-4">
              {<CCIPStatus state={ccipExecution.state} className="mt-4" />}
            </div>
          ) : (
            // Show regular token approval flow when CCIP is disabled
            <TokenApprovalFlow
              chainId={
                selectedProtocolData?.chainId ||
                Number(connectedWallet.chainId.split(":")[1])
              }
              fromAddress={connectedWallet.address}
              tokenAddress={state.selectedAsset?.address || ""}
              amount={ethers.utils
                .parseUnits(
                  amount === "" ? "0" : amount,
                  state.selectedAsset?.decimals || 18
                )
                .toString()}
              onApprovalComplete={() => setIsTokenApproved(true)}
              onApprovalError={(error) => {
                console.error("Approval error:", error);
                setIsTokenApproved(false);
              }}
              isApproved={isTokenApproved}
              setIsApproved={setIsTokenApproved}
            />
          )}
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="border-t bg-white pt-4 flex-shrink-0 flex gap-4">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          Back
        </Button>

        {state.isCCIPEnabled ? (
          // CCIP Confirmation Button
          <Button
            onClick={handleCCIPConfirmTransaction}
            disabled={isCCIPLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {isCCIPLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing Cross-Chain...
              </>
            ) : hasCCIPError ? (
              <>
                Retry Cross-Chain Transaction
                <Zap className="ml-2 h-4 w-4" />
              </>
            ) : !isTokenApproved ? (
              <>
                Confirm Cross-Chain Transaction
                <Zap className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Confirm Cross-Chain Transaction
                <Zap className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          // Regular Confirmation Button
          <Button
            onClick={handleConfirmTransaction}
            disabled={!isTokenApproved}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          >
            {isConfirmingTransaction ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Transaction...
              </>
            ) : isTokenApproved ? (
              <>
                Confirm Transaction
                <Coins className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Confirm Transaction
                <Coins className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
