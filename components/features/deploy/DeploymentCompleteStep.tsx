import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactConfetti from "react-confetti";
import { CircularCountdown } from "./CircularCountdown";
import { useDeployManager } from "./hooks/useDeployManager";
import { useDeploymentFlow } from "./hooks/useDeploymentFlow";

interface DeploymentCompleteStepProps {
  onRedirect: () => void;
}

export function DeploymentCompleteStep({
  onRedirect,
}: DeploymentCompleteStepProps) {
  const confirmationDivRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiSize, setConfettiSize] = useState({ width: 0, height: 0 });
  const [localRedirectCountdown, setLocalRedirectCountdown] = useState(60);

  const {
    txStatus: deploymentTxStatus,
    txHash: deploymentTxHash,
    errorMessage: deploymentErrorMessage,
  } = useDeploymentFlow();

  const { state, ccipExecution } = useDeployManager();

  const txStatus = useMemo(
    () => {
      // For CCIP transactions, prioritize CCIP execution state
      if (state.isCCIPEnabled) {
        return ccipExecution.state.txStatus;
      }
      // For regular transactions, use deployment status
      return deploymentTxStatus;
    },
    [state.isCCIPEnabled, ccipExecution.state.txStatus, deploymentTxStatus]
  );

  const txHash = useMemo(
    () => {
      if (state.isCCIPEnabled) {
        return ccipExecution.state.txHash;
      }
      return deploymentTxHash;
    },
    [state.isCCIPEnabled, ccipExecution.state.txHash, deploymentTxHash]
  );

  const errorMessage = useMemo(
    () => {
      if (state.isCCIPEnabled) {
        return ccipExecution.state.errorMessage;
      }
      return deploymentErrorMessage;
    },
    [state.isCCIPEnabled, ccipExecution.state.errorMessage, deploymentErrorMessage]
  );



  useEffect(() => {
    if (txStatus === "success" && confirmationDivRef.current) {
      const { width, height } = confirmationDivRef.current.getBoundingClientRect();
      setConfettiSize({ width, height });
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [txStatus]);

  useEffect(() => {
    if (localRedirectCountdown > 0) {
      const timer = setTimeout(() => setLocalRedirectCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (localRedirectCountdown === 0) {
      onRedirect();
    }
  }, [localRedirectCountdown, onRedirect]);

  return (
    <div
      ref={confirmationDivRef}
      className="flex flex-col items-center justify-center min-h-[300px] py-8 relative"
    >
      {showConfetti && (
        <ReactConfetti
          width={confettiSize.width}
          height={confettiSize.height}
          recycle={false}
          numberOfPieces={900}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        />
      )}
      {txStatus === "success" && (
        <>
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Transaction Successful!</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-center">
            Your transaction has been completed successfully.
          </p>
          {txHash && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(`https://basescan.org/tx/${txHash}`, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              View on Basescan
            </Button>
          )}
        </>
      )}
      {txStatus === "error" && (
        <>
          <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Transaction Failed</h2>
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 max-w-md">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </>
      )}
      {txStatus === null && (
        <>
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-spin">
            <Loader2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Processing Transaction</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-center">
            Your transaction is being processed. This may take a few moments.
          </p>
          {txHash && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(`https://basescan.org/tx/${txHash}`, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              View on Basescan
            </Button>
          )}
        </>
      )}
      <div className="flex flex-col items-center mt-6">
        <CircularCountdown seconds={localRedirectCountdown} total={20} />
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting to home in {localRedirectCountdown} seconds...
        </p>
        <Button
          className="mt-2"
          onClick={onRedirect}
          variant="secondary"
        >
          Go to Home Now
        </Button>
      </div>
    </div>
  );
} 