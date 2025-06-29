import {
  AssetSelectionStep,
  DeploymentCompleteStep,
  DeploymentFlowProvider,
  DeploymentSummaryStep,
  DeployProvider,
  ProtocolSelectionStep,
  TransactionConfirmationStep,
  useDeployManager,
} from "@/components/features/deploy";
import { useWallets } from "@privy-io/react-auth";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function EasyDeploymentContent() {
  const { wallets } = useWallets();
  const connectedWallet = wallets[0];
  const router = useRouter();

  const { state, availableAssets } = useDeployManager();

  useEffect(() => {}, [state.step]);

  return (
    <div className="relative min-h-[480px] flex flex-col space-y-6">
      <AnimatePresence mode="wait">
        {state.step === "select-asset" && (
          <AssetSelectionStep key="select-asset" availableAssets={availableAssets} />
        )}

        {state.step === "select-protocol" && (
          <ProtocolSelectionStep
            key="select-protocol"
            protocols={state.protocols.map(protocol => ({
              ...protocol,
              priceUsd: 0,
            }))}
            isLoading={state.isLoading}
          />
        )}

        {state.step === "confirm" && (
          <DeploymentSummaryStep key="confirm" isDeploying={state.isDeploying} />
        )}

        {state.step === "transaction-confirmation" && (
          <TransactionConfirmationStep key="transaction-confirmation" />
        )}

        {state.step === "complete" && (
          <DeploymentCompleteStep key="complete" onRedirect={() => router.push("/dashboard")} />
        )}
      </AnimatePresence>
    </div>
  );
}

export function EasyDeployment() {
  return (
    <DeployProvider>
      <DeploymentFlowProvider>
        <EasyDeploymentContent />
      </DeploymentFlowProvider>
    </DeployProvider>
  );
}
