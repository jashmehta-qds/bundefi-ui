import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSwapManagerContext } from "./SwapManagerContext";

export function FooterButtons() {
  const {
    stepperState,
    formState,
    swapState,
    selectedFromAsset,
    selectedToAsset,
    availableFromBalance,
    isConnected,
    goToNextStep,
    goToPreviousStep,
    setOpen,
  } = useSwapManagerContext();

  // Validate form
  const isDisabled = 
    formState.isLoading || 
    formState.isSubmitting || 
    (stepperState.currentStep === 0 && (
      !swapState.fromAsset || 
      !swapState.toAsset || 
      !swapState.fromAmount || 
      parseFloat(swapState.fromAmount) <= 0 ||
      !swapState.toAmount ||
      parseFloat(swapState.toAmount) <= 0 ||
      swapState.fromAsset === swapState.toAsset ||
      !isConnected
    )) ||
    (stepperState.currentStep === 1 && !formState.isTokenApproved);

  // Get text for primary button
  const getPrimaryButtonText = () => {
    if (formState.isLoading) {
      return (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      );
    }

    if (formState.isSubmitting) {
      return (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Submitting Transaction...
        </>
      );
    }

    if (stepperState.currentStep === 0) {
      if (!isConnected) return "Connect Wallet to Swap";
      if (!swapState.fromAsset || !swapState.toAsset) return "Select Assets";
      if (!swapState.fromAmount || parseFloat(swapState.fromAmount) <= 0) return "Enter Amount";
      if (swapState.fromAsset === swapState.toAsset) return "Cannot Swap Same Asset";
      return "Preview Swap";
    }

    if (stepperState.currentStep === 1) {
      if (!formState.isTokenApproved) return "Approve Token First";
      return "Confirm Swap";
    }

    return "Close";
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {stepperState.currentStep === 2 ? (
        <Button
          className="w-full"
          onClick={() => setOpen(false)}
        >
          Close
        </Button>
      ) : (
        <>
          {stepperState.currentStep > 0 && (
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={formState.isLoading || formState.isSubmitting}
              className="sm:flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={stepperState.currentStep === 2 ? () => setOpen(false) : goToNextStep}
            disabled={isDisabled}
            className={stepperState.currentStep === 0 ? "w-full" : "flex-1"}
          >
            {getPrimaryButtonText()}
          </Button>
        </>
      )}
    </div>
  );
} 