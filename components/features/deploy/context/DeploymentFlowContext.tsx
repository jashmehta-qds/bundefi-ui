import { createContext, ReactNode, useContext } from 'react';
import { useDeploymentFlow } from '../hooks/useDeploymentFlow';
import { RouteData } from '../types';

interface DeploymentFlowContextType {
  // State
  amount: string;
  percentage: number;
  isTokenApproved: boolean;
  routeData: RouteData | null;
  isLoadingRoute: boolean;
  isConfirmingTransaction: boolean;
  txStatus: null | "success" | "error";
  txHash: string | null;
  errorMessage: string | null;
  redirectCountdown: number;
  validationError: string | null;
  
  // Actions
  handleAmountChange: (value: string) => void;
  handlePercentageChange: (value: number[]) => void;
  handleDeployClick: () => Promise<void>;
  handleConfirmTransaction: () => Promise<void>;
  setIsTokenApproved: (approved: boolean) => void;
}


const DeploymentFlowContext = createContext<DeploymentFlowContextType | null>(null);

export function DeploymentFlowProvider({
  children,
}: {
  children: ReactNode;
}) {
  const deploymentFlow = useDeploymentFlow();

  return (
    <DeploymentFlowContext.Provider value={deploymentFlow}>
      {children}
    </DeploymentFlowContext.Provider>
  );
}

export function useDeploymentFlowContext() {
  const context = useContext(DeploymentFlowContext);
  if (!context) {
    throw new Error('useDeploymentFlowContext must be used within a DeploymentFlowProvider');
  }
  return context;
}

export { DeploymentFlowContext };
