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
import { AnimatePresence, circOut, easeOut, motion } from "framer-motion";
import {
  ArrowLeftSquare,
  ArrowRightSquare,
  ArrowUpCircle,
  DollarSign,
  HelpCircle,
  LucideIcon,
  PlusCircle,
  Wallet,
} from "lucide-react";
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

// Default colors for progress bars and allocation
const defaultColors = [
  "emerald-500",
  "blue-500",
  "violet-500",
  "amber-500",
  "rose-500",
  "cyan-500",
  "indigo-500",
  "orange-500",
];

// Types for the component props
export interface MetricCardData {
  label: string;
  value: number;
  icon?: LucideIcon;
  color?: string;
  tooltip?: string;
}

export interface AllocationItem {
  symbol: string;
  allocation: number;
  value?: number;
}

export interface AnimatedValueCardProps {
  // Main display values
  totalValue: number;
  primaryValue: number;
  secondaryValue?: number;
  utilizationPercentage: number;
  
  // Card configuration
  title: string;
  titleIcon?: LucideIcon;
  titleTooltip?: string;
  currency?: string;
  
  // Metric cards (the two smaller cards)
  primaryMetric: MetricCardData;
  secondaryMetric?: MetricCardData;
  
  // Progress bar configuration
  progressLabel?: string;
  progressColors?: {
    low: string;    // < 30%
    medium: string; // 30-60%
    high: string;   // > 60%
  };
  
  // Call to action button
  actionButton?: {
    show: boolean;
    label: string;
    onClick: () => void;
    gradient?: string;
    pulseInterval?: number; // milliseconds
  };
  
  // Asset allocation (back of card)
  allocation?: AllocationItem[];
  allocationTitle?: string;
  allocationTooltip?: string;
  allocationColors?: string[];
  
  // Loading state
  isLoading?: boolean;
  
  // Animation configuration
  animationDuration?: number;
  enableFlipCard?: boolean;
  
  // Custom styling
  className?: string;
  cardHeight?: string;
}

