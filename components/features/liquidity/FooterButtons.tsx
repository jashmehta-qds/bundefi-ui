import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, RefreshCw } from "lucide-react";
import { useLiquidityManagerContext } from "./LiquidityManagerContext";

export function FooterButtons() {
  const {
    stepperState,
    formState,
    transactionState,
    goToNextStep,
    goToPreviousStep,
    handleConfirmTransaction,
    setOpen,
    setStepperState,
    setAssetState,
    setTransactionState,
  } = useLiquidityManagerContext();

  if (stepperState.currentStep === 0) {
    return (
      <Button onClick={goToNextStep} disabled={formState.isLoading} className="w-full">
        {formState.isLoading ? "Processing..." : "Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    );
  } else if (stepperState.currentStep === 1) {
    return (
      <div className="flex justify-between w-full">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={formState.isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleConfirmTransaction}
          disabled={!formState.isTokenApproved || formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            "Processing..."
          ) : (
            <>
              Confirm Transaction <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    );
  } else if (stepperState.currentStep === 2) {
    if (transactionState.txStatus === "success") {
      return (
        <Button
          onClick={() => {
            setOpen(false);
            setStepperState({ currentStep: 0, direction: 0, confirmationData: null });
            setAssetState({ 
              asset: "",
              amount: "",
              assets: [],
              positions: [],
              usdValue: 0,
              percentageUsed: 0
            });
            setTransactionState({ txHash: null, txStatus: null, errorMessage: null });
          }}
          className="w-full"
        >
          <Check className="mr-2 h-4 w-4" />
          Complete
        </Button>
      );
    } else {
      return (
        <div className="flex justify-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => {
              setStepperState({ currentStep: 0, direction: 0, confirmationData: null });
              setTransactionState({ txHash: null, txStatus: null, errorMessage: null });
            }}
          >
            Start Over
          </Button>
          <Button
            onClick={() => {
              setStepperState({ currentStep: 1, direction: 0, confirmationData: null });
              setTransactionState({ txHash: null, txStatus: null, errorMessage: null });
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }
  }
  return null;
} 