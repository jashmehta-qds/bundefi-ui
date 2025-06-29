import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp } from "lucide-react";
import { useSwapManagerContext } from "./SwapManagerContext";

export function InputForm() {
  const {
    swapState,
    selectedFromAsset,
    selectedToAsset,
    availableFromBalance,
    setSwapState,
    handleFromAmountChange,
    handleMaxClick,
    handleSwapAssets,
    handleSlippageChange,
  } = useSwapManagerContext();

  return (
    <div className="">
      <div>
        <h3 className="text-lg font-medium">Swap Assets</h3>
        <p className="text-sm text-muted-foreground">
          Trade one token for another with the best rates
        </p>
      </div>

      {/* From Asset */}
      <div>
        <label htmlFor="fromAsset" className="text-sm font-medium">
          From
        </label>
        <div className="flex gap-2 mt-1.5">
          <Select
            value={swapState.fromAsset}
            onValueChange={(value) => setSwapState({ ...swapState, fromAsset: value })}
          >
            <SelectTrigger id="fromAsset" className="w-1/3">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {swapState.assets.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative flex-1">
            <Input
              id="fromAmount"
              type="text"
              placeholder="0.00"
              value={swapState.fromAmount}
              onChange={handleFromAmountChange}
              className="pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {swapState.fromAsset}
            </div>
          </div>
        </div>
        { (
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-muted-foreground">
              ≈ ${swapState.fromUsdValue.toFixed(2)} USD
            </div>
            <div className="text-xs text-muted-foreground">
             {selectedFromAsset && `Available: ${selectedFromAsset.balance}`}
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs ml-1 text-primary"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Swap Direction Button */}
      <div className="flex justify-center -my-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleSwapAssets}
        >
          <ArrowDownUp className="h-4 w-4" />
        </Button>
      </div>

      {/* To Asset */}
      <div className="">
        <label htmlFor="toAsset" className="text-sm font-medium">
          To
        </label>
        <div className="flex gap-2 mt-1.5">
          <Select
            value={swapState.toAsset}
            onValueChange={(value) => setSwapState({ ...swapState, toAsset: value })}
          >
            <SelectTrigger id="toAsset" className="w-1/3">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {swapState.assets.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative flex-1">
            <Input
              id="toAmount"
              type="text"
              placeholder="0.00"
              value={swapState.toAmount}
              readOnly
              className="pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {swapState.toAsset}
            </div>
          </div>
        </div>
        {(
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-muted-foreground">
              ≈ ${swapState.toUsdValue.toFixed(2)} USD
            </div>
          </div>
        )}
      </div>

      {/* Slippage Settings */}
      <div className="mt-2 space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="slippage" className="text-sm font-medium">
            Slippage Tolerance
          </label>
          <span className="text-sm font-medium">{swapState.slippage}%</span>
        </div>
        
        <div className="flex gap-2">
          {[0.1, 1.0, 3.0].map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="outline"
              className={cn("flex-1", 
                swapState.slippage === value ? 
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : 
                ""
              )}
              onClick={() => handleSlippageChange(value)}
            >
              {value}%
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn("flex-1", 
              ![0.1, 1.0, 3.0].includes(swapState.slippage) ? 
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : 
              ""
            )}
            onClick={() => {
              // If not already in custom mode, set to a default custom value (e.g., 0.5%)
              if ([0.1, 1.0, 3.0].includes(swapState.slippage)) {
                handleSlippageChange(0.5);
              }
            }}
          >
            Custom
          </Button>
        </div>
        
        {/* Custom Slider - with animations */}
        <AnimatePresence>
          {![0.1, 1.0, 3.0].includes(swapState.slippage) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden pt-2"
            >
              <div className="relative">
                <Input
                  id="customSlippage"
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={swapState.slippage}
                  onChange={(e) => handleSlippageChange(parseFloat(e.target.value) || 0.1)}
                  className="pr-8"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Min: 0.1%</span>
                <span>Max: 5%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 