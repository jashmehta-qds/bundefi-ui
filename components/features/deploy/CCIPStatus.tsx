import { useNetwork } from "@/lib/contexts";
import { AlertCircle, Loader2 } from "lucide-react";
import { CCIPExecutionState } from "./hooks/useCCIPExecution";

interface CCIPStatusProps {
  state: CCIPExecutionState;  
  className?: string;
}

export function CCIPStatus({ state, className }: CCIPStatusProps) {
  const { isLoading, currentStep, stepDescriptions, errorMessage: error, estimatedFee } = state;
  const { selectedNetwork } = useNetwork();

  if (!isLoading && currentStep === 0 && !error) {
    return null; // Don't show component if not started
  }

  const currentStepDescription = stepDescriptions[currentStep] || "Processing...";
  
  // Clip error message to keep it on one line
  const getClippedError = (errorMsg: string) => {
    // First try to clip at the first "("
    const parenIndex = errorMsg.indexOf('(');
    if (parenIndex > 0) {
      return errorMsg.substring(0, parenIndex).trim();
    }
    // Otherwise clip at 100 characters
    return errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg;
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">Cross Chain Execution</span>
        <div className="flex items-center space-x-2">
          {error ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}
          <span className="text-sm text-gray-600 text-pretty truncate">
            {error ? getClippedError(error) : currentStepDescription}
          </span>
        </div>
      </div>
      {estimatedFee && !error && (
        <div className="flex items-center justify-end text-sm text-gray-500">
          Estimated Fee: {estimatedFee.slice(0, 6)} {selectedNetwork?.currencySymbol || 'ETH'}
        </div>
      )}
    </div>
  );
} 