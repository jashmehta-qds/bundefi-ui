import { Card, CardContent } from "@/components/ui/card";
import { useOptimisationManagerContext } from "../context";

export function SourcePosition() {
  const { sourcePosition } = useOptimisationManagerContext();
  
  if (!sourcePosition) return null;
  
  const normalizedBalance = sourcePosition.balance.amount
    ? parseFloat(sourcePosition.balance.amount) / 10 ** sourcePosition.token.decimals
    : 0;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-2 -mt-4">Current Position</h3>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{sourcePosition.token.name}</p>
              <p className="text-xs text-muted-foreground">{sourcePosition.token.protocolSlug}</p>
              <p className="text-sm">
                {normalizedBalance.toLocaleString()} {sourcePosition.token.symbol}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                ${(normalizedBalance * parseFloat(sourcePosition.balance.price)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-emerald-500">{sourcePosition.token.apy.toFixed(2)}% APY</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 