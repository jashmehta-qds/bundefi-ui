import { TokenApprovalFlow } from "@/components/shared/forms";
import { ethers } from "ethers";
import { useLiquidityManagerContext } from "./LiquidityManagerContext";
import { formatTokenAddress } from "./utils";

interface RouteStep {
  protocol: string;
  action: string;
  tokenIn: string[];
  tokenOut: string[];
}

interface BundleStep {
  protocol: string;
  action: string;
  args: {
    tokenIn: string;
    tokenOut: string[];
  };
}

export function ConfirmationScreen() {
  const {
    stepperState,
    connectedWallet,
    selectedAsset,
    selectedProtocol,
    assetState,
    formState,
    setFormState,
  } = useLiquidityManagerContext();

  if (!stepperState.confirmationData || !stepperState.confirmationData.success) return null;

  const { gas, priceImpact, route, bundle } = stepperState.confirmationData.data;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Confirm Transaction</h3>
        <p className="text-sm text-muted-foreground">
          Review the details of your liquidity position
        </p>
      </div>

      <div className="py-2 space-y-4">
        <div className="mt-2">
          <div className="max-h-[200px] overflow-y-auto bg-muted/30 rounded-md p-3 pt-0">
            <TokenApprovalFlow
              chainId={Number(connectedWallet.chainId.split(":")[1])}
              fromAddress={connectedWallet.address.toLowerCase()}
              tokenAddress={selectedAsset?.address.toLowerCase() ||selectedProtocol?.address.toLowerCase() || ""}
              amount={ethers.utils
                .parseUnits(assetState.amount, selectedAsset?.decimals || selectedProtocol?.decimals)
                .toString()}
              onApprovalComplete={() => setFormState(prev => ({ ...prev, isTokenApproved: true }))}
              onApprovalError={(error) => {
                console.error("Approval error:", error);
                setFormState(prev => ({ ...prev, isTokenApproved: false }));
              }}
              isApproved={formState.isTokenApproved}
              setIsApproved={(isApproved) => setFormState(prev => ({ ...prev, isTokenApproved: isApproved }))}
            />
            {route &&
              route.map((step: RouteStep, index: number) => (
                <div
                  key={index}
                  className="mb-3 pb-3 border-b border-border/40 last:border-0 last:mb-0 last:pb-0"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Step {index + 2}</span>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {step.protocol.toLowerCase() === "enso"
                        ? "SWAP"
                        : step.protocol.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium capitalize">{step.action}</span>
                    {step.tokenIn && step.tokenOut && (
                      <span className="text-muted-foreground text-xs">
                        {step.tokenIn.length > 0 &&
                          step.tokenOut.length > 0 &&
                          " • "}
                        {formatTokenAddress(step.tokenIn[0])} →{" "}
                        {formatTokenAddress(step.tokenOut[0])}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            {bundle &&
              bundle.map((step: BundleStep, index: number) => (
                <div
                  key={index}
                  className="mb-3 pb-3 border-b border-border/40 last:border-0 last:mb-0 last:pb-0"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Step {index + 1}</span>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {step.protocol.toLowerCase() === "enso"
                        ? "SWAP"
                        : step.protocol.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium capitalize">{step.action}</span>
                    {step.args.tokenIn && step.args.tokenOut && (
                      <span className="text-muted-foreground text-xs">
                        {step.args.tokenIn &&
                          step.args.tokenOut.length > 0 &&
                          " • "}
                        {formatTokenAddress(step.args.tokenIn as string)} →{" "}
                        {formatTokenAddress(step.args.tokenOut[0])}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 px-3">
          {priceImpact && (
            <>
              <div className="text-sm text-muted-foreground">Price Impact</div>
              <div
                className={`text-sm font-medium text-right ${
                  priceImpact > 3
                    ? "text-amber-500"
                    : priceImpact > 5
                      ? "text-red-500"
                      : "text-greenx-500"
                }`}
              >
                {priceImpact?.toFixed(2)}%
              </div>
            </>
          )}

          <div className="text-sm text-muted-foreground flex items-center">
            Estimated Gas
          </div>
          <div className="text-sm font-medium text-right">
            {(parseInt(gas) / 1e9).toFixed(6)} ETH
          </div>
        </div>
      </div>
    </div>
  );
} 