"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBalances } from "@/lib/contexts";
import { usePortfolioMetrics } from "@/lib/hooks/UsePortfolioMetrics";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BanknoteIcon,
  BarChart3,
  Layers,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Optimized number counter animation hook to prevent flickering
const useCountUp = (end: number, duration = 1500, decimals = 0) => {
  const [count, setCount] = useState(0);

  // Use a ref to track the previous end value to avoid unnecessary animations
  const prevEndRef = useRef(end);
  // Use a ref to track the animation frame for proper cleanup
  const animationFrameRef = useRef<number>(0);
  // Use a ref to track if animation is in progress
  const isAnimatingRef = useRef(false);
  // Use a ref to track if this is the first render
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // Skip animation if the end value is the same as before and it's not the first render
    if (prevEndRef.current === end && !isFirstRenderRef.current) return;

    // Update the previous end value
    prevEndRef.current = end;
    isFirstRenderRef.current = false;

    // If end is 0, just set count to 0 without animation
    if (end === 0) {
      setCount(0);
      isAnimatingRef.current = false;
      return;
    }

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Start a new animation
    let startTime: number;
    const startValue = 0; // Always start from 0
    isAnimatingRef.current = true;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smoother animation
      const easedProgress =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      // Calculate the new count value
      const newCount = startValue + easedProgress * (end - startValue);

      // Format the count based on decimals
      const formattedCount =
        decimals > 0
          ? Number.parseFloat(newCount.toFixed(decimals))
          : Math.floor(newCount);

      setCount(formattedCount);

      // Continue the animation if not complete
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        isAnimatingRef.current = false;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [end, duration, decimals]);

  return count;
};

export function CurrentApyCard() {
  const { positions, isLoading } = useBalances();
  const [isVisible, setIsVisible] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState<number>(0);
  const [showPotentialTooltip, setShowPotentialTooltip] = useState(false);

  // Calculate metrics
  const totalPositions = positions.length;
  const uniqueProtocols = new Set(positions.map((pos) => pos.protocol)).size;
  const { underutilizedAmount, potentialDailyEarnings } = usePortfolioMetrics();

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

  // Animated counter values

  const animatedEarnings = useCountUp(isLoading ? 0 : dailyEarnings, 1500, 3);
  const animatedPotential = useCountUp(
    isLoading ? 0 : potentialDailyEarnings + dailyEarnings,
    1500,
    3
  );

  // Calculate daily earnings
  useEffect(() => {
    if (!isLoading && positions.length > 0) {
      // Calculate total value
      const totalValue = positions.reduce((sum, pos) => sum + pos.usdValue, 0);

      // Calculate daily earnings as (Total Value * APY) / 365
      const dailyAmount = (totalValue * (apy / 100)) / 365;
      setDailyEarnings(dailyAmount);
    }
  }, [positions, isLoading, apy]);

  // Set visibility for animations
  useEffect(() => {
    if (!isLoading) {
      setIsVisible(true);
    }
  }, [isLoading]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -30 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: (i: number) => ({
      width: `${i}%`,
      transition: {
        duration: 1.5,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.5,
      },
    }),
  };

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={cardVariants as Variants}
      className="relative"
    >
      <Card className="h-[360px] overflow-hidden shadow-md ">
        <motion.div
          className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        />
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-primary/10 p-1.5 rounded-full"
              >
                <BanknoteIcon className="h-5 w-5 text-primary" />
              </motion.div>
              <CardTitle className="text-sm font-medium">
                Yield Bearing Positions
              </CardTitle>
            </div>

            {!isLoading && positions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-full font-medium"
              >
                Active
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-3 gap-4"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Active Strategies */}
              <motion.div
                className="flex flex-col items-center justify-start h-full"
                variants={itemVariants}
              >
                <motion.div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 "
                  variants={iconVariants as Variants}
                >
                  <Layers className="h-7 w-7 text-primary-500 dark:text-primary-400" />
                </motion.div>
                <div className="text-3xl font-bold text-center">
                  {totalPositions}
                </div>
                <div className="text-sm text-muted-foreground text-center mt-1">
                  {uniqueProtocols === 0
                    ? "No active protocols"
                    : `Active Yield Positions`}
                </div>
              </motion.div>

              {/* Current APY */}
              <motion.div
                className="flex flex-col items-center justify-start h-full"
                variants={itemVariants}
              >
                <motion.div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 "
                  variants={iconVariants as Variants}
                >
                  <BarChart3 className="h-7 w-7 text-primary-500 dark:text-primary-500" />
                </motion.div>
                <div className="text-3xl font-bold text-center text-primary-700 dark:text-primary-500">
                  {apy.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-background text-center mt-1">
                  Current APY
                </div>
              </motion.div>

              {/* Daily Earnings */}
              <motion.div
                className="flex flex-col items-center justify-start h-full"
                variants={itemVariants}
              >
                <motion.div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100"
                  variants={iconVariants as Variants}
                  animate={{
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  <Activity className="h-7 w-7 text-primary-500 dark:text-primary-400" />
                </motion.div>
                <div className="text-3xl font-bold text-center ">
                  ${animatedEarnings.toFixed(3)}
                </div>
                <div className="text-sm text-muted-foreground text-center mt-1">
                  Today's Earnings
                </div>

                {/* Potential Earnings Indicator */}
                {underutilizedAmount > 0 && (
                  <motion.div
                    className="mt-3 relative w-full justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div
                      className="flex justify-center items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-100  text-amber-700 rounded-full cursor-pointer"
                      onMouseEnter={() => setShowPotentialTooltip(true)}
                      onMouseLeave={() => setShowPotentialTooltip(false)}
                    >
                      <span className="flex items-center gap-1">
                        Potential: <TrendingUp className="h-3.5 w-3.5" />
                        {((animatedPotential ) / animatedEarnings).toFixed(
                          0
                        )}
                        X
                      </span>
                    </div>

                    <AnimatePresence>
                      {showPotentialTooltip && (
                        <motion.div
                          className="relative bottom-full mb-2 p-2 bg-white  shadow-lg rounded-md text-xs w-48 z-100 border border-gray-200 dark:border-gray-700"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                        >
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className="">
                              You have ${underutilizedAmount.toFixed(2)} in
                              assets that could be earning yield
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
