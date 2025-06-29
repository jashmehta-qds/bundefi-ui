"use client";

import { AnimatedValueCard, MetricCardData } from "@/components/ui/animated-value-card";
import { useBalances } from "@/lib/contexts";
import { usePortfolioMetrics } from "@/lib/hooks/UsePortfolioMetrics";
import { ArrowUpCircle, PlusCircle, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

export function TotalValueCard() {
  const { totalValue, isLoading, positions, balances = [] } = useBalances();
  const { 
    positionValue, 
    utilizationPercentage, 
    underutilizedAmount, 
  } = usePortfolioMetrics();
  const router = useRouter();

  // Configure the primary metric (Yield Bearing Positions)
  const primaryMetric: MetricCardData = {
    label: "Yield Bearing Positions",
    value: positionValue,
    icon: ArrowUpCircle,
    color: "text-emerald-500",
    tooltip: "Total value in active yield-generating positions"
  };

  // Configure the secondary metric (Underutilized funds)
  const secondaryMetric: MetricCardData = {
    label: "Underutilized",
    value: underutilizedAmount,
    icon: PlusCircle,
    color: "text-yellow-500",
    tooltip: "Click to deploy these funds and start earning yield"
  };

  // Convert balances to allocation format
  const allocation = balances.map(balance => ({
    symbol: balance.symbol,
    allocation: balance.allocation,
    value: balance.value
  }));

  // Configure action button for underutilized funds
  const actionButton = underutilizedAmount > 0 ? {
    show: true,
    label: `Deploy $${underutilizedAmount.toLocaleString()} Idle Funds`,
    onClick: () => router.push('/deploy'),
    gradient: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600",
    pulseInterval: 5000
  } : undefined;

  return (
    <AnimatedValueCard
      totalValue={totalValue + positionValue}
      primaryValue={positionValue}
      secondaryValue={underutilizedAmount}
      utilizationPercentage={utilizationPercentage}
      title="Portfolio"
      titleIcon={Wallet}
      titleTooltip="Portfolio utilization shows how much of your total assets are deployed in yield-generating positions."
      currency="$"
      primaryMetric={primaryMetric}
      secondaryMetric={secondaryMetric}
      progressLabel="Utilization"
      progressColors={{
        low: "bg-red-500",
        medium: "bg-yellow-500",
        high: "bg-emerald-500"
      }}
      actionButton={actionButton}
      allocation={allocation}
      allocationTitle="Asset Allocation"
      allocationTooltip="Asset allocation shows the distribution of your portfolio across different assets."
      isLoading={isLoading}
      animationDuration={1500}
      enableFlipCard={true}
      className=""
      cardHeight="h-full"
    />
  );
} 