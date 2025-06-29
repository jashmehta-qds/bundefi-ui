import { createContext, ReactNode, useContext } from "react";
import { SwapManagerProps } from "./types";
import { useSwapManager } from "./useSwapManager";

const SwapManagerContext = createContext<ReturnType<typeof useSwapManager> | null>(null);

export function SwapManagerProvider({ 
  children, 
  fromTokenAddress,
  setOpen 
}: SwapManagerProps & { children: ReactNode }) {
  const swapManager = useSwapManager({ fromTokenAddress, setOpen });

  return (
    <SwapManagerContext.Provider value={swapManager}>
      {children}
    </SwapManagerContext.Provider>
  );
}

export function useSwapManagerContext() {
  const context = useContext(SwapManagerContext);
  if (!context) {
    throw new Error("useSwapManagerContext must be used within a SwapManagerProvider");
  }
  return context;
} 