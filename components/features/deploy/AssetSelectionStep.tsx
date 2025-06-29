import { AssetSelector } from "@/app/deploy/asset-selector";
import { Button } from "@/components/ui/button";
import { AssetBalance } from "@/lib/contexts";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useDeployManager } from "./hooks/useDeployManager";

interface AssetSelectionStepProps {
  availableAssets: AssetBalance[];
}

export function AssetSelectionStep({
  availableAssets,
}: AssetSelectionStepProps) {
  const { state, handleAssetSelect, handleNext } = useDeployManager();

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
        <div className="space-y-2">
        <h3 className="text-lg font-medium">
        Select an asset from your wallet
        </h3>
          <AssetSelector
            assets={availableAssets}
            value={state.selectedAsset}
            onChange={handleAssetSelect}
            placeholder="Choose an asset"
            maxHeight={300}
          />
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="border-t bg-white pt-4 flex-shrink-0">
        <Button
          onClick={handleNext}
          disabled={!state.selectedAsset}
          className="w-full bg-yellow-500 hover:bg-yellow-600"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
} 