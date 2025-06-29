"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBalances } from "@/lib/contexts";
import { usePortfolioMetrics } from "@/lib/hooks/UsePortfolioMetrics";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  ArrowLeftSquare,
  ArrowRightSquare,
  ArrowUpCircle,
  DollarSign,
  HelpCircle,
  PlusCircle,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Number counter animation hook
const useCountUp = (end: number, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const startValue = count > end ? end : 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(startValue + progress * (end - startValue)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

// Colors for asset allocation bars
const assetColors = [
  "emerald-500",
  "blue-500",
  "violet-500",
  "amber-500",
  "rose-500",
  "cyan-500",
  "indigo-500",
  "orange-500",
];

export function TotalValueCard() {
  const { totalValue, isLoading, positions, balances = [] } = useBalances();
  const { 
    positionValue, 
    utilizationPercentage, 
    underutilizedAmount, 
  } = usePortfolioMetrics()
  const [progressValue, setProgressValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [pulseButton, setPulseButton] = useState(false);
  const [showAssetAllocation, setShowAssetAllocation] = useState(false);
  const router = useRouter();

  // Animated counter values
  const animatedPositionValue = useCountUp(isLoading ? 0 : positionValue);
  const animatedTotalValue = useCountUp(isLoading ? 0 : totalValue + positionValue);
  const animatedUnderutilizedAmount = useCountUp(isLoading ? 0 : underutilizedAmount);

  // Determine color based on utilization percentage
  const getUtilizationColor = () => {
    if (utilizationPercentage < 30) return "bg-red-500";
    if (utilizationPercentage < 60) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  // Animate progress bar on load and set visibility
  useEffect(() => {
    if (!isLoading) {
      setIsVisible(true);

      const progressTimer = setTimeout(() => {
        setProgressValue(utilizationPercentage);
      }, 500);

      // Pulse the button every 5 seconds if there's underutilized amount
      if (underutilizedAmount > 0) {
        const pulseInterval = setInterval(() => {
          setPulseButton(true);
          setTimeout(() => setPulseButton(false), 1000);
        }, 5000);

        return () => {
          clearTimeout(progressTimer);
          clearInterval(pulseInterval);
        };
      }

      return () => clearTimeout(progressTimer);
    }
  }, [isLoading, utilizationPercentage, underutilizedAmount]);

  // Card variants for animation
  const cardVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Content variants for staggered animation
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

  // Card flip variants
  const flipVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  // Content visibility variants
  const contentVisibilityVariants = {
    visible: {
      opacity: 1,
      height: "360px",
      transition: { delay: 0.3, duration: 0.3 },
    },
    hidden: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={cardVariants as Variants  }
        className="perspective-1000 relative"
      >
        <motion.div
          animate={showAssetAllocation ? "back" : "front"}
          variants={flipVariants as Variants}
          className="w-full h-full preserve-3d"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front of card (Portfolio Utilization) */}
          <motion.div
            animate={showAssetAllocation ? "hidden" : "visible"}
            variants={contentVisibilityVariants}
            className="relative w-full h-full backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Card className="overflow-hidden border-none shadow-lg h-full">
              <motion.div
                className={`h-1 ${getUtilizationColor()}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              />
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                    <CardTitle className="text-sm font-medium">
                      Portfolio
                    </CardTitle>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                        <span className="sr-only">
                          Portfolio utilization info
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Portfolio utilization shows how much of your total
                        assets are deployed in yield-generating positions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                ) : (
                  <motion.div
                    className="space-y-6"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Main value display */}
                    <motion.div
                      variants={itemVariants}
                      className="flex items-end space-x-2"
                    >
                      <div className="flex items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.4,
                          }}
                        >
                          <DollarSign className="mr-1 h-6 w-6 text-muted-foreground" />
                        </motion.div>
                        <span className="text-3xl font-bold">
                          {animatedTotalValue.toLocaleString()}
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowAssetAllocation(true)}
                          className="ml-2 cursor-pointer"
                        >
                          <ArrowRightSquare className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Utilization progress bar */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Utilization
                        </span>
                        <motion.span
                          className="font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1, delay: 0.8 }}
                        >
                          {utilizationPercentage.toFixed(1)}%
                        </motion.span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <motion.div
                          className={`h-full ${getUtilizationColor()}`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${progressValue}%` }}
                          transition={{
                            duration: 1.5,
                            ease: "easeOut",
                            delay: 0.8,
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Position value and underutilized amount */}
                    <motion.div
                      variants={itemVariants}
                      className="grid grid-cols-2 gap-4"
                    >
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="border border-border/50 bg-card/50">
                          <CardContent className="p-4">
                            <div className="text-xs font-medium text-muted-foreground">
                              Yield Bearing Positions
                            </div>
                            <div className="mt-1 flex items-center">
                              <motion.div
                                animate={{ rotate: [0, 10, 0] }}
                                transition={{
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  repeatType: "reverse",
                                  ease: "easeInOut",
                                }}
                              >
                                <ArrowUpCircle className="mr-1 h-4 w-4 text-emerald-500" />
                              </motion.div>
                              <span className="text-lg font-semibold">
                                ${animatedPositionValue.toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ y: -4 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Card
                              className={`border border-border/50 bg-card/50 ${underutilizedAmount > 0 ? "cursor-pointer hover:bg-accent/50" : ""}`}
                            >
                              <CardContent className="p-4">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Underutilized
                                </div>
                                <div className="mt-1 flex items-center">
                                  {underutilizedAmount > 0 ? (
                                    <>
                                      <motion.div
                                        animate={{
                                          scale: [1, 1.2, 1],
                                          rotate: [0, 10, 0],
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Number.POSITIVE_INFINITY,
                                          repeatType: "reverse",
                                        }}
                                      >
                                        <PlusCircle className="mr-1 h-4 w-4 text-yellow-500" />
                                      </motion.div>
                                      <span className="text-lg font-semibold text-yellow-500">
                                        ${animatedUnderutilizedAmount.toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-lg font-semibold">$0</span>
                                  )}
                                </div>

                              </CardContent>
                            </Card>
                          </motion.div>
                        </TooltipTrigger>
                        {underutilizedAmount > 0 && (
                          <TooltipContent>
                            <p>
                              Click to deploy these funds and start earning yield
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </motion.div>

                    {/* Call to action if underutilized */}
                    <AnimatePresence>
                      {underutilizedAmount > 0 && (
                        <motion.div
                          variants={itemVariants}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: pulseButton ? 1.03 : 1,
                          }}
                          transition={{
                            duration: 0.3,
                            scale: {
                              duration: 0.4,
                              ease: "easeInOut",
                            },
                          }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <Button
                            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
                            onClick={() => router.push('/deploy')}
                          >
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 1, delay: 1 }}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                            </motion.div>
                            Deploy ${animatedUnderutilizedAmount.toLocaleString()} Idle Funds
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Back of card (Asset Allocation) */}
          <motion.div
            animate={showAssetAllocation ? "visible" : "hidden"}
            variants={contentVisibilityVariants}
            className="absolute w-full h-full backface-hidden rotate-y-180"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <Card className="overflow-hidden border-none shadow-lg h-full">
              <motion.div
                className="h-1 bg-violet-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="cursor-pointer"
                      whileHover={{ scale: 1.1, rotate: -10}}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => setShowAssetAllocation(false)}
                    >
                      <ArrowLeftSquare className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </motion.div>
                    <span className="sr-only">Back to portfolio</span>
                    <CardTitle className="text-sm font-medium">
                      Asset Allocation
                    </CardTitle>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                        <span className="sr-only">Asset allocation info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Asset allocation shows the distribution of your
                        portfolio across different assets.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : balances.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    <p>No asset allocation data available.</p>
                  </div>
                ) : (
                  <motion.div
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={contentVariants}
                  >
                    {balances.slice(0, 5).map((asset, index) => (
                      <motion.div key={index} variants={itemVariants}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span>{asset.symbol}</span>
                          </div>
                          <span>{asset.allocation.toFixed(2)}%</span>
                        </div>
                        <Progress
                          value={asset.allocation}
                          className={`h-2 mt-1 bg-muted [&>*]:bg-${assetColors[index % assetColors.length]}`}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
