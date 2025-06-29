import { useBalances } from "../contexts";

export function usePortfolioMetrics() {
  const { positions, totalValue, isLoading } = useBalances();

  // Calculate position value (assets earning yield)
  const positionValue = positions.reduce((sum, pos) => sum + pos.usdValue, 0);

  // Calculate weighted average APY
  const calculateWeightedAverageAPY = () => {
    if (!positions.length) return 0;

    const totalValue = positions.reduce((sum, pos) => sum + pos.usdValue, 0);
    if (totalValue === 0) return 0;

    const weightedSum = positions.reduce((sum, pos) => {
      return sum + pos.usdValue * pos.netSupplyApy;
    }, 0);

    return weightedSum / totalValue;
  };

  const apy = calculateWeightedAverageAPY();

  // Calculate utilization metrics
  const utilizationPercentage =
    totalValue > 0 ? (positionValue / (positionValue + totalValue)) * 100 : 0;
  const underutilizedAmount = totalValue;

  // Calculate potential daily earnings from underutilized funds
  const potentialDailyEarnings = (underutilizedAmount * (apy / 100)) / 365;

  return {
    positionValue,
    apy,
    utilizationPercentage,
    underutilizedAmount,
    potentialDailyEarnings,
    isLoading,
  };
}
