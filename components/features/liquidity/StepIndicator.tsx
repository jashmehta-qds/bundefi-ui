import { cn } from "@/lib/utils";
import { useLiquidityManagerContext } from "./LiquidityManagerContext";

export function StepIndicator() {
  const { action, setOpen, totalSteps, stepperState } = useLiquidityManagerContext();

  return (
    <div className="flex items-center justify-center mb-4 gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === stepperState.currentStep
              ? "bg-primary w-8"
              : index < stepperState.currentStep
                ? "bg-primary/50 w-4"
                : "bg-muted w-4"
          )}
        />
      ))}
    </div>
  );
} 