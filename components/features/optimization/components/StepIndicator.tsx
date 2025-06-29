import { cn } from "@/lib/utils";
import { useOptimisationManagerContext } from "../context";

export function StepIndicator() {
  const { stepperState, totalSteps } = useOptimisationManagerContext();

  return (
    <div className="flex justify-center mb-6">
      <div className="flex items-center gap-2">
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
    </div>
  );
}
