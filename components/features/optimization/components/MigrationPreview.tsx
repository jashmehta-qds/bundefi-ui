import { TokenApprovalFlow } from "@/components/shared/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWallets } from "@privy-io/react-auth";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useOptimisationManagerContext } from "../context";

type ExpandedSection = 'apy' | 'transaction' | null;

export function MigrationPreview() {
  const { 
    stepperState, 
    sourcePosition,
    normalizeValue,
    handleConfirmMigration,
    sendTxLoading,
    goToPreviousStep
  } = useOptimisationManagerContext();
  
  const { wallets } = useWallets();
  const connectedWallet = wallets[0];
  const address = connectedWallet?.address;
  const [isTokenApproved, setIsTokenApproved] = useState(!stepperState.approvalNeeded);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  
  if (!sourcePosition || !stepperState.selectedTarget) return null;
  
  const sourceToken = sourcePosition.token;
  const targetToken = stepperState.selectedTarget;
  const bothApyExist = sourceToken?.apy && targetToken?.apy;
  const sourceApy = sourceToken?.apy || 0;
  const targetApy = targetToken?.apy || 0;
  const apyDifference = targetToken?.apy ? (targetToken.apy - sourceApy).toFixed(1) : "0.0";
  const isApyImprovement = Number(apyDifference) > 0;

  const toggleSection = (section: ExpandedSection) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <>
    <div className="flex flex-col gap-6 items-start w-full relative">
      {/* Position comparison cards - Condensed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <Card className="border border-border/60 shadow-sm">
          <div className="p-3 flex justify-between items-center">
            <div className="flex flex-col">
         
                <h4 className="text-sm font-medium">{sourceToken?.name}</h4>
               
         
              <div className="text-xs text-muted-foreground">{sourceToken?.symbol}</div>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-lg font-bold">{sourceToken?.apy?.toFixed(2)}%</span>
              <span className="text-xs text-muted-foreground ml-1">APY</span>
            </div>
          </div>
        </Card>
        
        <Card className="border border-border/60 shadow-sm">
          <div className="p-3 flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-medium">{targetToken?.name}</h4>
              </div>
              <div className="text-xs text-muted-foreground">{targetToken?.symbol}</div>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-lg font-bold">{targetToken?.apy?.toFixed(2)}%</span>
              <span className="text-xs text-muted-foreground ml-1">APY</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* APY comparison - Collapsible */}
      {bothApyExist && (
        <Card className="w-full border border-border/60 shadow-sm">
          <div 
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => toggleSection('apy')}
          >
            <h4 className="text-sm font-bold text-muted-foreground">APY Comparison</h4>
            
            {/* Condensed summary when collapsed */}
            {expandedSection !== 'apy' && (
              <div className="flex items-center gap-2 flex-1 justify-end mr-2">
                <div className={`flex items-center gap-1 ${isApyImprovement ? "text-green-600" : "text-red-600"}`}>
                  <span className="text-sm font-semibold">{isApyImprovement ? "+" : ""}{apyDifference}%</span>
                  {isApyImprovement ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              {expandedSection === 'apy' ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </div>
          
          <div 
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden", 
              expandedSection === 'apy' ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <CardContent className="p-5 pt-0">
              <div className="flex items-center w-full relative mt-2 mb-4">
                <div className="flex flex-col items-center">
                  <div className="text-xl font-semibold">{sourceApy.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Current</div>
                </div>
                
                <div className="flex-1 flex justify-center items-center px-4">
                  <div className="h-0.5 bg-border w-full relative">
                    <ArrowRight className="absolute top-1/2 -translate-y-1/2 right-0 text-border h-5 w-5" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-xl font-semibold">{targetApy.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Target</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium">Improvement</span>
                  <span className="text-xs text-muted-foreground">annual yield</span>
                </div>
                
                <div className={`flex items-center gap-2 ${isApyImprovement ? "text-green-600" : "text-red-600"}`}>
                  <span className="text-xl font-bold">{isApyImprovement ? "+" : ""}{apyDifference}%</span>
                  {isApyImprovement ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
      
      {/* Transaction details - Collapsible */}
      <Card className="w-full border border-border/60 shadow-sm">
        <div 
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => toggleSection('transaction')}
        >
          <h4 className="text-sm font-bold text-muted-foreground">Transaction Details</h4>
          
          {/* Condensed summary when collapsed */}
          {expandedSection !== 'transaction' && stepperState.routeData && !stepperState.loadingRoute && (
            <div className="flex items-center gap-4 flex-1 justify-end mr-2">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Receive</span>
                <span className="text-sm font-medium">
                  {stepperState.routeData?.amountOut && targetToken
                    ? normalizeValue(stepperState.routeData.amountOut, targetToken.decimals).toFixed(4)
                    : "0"}{" "}
                  {targetToken?.symbol}
                </span>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Impact</span>
                <span className="text-sm font-medium">
                  -{stepperState.routeData?.priceImpact ? (Number(stepperState.routeData.priceImpact) / 100).toFixed(2) : "0.00"}%
                </span>
              </div>
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            {expandedSection === 'transaction' ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </div>
        
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden", 
            expandedSection === 'transaction' ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <CardContent className="p-5 pt-0">
            {stepperState.loadingRoute ? (
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <div className="text-sm font-medium">You will receive</div>
                  <div className="text-sm font-semibold">
                    {stepperState.routeData?.amountOut && targetToken
                      ? normalizeValue(stepperState.routeData.amountOut, targetToken.decimals)
                      : "0"}{" "}
                    {targetToken?.symbol}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <div className="text-sm font-medium">Price impact</div>
                  <div className="text-sm font-semibold">
                    -{stepperState.routeData?.priceImpact ? (Number(stepperState.routeData.priceImpact) / 100).toFixed(2) : "0.00"}%
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
      
      {/* Sticky footer with approval flow and action buttons */}
     
    </div>
     <div className="relative bg-background shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border border-black border-border/60 p-4 z-10 w-full rounded-lg">
     <div className="space-y-4">
       {/* Approval flow */}
       {stepperState.approvalNeeded && (
         <div className="w-full">
           <TokenApprovalFlow
             chainId={Number(connectedWallet.chainId.split(":")[1]) || 1}
             fromAddress={address}
             tokenAddress={sourceToken.address}
             amount={sourcePosition.balance.amount}
             onApprovalComplete={() => setIsTokenApproved(true)}
             onApprovalError={(error) => {
               console.error("Approval error:", error);
               setIsTokenApproved(false);
             }}
             isApproved={isTokenApproved}
             setIsApproved={setIsTokenApproved}
           />
         </div>
       )}
       
       {/* Action buttons */}
       <div className="flex justify-between w-full flex-col sm:flex-row gap-3">
         <Button 
           variant="outline" 
           onClick={goToPreviousStep}
           className="group"
           size="lg"
         >
           <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
           Back
         </Button>

         <Button
           variant="default"
           onClick={handleConfirmMigration}
           disabled={(!isTokenApproved && stepperState.approvalNeeded) || !stepperState.routeData?.tx || sendTxLoading}
           size="lg"
           className="group"
         >
           {sendTxLoading ? (
             <>Confirming...</>
           ) : (
             <>
               Confirm Migration
               <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </>
           )}
         </Button>
       </div>
     </div>
   </div>
   </>
  );
} 