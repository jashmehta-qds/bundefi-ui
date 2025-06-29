"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRightLeft } from "lucide-react"
import { MigrationPreview } from "./components/MigrationPreview"
import { SourcePosition } from "./components/SourcePosition"
import { StepIndicator } from "./components/StepIndicator"
import { TargetPoolList } from "./components/TargetPoolList"
import { OptimisationManagerProvider, useOptimisationManagerContext } from "./context"
import { OptimisationManagerProps } from "./types"

function OptimisationManagerContent() {
  const { stepperState } = useOptimisationManagerContext();
  
  return (
    <>
      <StepIndicator />
      
      <div className="space-y-3 py-2">
        {stepperState.currentStep === 0 ? (
          <>
            <SourcePosition />
            <TargetPoolList />
          </>
        ) : (
          <MigrationPreview />
        )}
      </div>
    </>
  );
}

export function OptimisationManager({ position, open, onOpenChange }: OptimisationManagerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl h-[624px] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            {position ? `Optimize ${position.token} Position` : 'Optimize Position'}
          </DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>
        <OptimisationManagerProvider position={position} open={open} onOpenChange={onOpenChange}>
          <OptimisationManagerContent />
        </OptimisationManagerProvider>
      </DialogContent>
    </Dialog>
  );
} 