import { Skeleton } from "@/components/ui/skeleton";
import { useOptimisationManagerContext } from "../context";
import { TargetPoolItem } from "./TargetPoolItem";

export function TargetPoolList() {
  const { targetTokens, loading, sourcePosition, handleTargetSelect } = useOptimisationManagerContext();
  
  if (!sourcePosition) return null;

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Alternative Protocols</h3>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className="h-28" key={i} />
          ))
        ) : targetTokens.length > 0 ? (
          targetTokens.map((token, index) => (
            <TargetPoolItem
              key={index}
              token={token}
              sourceApy={sourcePosition.token.apy}
              onSelect={() => handleTargetSelect(token)}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full py-4 text-center">
            No alternative protocols found for this position.
          </p>
        )}
      </div>
    </div>
  );
} 