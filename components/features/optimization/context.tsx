import { createContext, ReactNode, useContext } from "react";
import { OptimisationManagerProps } from "./types";
import { useOptimisationManager } from "./useOptimisationManager";

const OptimisationManagerContext = createContext<ReturnType<typeof useOptimisationManager> | null>(null);

export function OptimisationManagerProvider({ 
  children, 
  position,
  open,
  onOpenChange
}: OptimisationManagerProps & { children: ReactNode }) {
  const optimisationManager = useOptimisationManager({ position, onOpenChange });

  return (
    <OptimisationManagerContext.Provider value={optimisationManager}>
      {children}
    </OptimisationManagerContext.Provider>
  );
}

export function useOptimisationManagerContext() {
  const context = useContext(OptimisationManagerContext);
  if (!context) {
    throw new Error("useOptimisationManagerContext must be used within OptimisationManagerProvider");
  }
  return context;
} 