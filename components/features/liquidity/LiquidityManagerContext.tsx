import { createContext, ReactNode, useContext } from "react";
import { LiquidityManagerProps } from "./types";
import { useLiquidityManager } from "./useLiquidityManager";

const LiquidityManagerContext = createContext<ReturnType<typeof useLiquidityManager> | null>(null);

export function LiquidityManagerProvider({ 
  children, 
  existingPosition, 
  action, 
  setOpen 
}: LiquidityManagerProps & { children: ReactNode }) {
  const liquidityManager = useLiquidityManager({ existingPosition, action, setOpen });

  return (
    <LiquidityManagerContext.Provider value={liquidityManager}>
      {children}
    </LiquidityManagerContext.Provider>
  );
}

export function useLiquidityManagerContext() {
  const context = useContext(LiquidityManagerContext);
  if (!context) {
    throw new Error("useLiquidityManagerContext must be used within a LiquidityManagerProvider");
  }
  return context;
} 