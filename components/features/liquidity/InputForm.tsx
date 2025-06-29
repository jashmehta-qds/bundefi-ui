import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useLiquidityManagerContext } from "./LiquidityManagerContext";

export function InputForm() {
  const {
    action,
    assetState,
    selectedAsset,
    selectedProtocol,
    availableBalance,
    setAssetState,
    handleAmountChange,
    handleSliderChange,
    handleMaxClick,
    existingPosition,
  } = useLiquidityManagerContext();

  useEffect(() => {
    if (existingPosition && action === "remove") {
      setAssetState({ ...assetState, asset: existingPosition.token })
    }
  }, [existingPosition, action])
  

  const isRemove = action === "remove";
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          {isRemove ? "Redeem Liquidity" : "Add Liquidity"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isRemove
            ? "Select a position to redeem and enter the amount"
            : "Select an asset and enter the amount you want to add"}
        </p>
      </div>

      {action === "add" && (
        <div>
          <label htmlFor="asset" className="text-sm font-medium">
            Select Asset
          </label>
          <Select
            value={assetState.asset}
            onValueChange={(value) =>
              setAssetState({ ...assetState, asset: value, amount: "0" })
              
            }
          >
            <SelectTrigger id="asset">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {assetState.assets.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {action === "remove" && (
        <div>
          <label htmlFor="asset" className="text-sm font-medium">
            Selected Position
          </label>
          <Input
            id="positionBalance"
            type="text"
            readOnly
            value={`${existingPosition?.token} on ${existingPosition?.protocol}`}
            disabled
            className="pr-16"
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="amount" className="text-sm font-medium">
            {isRemove ? "Amount to Redeem" : "Amount"}
          </label>
          { (selectedAsset || selectedProtocol) && (
            <div className="text-xs text-muted-foreground">
              Available:{" "}
              {(() => {
                switch (action) {
                  case "add":
                    return selectedAsset?.balance;
                  case "remove":
                    return selectedProtocol?.balance;
                  default:
                    return "";
                }
              })() + ` ${assetState.asset}`}
            </div>
          )}
        </div>
        <div className="relative">
          <Input
            id="amount"
            type="text"
            placeholder={`Enter amount to ${isRemove ? "redeem" : "add"}`}
            value={assetState.amount}
            onChange={handleAmountChange}
            className="pr-16"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {assetState.asset}
          </div>
        </div>
        {selectedAsset && (
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              ≈ ${assetState.usdValue.toFixed(2)} USD
            </div>
          </div>
        )}    {selectedProtocol && (
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              ≈ ${assetState.usdValue.toFixed(2)} USD
            </div>
          </div>
        )}

        {(selectedAsset || selectedProtocol) && availableBalance > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <Slider
                value={[assetState.percentageUsed]}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                className={cn(
                  "flex-1",
                  assetState.percentageUsed > 90 ? "text-red-500" : ""
                )}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMaxClick}
                title={`Set to maximum ${isRemove ? "redeemable" : "available"} amount`}
              >
                MAX
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {assetState.percentageUsed.toFixed(1)}% of available balance
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
