import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Coins, Loader2 } from "lucide-react";
import { useDeploymentFlowContext } from "./context/DeploymentFlowContext";
import { useDeployManager } from "./hooks/useDeployManager";

interface DeploymentSummaryStepProps {
  isDeploying: boolean;
}

export function DeploymentSummaryStep({
  isDeploying,
}: DeploymentSummaryStepProps) {
  const { state, handleBack, handleDeploy } = useDeployManager();
  const selectedAssetSymbol = state.selectedAsset?.symbol || "";
  const selectedProtocol = state.selectedProtocol || "";

  const {
    amount,
    percentage,
    validationError,
    handleAmountChange,
    handleDeployClick,
    handlePercentageChange,
  } = useDeploymentFlowContext();

  const selectedProtocolData = state.protocols.find((p) => p.id === selectedProtocol);
  const usdValue = parseFloat(amount) * (state?.selectedAsset?.priceUsd || 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[500px]"
    >
      {/* Content Area */}
      <div className="flex-1 min-h-0 mb-6">
      <h3 className="text-lg font-medium mb-4">Transaction Details</h3>
        <div className="rounded-lg border p-4 h-full">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Asset</span>
              <span className="font-medium">{selectedAssetSymbol}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Protocol</span>
              <span className="font-medium">{selectedProtocolData?.name}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Expected APY</span>
              <span className="font-medium text-emerald-500">
                {selectedProtocolData?.apy.toFixed(2)}%
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-muted-foreground">
                    ≈ ${(usdValue || 0).toFixed(2)} USD
                  </div>
                  {state.selectedAsset?.balance && (
                    <div className="text-xs text-muted-foreground">
                      Available: {state.selectedAsset.balance} {selectedAssetSymbol}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className={`w-64 text-right pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          validationError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    <span className="font-medium">{selectedAssetSymbol}</span>
                  </div>
              
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-md">
                  <span className="text-muted-foreground">Percentage</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between mb-2">
                  {[10, 25, 50, 75, 100].map((value) => (
                    <Button
                      key={value}
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-2 text-xs ${
                        percentage === value
                          ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => handlePercentageChange([value])}
                    >
                      {value === 100 ? "Max" : `${value}%`}
                    </Button>
                  ))}
                </div>
                <Slider
                  value={[percentage]}
                  onValueChange={handlePercentageChange}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="border-t bg-white pt-4 flex-shrink-0 flex gap-4">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => {
            if (state.isCCIPEnabled) {
              // For CCIP, only call handleDeploy as it handles everything internally
              handleDeploy();
            } else {
              // For regular flow, call both as before
              handleDeployClick();
              handleDeploy();
            }
          }}
          disabled={isDeploying || !!validationError || !amount || parseFloat(amount) <= 0}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {state.isCCIPEnabled ? "Cross-Chain Deploying..." : "Deploying..."}
            </>
          ) : (
            <>
              {state.isCCIPEnabled ? "Deploy Cross-Chain" : "Deploy Funds"}
              <Coins className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
} 