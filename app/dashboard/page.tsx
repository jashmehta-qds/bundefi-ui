"use client";

import { LiquidityManager } from "@/components/features/liquidity";
import { LiquidityAction } from "@/components/features/liquidity/types";
import { SwapManager } from "@/components/features/swap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { PoolPosition, useBalances } from "@/lib/contexts";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

import { CurrentApyCard, TotalValueCard } from "@/components/features/dashboard";
import { OptimisationManager } from "@/components/features/optimization";
import { GridSparks } from "@/components/shared/animations";
import YieldPositionsCard from "./YieldPositionCard";

export default function Portfolio() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const isConnected = authenticated && wallets.length > 0;
  const { toast } = useToast();
  const { isLoading, positions } =
    useBalances();
  const [selectedPosition, setSelectedPosition] = useState<PoolPosition | null>(
    null
  );
  const [isLiquidityDialogOpen, setIsLiquidityDialogOpen] = useState(false);
  const [action, setAction] = useState<LiquidityAction>("add");
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | undefined
  >(undefined);
  const [isApyComparisonDialogOpen, setIsApyComparisonDialogOpen] =
    useState(false);

  // Clear dashboard state when user is not connected
  useEffect(() => {
    if (!isConnected) {
      setSelectedPosition(null);
      setIsLiquidityDialogOpen(false);
      setIsSwapDialogOpen(false);
      setSelectedTokenAddress(undefined);
      setIsApyComparisonDialogOpen(false);
    }
  }, [isConnected]);



  const handleLiquidity = (
    position: PoolPosition,
    _action: LiquidityAction
  ) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to add liquidity",
        variant: "destructive",
      });
      return;
    }
    setAction(_action);
    setSelectedPosition(position);
    setIsLiquidityDialogOpen(true);
  };

  const handleOptimize = (position: PoolPosition) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to optimize your position",
        variant: "destructive",
      });
      return;
    }
    setSelectedPosition(position);
    setIsApyComparisonDialogOpen(true);
  };


  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/40 relative">
        {/* Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Horizontal Lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
          
          {/* GridSparks Component */}
          <GridSparks 
            gridSize={40}
            sparkCount={2}
            sparkSpeed={3}
            sparkLifetime={1500}
          />
        </div>

        <div className="container py-6 md:py-8 relative z-10">
          <div className="grid gap-6 md:grid-cols-2">
   
            <TotalValueCard />
            <CurrentApyCard />
          
          </div>
          <div className="my-6">
            <YieldPositionsCard
              positions={isLoading ? [] : positions}
              isLoading={isLoading}
              handleLiquidity={handleLiquidity}
              handleOptimize={handleOptimize}
            />
          </div>

          {/* <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Asset Overview</CardTitle>
                <CardDescription>
                  Your current holdings and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="py-6 text-center text-destructive">
                    <p>{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => refreshBalances()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : balances.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    <p>
                      No assets found. Connect your wallet to view your
                      balances.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-4">Asset</th>

                          <th className="text-right pb-4">Balance</th>
                          <th className="text-right pb-4">Value (USD)</th>
                          <th className="text-right pb-4">Allocation</th>
                          <th className="text-right pb-4">24h %</th>
                          <th className="text-right pb-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBalances.map((asset, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-4">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                  {asset.logoUrl ? (
                                    <img
                                      src={asset.logoUrl}
                                      alt={asset.symbol}
                                      className="h-6 w-6 rounded-full"
                                    />
                                  ) : (
                                    <Coins className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {asset.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {asset.symbol}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-4">
                              <div className="font-medium">{asset.balance}</div>
                            </td>
                            <td className="text-right py-4">
                              <div className="font-medium">
                                ${asset.value.toLocaleString()}
                              </div>
                            </td>
                            <td className="text-right py-4">
                              <div className="font-medium">
                                {asset.allocation.toFixed(2)}%
                              </div>
                            </td>
                            <td className="text-right py-4">
                              <div
                                className={`font-medium ${
                                  !asset.isOtherRow &&
                                  (asset.change24h >= 0
                                    ? "text-emerald-500"
                                    : "text-red-500")
                                }`}
                              >
                                {!asset.isOtherRow ? (
                                  <>
                                    {asset.change24h >= 0 ? "+" : ""}
                                    {asset.change24h.toFixed(2)}%
                                  </>
                                ) : (
                                  "-"
                                )}
                              </div>
                            </td>
                            <td className="text-right py-4">
                              {!asset.isOtherRow && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleAssetSwap(asset.address)
                                    }
                                  >
                                    Swap
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSwap}
                                  >
                                    Deposit
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div> */}

        </div>
      </main>

      {/* Add the OptimisationManager */}
      {selectedPosition && (
        <OptimisationManager
          position={selectedPosition}
          open={isApyComparisonDialogOpen}
          onOpenChange={setIsApyComparisonDialogOpen}
        />
      )}

      {/* Add Liquidity Dialog */}
      <Dialog
        open={isLiquidityDialogOpen}
        onOpenChange={setIsLiquidityDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          {selectedPosition && (
            <LiquidityManager
              existingPosition={selectedPosition}
              setOpen={setIsLiquidityDialogOpen}
              action={action}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Swap Dialog */}
      <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <SwapManager
            fromTokenAddress={selectedTokenAddress}
            setOpen={setIsSwapDialogOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}




