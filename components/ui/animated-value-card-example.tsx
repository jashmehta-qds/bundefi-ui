"use client";

import {
    BarChart3,
    DollarSign,
    PiggyBank,
    Shield,
    Target,
    TrendingUp,
    Wallet,
    Zap
} from "lucide-react";
import { AllocationItem, AnimatedValueCard, MetricCardData } from "./animated-value-card";

// Example 1: Portfolio/Investment Card
export function PortfolioCard() {
  const primaryMetric: MetricCardData = {
    label: "Active Investments",
    value: 125000,
    icon: TrendingUp,
    color: "text-emerald-500",
    tooltip: "Total value in active investment positions"
  };

  const secondaryMetric: MetricCardData = {
    label: "Available Cash",
    value: 25000,
    icon: DollarSign,
    color: "text-blue-500",
    tooltip: "Cash available for new investments"
  };

  const allocation: AllocationItem[] = [
    { symbol: "STOCKS", allocation: 60, value: 90000 },
    { symbol: "BONDS", allocation: 25, value: 37500 },
    { symbol: "CRYPTO", allocation: 10, value: 15000 },
    { symbol: "CASH", allocation: 5, value: 7500 }
  ];

  return (
    <AnimatedValueCard
      totalValue={150000}
      primaryValue={125000}
      secondaryValue={25000}
      utilizationPercentage={83.3}
      title="Investment Portfolio"
      titleIcon={Wallet}
      titleTooltip="Your complete investment portfolio overview"
      primaryMetric={primaryMetric}
      secondaryMetric={secondaryMetric}
      allocation={allocation}
      actionButton={{
        show: true,
        label: "Invest $25,000 Available Cash",
        onClick: () => {/* Navigate to investment page */},
        pulseInterval: 5000
      }}
    />
  );
}

// Example 2: Savings Goal Card
export function SavingsGoalCard() {
  const primaryMetric: MetricCardData = {
    label: "Saved",
    value: 7500,
    icon: PiggyBank,
    color: "text-green-500"
  };

  const secondaryMetric: MetricCardData = {
    label: "Remaining",
    value: 2500,
    icon: Target,
    color: "text-orange-500",
    tooltip: "Amount still needed to reach your goal"
  };

  return (
    <AnimatedValueCard
      totalValue={10000}
      primaryValue={7500}
      secondaryValue={2500}
      utilizationPercentage={75}
      title="Emergency Fund Goal"
      titleIcon={Shield}
      titleTooltip="Track progress towards your emergency fund target"
      currency="$"
      primaryMetric={primaryMetric}
      secondaryMetric={secondaryMetric}
      progressLabel="Progress"
      progressColors={{
        low: "bg-red-400",
        medium: "bg-yellow-400", 
        high: "bg-green-400"
      }}
      actionButton={{
        show: true,
        label: "Add $2,500 to Complete Goal",
        onClick: () => {/* Add funds to savings */},
        gradient: "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
      }}
      enableFlipCard={false}
    />
  );
}

// Example 3: Business Revenue Card
export function RevenueCard() {
  const primaryMetric: MetricCardData = {
    label: "Monthly Revenue",
    value: 45000,
    icon: BarChart3,
    color: "text-blue-500"
  };

  const secondaryMetric: MetricCardData = {
    label: "Growth Potential",
    value: 15000,
    icon: Zap,
    color: "text-purple-500",
    tooltip: "Estimated additional revenue from optimization"
  };

  const revenueStreams: AllocationItem[] = [
    { symbol: "SUBSCRIPTIONS", allocation: 65, value: 29250 },
    { symbol: "ONE-TIME", allocation: 20, value: 9000 },
    { symbol: "CONSULTING", allocation: 15, value: 6750 }
  ];

  return (
    <AnimatedValueCard
      totalValue={60000}
      primaryValue={45000}
      secondaryValue={15000}
      utilizationPercentage={75}
      title="Monthly Revenue"
      titleIcon={BarChart3}
      titleTooltip="Track your business revenue and growth opportunities"
      primaryMetric={primaryMetric}
      secondaryMetric={secondaryMetric}
      allocation={revenueStreams}
      allocationTitle="Revenue Streams"
      allocationTooltip="Breakdown of revenue by source"
      progressLabel="Target Achievement"
      actionButton={{
        show: true,
        label: "Optimize for +$15K Revenue",
        onClick: () => {/* Open optimization tools */},
        gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",
        pulseInterval: 8000
      }}
      animationDuration={2000}
    />
  );
}

// Example 4: Simple Budget Card (minimal configuration)
export function BudgetCard() {
  const primaryMetric: MetricCardData = {
    label: "Spent",
    value: 2800,
    icon: DollarSign,
    color: "text-red-500"
  };

  return (
    <AnimatedValueCard
      totalValue={3500}
      primaryValue={2800}
      utilizationPercentage={80}
      title="Monthly Budget"
      titleIcon={Wallet}
      primaryMetric={primaryMetric}
      progressLabel="Budget Used"
      enableFlipCard={false}
      cardHeight="h-80"
    />
  );
}

// Example usage in a dashboard
export function ExampleDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <PortfolioCard />
      <SavingsGoalCard />
      <RevenueCard />
      <BudgetCard />
    </div>
  );
} 