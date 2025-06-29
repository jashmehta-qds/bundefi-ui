import { Card, CardContent } from "@/components/ui/card";
import { formatWithSuffix } from "@/lib/utils";
import { ArrowUpFromDot, TrendingDown, TrendingUp } from "lucide-react";
import { useOptimisationManagerContext } from "../context";
import { TokenData } from "../types";

interface TargetPoolItemProps {
  token: TokenData;
  sourceApy: number;
  onSelect: () => void;
}

export function TargetPoolItem({ token, sourceApy, onSelect }: TargetPoolItemProps) {
  const apyDiff = token.apy - sourceApy;
  const isPositive = apyDiff > 0;
  const { stepperState } = useOptimisationManagerContext();
  return (
    <Card 
      className="cursor-pointer hover:shadow-md relative overflow-hidden group"
      onClick={onSelect}
      
    >
      {isPositive && stepperState.loadingRoute && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-50 transition-opacity duration-300">
          {[...Array(45)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              <ArrowUpFromDot className="h-4 w-4 text-green-500" />
            </div>
          ))}
        </div>
      )}
      <CardContent className="p-2">
        <div className="flex flex-wrap justify-between items-start">
          <div className="flex-1 min-w-[60%] sm:min-w-0">
            <p className="font-medium text-sm md:text-md">{token.name}</p>
           
            {token.tvl > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                TVL: {formatWithSuffix(token.tvl)}
              </p>
            )}
          </div>

          {token.apy > 0 && (
            <div className="text-right">
              <p className="font-medium text-md md:text-lg">
                {token.apy.toFixed(2)}% 
              </p>
              <div className="flex justify-end gap-1 text-xs md:text-sm">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {sourceApy > 0 && token.apy > 0 && (
                  <p className={isPositive ? "text-green-600" : "text-red-600"}>
                    {isPositive ? "+" : ""}
                    {apyDiff.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 