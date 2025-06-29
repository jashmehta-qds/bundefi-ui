import { TokenApprovalFlow } from "@/components/shared/forms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";
import { ArrowLeftRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useSwapManagerContext } from "./SwapManagerContext";

export function ConfirmationScreen() {
  const {
    stepperState,
    swapState,
    connectedWallet,
    selectedFromAsset,
    selectedToAsset,
    formState,
    setFormState,
  } = useSwapManagerContext();
  
  const [isSwapDetailsExpanded, setIsSwapDetailsExpanded] = useState(false);

  if (!stepperState.confirmationData || !stepperState.confirmationData.success) return null;

  const { gas, priceImpact, amountOut, route } = stepperState.confirmationData.data;
  
  // Format token address for display
  const formatTokenAddress = (address: string) => {
    if (!address) return "";
    
    // Check if it's ETH
    if (address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      return "ETH";
    }
    
    // Shorten other addresses
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Review the details of your trade
        </p>
      </div>

      <div className="space-y-3">
        {/* Trade Overview - Condensed */}
        <div className="border border-border/30 rounded-md p-3">
          <div className="flex items-center gap-2.5">
            {/* From token */}
            <div className="flex-1 flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{swapState.fromAmount}</span>
                <span className="text-xs text-muted-foreground">{swapState.fromAsset}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-2">≈ ${swapState.fromUsdValue.toFixed(2)}</span>
            </div>
            
            {/* Swap icon */}
            <div className="flex flex-col items-center justify-center py-1 px-1.5">
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>
            
            {/* To token */}
            <div className="flex-1 flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{swapState.toAmount}</span>
                <span className="text-xs text-muted-foreground">{swapState.toAsset}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-2">≈ ${swapState.toUsdValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Swap Details - Expandable */}
        <div className="border border-border/30 rounded-md overflow-hidden">
          <div 
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => setIsSwapDetailsExpanded(!isSwapDetailsExpanded)}
          >
            <div className="text-sm font-medium">Swap Details</div>
            
            {/* Condensed summary when collapsed */}
            {!isSwapDetailsExpanded && (
              <div className="flex items-center gap-3 flex-1 justify-end mr-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Rate</span>
                  <span className="text-xs font-medium">
                  1 {swapState.fromAsset} = {(parseFloat(swapState.toAmount) / parseFloat(swapState.fromAmount)).toFixed(6)} {swapState.toAsset}
                  </span>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Impact</span>
                  <span className={`text-xs font-medium ${parseFloat(priceImpact) > 2 ? 'text-amber-500' : 'text-green-500'}`}>
                    {parseFloat(priceImpact).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              {isSwapDetailsExpanded ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </div>
          
          <div 
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden", 
              isSwapDetailsExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="p-4 bg-muted/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Rate</span>
                <span className="text-xs">
                  1 {swapState.fromAsset} = {(parseFloat(swapState.toAmount) / parseFloat(swapState.fromAmount)).toFixed(6)} {swapState.toAsset}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Price Impact</span>
                <span className={`text-xs ${parseFloat(priceImpact) > 2 ? 'text-amber-500' : 'text-green-500'}`}>
                  {parseFloat(priceImpact).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Slippage Tolerance</span>
                <span className="text-xs">{swapState.slippage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Network Fee</span>
                <span className="text-xs">≈ {(parseInt(gas) / 1e9).toFixed(6)} ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Token Approval */}
        <div className="max-h-full overflow-y-auto bg-muted/30 rounded-md p-3 pt-0">
          <TokenApprovalFlow
            chainId={Number(connectedWallet.chainId.split(":")[1])}
            fromAddress={connectedWallet.address}
            tokenAddress={selectedFromAsset?.address || ""}
            amount={ethers.utils
              .parseUnits(swapState.fromAmount, selectedFromAsset?.decimals)
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
            route.map((step: any, index: number) => (
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
            ))
          }
        </div>
      </div>
    </div>
  );
} 