export function AnimatedValueCard({
  totalValue,
  primaryValue,
  secondaryValue = 0,
  utilizationPercentage,
  title,
  titleIcon: TitleIcon = Wallet,
  titleTooltip,
  currency = "$",
  primaryMetric,
  secondaryMetric,
  progressLabel = "Utilization",
  progressColors = {
    low: "bg-red-500",
    medium: "bg-yellow-500",
    high: "bg-emerald-500",
  },
  actionButton,
  allocation = [],
  allocationTitle = "Asset Allocation",
  allocationTooltip = "Asset allocation shows the distribution across different assets.",
  allocationColors = defaultColors,
  isLoading = false,
  animationDuration = 1500,
  enableFlipCard = true,
  className = "",
  cardHeight = "h-full",
}: AnimatedValueCardProps) {
  const [progressValue, setProgressValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [pulseButton, setPulseButton] = useState(false);
  const [showAllocation, setShowAllocation] = useState(false);

  // Animated counter values
  const animatedTotalValue = useCountUp(isLoading ? 0 : totalValue, animationDuration);
  const animatedPrimaryValue = useCountUp(isLoading ? 0 : primaryValue, animationDuration);
  const animatedSecondaryValue = useCountUp(isLoading ? 0 : secondaryValue, animationDuration);

  // Determine color based on utilization percentage
  const getUtilizationColor = () => {
    if (utilizationPercentage < 30) return progressColors.low;
    if (utilizationPercentage < 60) return progressColors.medium;
    return progressColors.high;
  };

  // Animate progress bar on load and set visibility
  useEffect(() => {
    if (!isLoading) {
      setIsVisible(true);

      const progressTimer = setTimeout(() => {
        setProgressValue(utilizationPercentage);
      }, 500);

      // Pulse the button if configured
      if (actionButton?.show && actionButton.pulseInterval) {
        const pulseInterval = setInterval(() => {
          setPulseButton(true);
          setTimeout(() => setPulseButton(false), 1000);
        }, actionButton.pulseInterval);

        return () => {
          clearTimeout(progressTimer);
          clearInterval(pulseInterval);
        };
      }

      return () => clearTimeout(progressTimer);
    }
  }, [isLoading, utilizationPercentage, actionButton]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "tween" as const,
        duration: 0.5,
        ease: easeOut
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        type: "tween" as const,
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
      transition: { 
        type: "spring" as const,
        duration: 0.3 
      },
    },
  };

  const flipVariants = {
    front: {
      rotateY: 0,
      transition: { 
        type: "tween" as const,
        duration: 0.6, 
        ease: circOut 
      },
    },
    back: {
      rotateY: 180,
      transition: { 
        type: "tween" as const,
        duration: 0.6, 
        ease: circOut 
      },
    },
  };

  const contentVisibilityVariants = {
    visible: {
      opacity: 1,
      height: "360px",
      transition: { 
        type: "tween" as const,
        delay: 0.3, 
        duration: 0.3 
      },
    },
    hidden: {
      opacity: 0,
      height: 0,
      transition: { 
        type: "tween" as const,
        duration: 0.3 
      },
    },
  };

  const PrimaryIcon = primaryMetric.icon || ArrowUpCircle;
  const SecondaryIcon = secondaryMetric?.icon || PlusCircle;

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={cardVariants}
        className={`perspective-1000 relative ${className}`}
      >
        <motion.div
          animate={showAllocation ? "back" : "front"}
          variants={flipVariants}
          className={`w-full ${cardHeight} preserve-3d`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front of card (Main Content) */}
          <motion.div
            animate={showAllocation ? "hidden" : "visible"}
            variants={contentVisibilityVariants}
            className={`relative w-full ${cardHeight} backface-hidden`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <Card className={`overflow-hidden border-none shadow-lg ${cardHeight}`}>
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
                      <TitleIcon className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                    <CardTitle className="text-sm font-medium">
                      {title}
                    </CardTitle>
                  </div>
                  {titleTooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                          <span className="sr-only">{title} info</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{titleTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
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
                          {currency}{animatedTotalValue.toLocaleString()}
                        </span>
                        {enableFlipCard && allocation.length > 0 && (
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAllocation(true)}
                            className="ml-2 cursor-pointer"
                          >
                            <ArrowRightSquare className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Utilization progress bar */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {progressLabel}
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

                    {/* Metric cards */}
                    <motion.div
                      variants={itemVariants}
                      className="grid grid-cols-2 gap-4"
                    >
                      {/* Primary metric */}
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="border border-border/50 bg-card/50">
                          <CardContent className="p-4">
                            <div className="text-xs font-medium text-muted-foreground">
                              {primaryMetric.label}
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
                                <PrimaryIcon className={`mr-1 h-4 w-4 ${primaryMetric.color || "text-emerald-500"}`} />
                              </motion.div>
                              <span className="text-lg font-semibold">
                                {currency}{animatedPrimaryValue.toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Secondary metric */}
                      {secondaryMetric && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ y: -4 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Card className="border border-border/50 bg-card/50">
                                <CardContent className="p-4">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {secondaryMetric.label}
                                  </div>
                                  <div className="mt-1 flex items-center">
                                    {secondaryValue > 0 ? (
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
                                          <SecondaryIcon className={`mr-1 h-4 w-4 ${secondaryMetric.color || "text-yellow-500"}`} />
                                        </motion.div>
                                        <span className={`text-lg font-semibold ${secondaryMetric.color || "text-yellow-500"}`}>
                                          {currency}{animatedSecondaryValue.toLocaleString()}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-lg font-semibold">{currency}0</span>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </TooltipTrigger>
                          {secondaryMetric.tooltip && (
                            <TooltipContent>
                              <p>{secondaryMetric.tooltip}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      )}
                    </motion.div>

                    {/* Call to action button */}
                    <AnimatePresence>
                      {actionButton?.show && (
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
                            className={`w-full ${actionButton.gradient || "bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"}`}
                            onClick={actionButton.onClick}
                          >
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 1, delay: 1 }}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                            </motion.div>
                            {actionButton.label}
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
          {enableFlipCard && allocation.length > 0 && (
            <motion.div
              animate={showAllocation ? "visible" : "hidden"}
              variants={contentVisibilityVariants}
              className={`absolute w-full ${cardHeight} backface-hidden rotate-y-180`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <Card className={`overflow-hidden border-none shadow-lg ${cardHeight}`}>
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
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => setShowAllocation(false)}
                      >
                        <ArrowLeftSquare className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      </motion.div>
                      <span className="sr-only">Back to {title.toLowerCase()}</span>
                      <CardTitle className="text-sm font-medium">
                        {allocationTitle}
                      </CardTitle>
                    </div>
                    {allocationTooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <motion.div
                              whileHover={{ rotate: 15 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                            <span className="sr-only">{allocationTitle} info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{allocationTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
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
                  ) : allocation.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      <p>No allocation data available.</p>
                    </div>
                  ) : (
                    <motion.div
                      className="space-y-4"
                      initial="hidden"
                      animate="visible"
                      variants={contentVariants}
                    >
                      {allocation.slice(0, 5).map((asset, index) => (
                        <motion.div key={index} variants={itemVariants}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span>{asset.symbol}</span>
                              {asset.value && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  ({currency}{asset.value.toLocaleString()})
                                </span>
                              )}
                            </div>
                            <span>{asset.allocation.toFixed(2)}%</span>
                          </div>
                          <Progress
                            value={asset.allocation}
                            className={`h-2 mt-1 bg-muted [&>*]:bg-${allocationColors[index % allocationColors.length]}`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
} 