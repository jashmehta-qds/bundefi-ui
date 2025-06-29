"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PoolPosition } from "@/lib/contexts"
import { motion } from "framer-motion"
import { ArrowBigDown, BoxIcon, ChevronDown, LineChart, PlusCircleIcon, WandSparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"



export default function YieldPositionsCard({
  positions = [],
  isLoading = false,
  handleLiquidity = (position: PoolPosition, action: "add" | "remove") => {},
  handleOptimize = (position: PoolPosition) => {},
}: {
  positions: PoolPosition[]
  isLoading?: boolean
  handleLiquidity?: (position: PoolPosition, action: "add" | "remove") => void
  handleOptimize?: (position: PoolPosition) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if we need to show the expand button
  useEffect(() => {
    if (!isLoading && positions.length > 0 && containerRef.current) {
      // If we have more than 6 positions or the container height exceeds 500px
      const shouldShowButton = positions.length > 6 || containerRef.current.scrollHeight > 500

      setShowExpandButton(shouldShowButton)
    }
  }, [isLoading, positions, containerRef.current])

  // Calculate the initial height for the collapsed state (show approximately 2 rows)
  const collapsedHeight = positions.length > 0 ? "360px" : "auto"

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Active Yield Positions</CardTitle>
            <CardDescription className="mt-1">Your current yield-generating positions</CardDescription>
          </div>

          {!isLoading && positions.length > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {positions.length} Positions
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : positions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative">
            <motion.div
              ref={containerRef}
              initial={{ height: collapsedHeight }}
              animate={{
                height: isExpanded ? "auto" : collapsedHeight,
                transition: { duration: 0.4, ease: "easeInOut" },
              }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {positions.map((position, index) => (
                  <PositionCard
                    key={index}
                    position={position}
                    onAddLiquidity={() => handleLiquidity(position, "add")}
                    onRemoveLiquidity={() => handleLiquidity(position, "remove")}
                    onOptimize={() => handleOptimize(position)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Gradient Overlay */}
            {!isExpanded && showExpandButton && (
              <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}

            {/* Expand/Collapse Button */}
            {showExpandButton && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="outline"
                  size="sm"
                  className="rounded-full z-20 px-6 py-2 shadow-md border border-primary/20 hover:border-primary/40 transition-all duration-300 group"
                >
                  <span className="mr-2">{isExpanded ? "Show Less" : "Show All Positions"}</span>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-4 w-4 text-primary" />
                  </motion.div>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Loading state component
function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-xl shadow-sm border border-border animate-pulse overflow-hidden">
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center mb-4">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>

              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <div className="flex flex-col items-end">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-between mt-4 pt-4 border-t border-border">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Empty state component
function EmptyState() {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-muted rounded-lg">
      <div className="bg-muted/30 p-3 rounded-full mb-4">
        <LineChart className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No Active Positions</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        You don't have any active yield positions yet. Start earning by adding liquidity to a protocol.
      </p>
      <Button variant="default">
        <PlusCircleIcon className="mr-2 h-4 w-4" />
        Add Position
      </Button>
    </div>
  )
}

// Position card component
function PositionCard({
  position,
  onAddLiquidity,
  onRemoveLiquidity,
  onOptimize,
}: {
  position: PoolPosition
  onAddLiquidity: () => void
  onRemoveLiquidity: () => void
  onOptimize: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-xl shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <LineChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-lg">{position.token}</div>
            <Badge variant="secondary" className="text-xs font-normal">
              {position.protocol.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-medium">
              {(Number(position.supplied) / 10 ** position.underlyingAssetDecimals).toLocaleString(undefined, {
                maximumFractionDigits: 6,
              })}{" "}
              {position.token}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value</span>
            <span className="font-medium">
              $
              {position.usdValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Supply APY</span>
            <div className="flex flex-col items-end">
              <span className="font-medium text-emerald-500">{position.netSupplyApy.toFixed(2)}%</span>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <BoxIcon className="h-3 w-3" /> {position.supplyRewardApy.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-between mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-background hover:bg-muted/50"
            onClick={onRemoveLiquidity}
          >
            <ArrowBigDown className="h-4 w-4 mr-1" />
            Withdraw
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-background hover:bg-muted/50"
            onClick={onAddLiquidity}
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
                  onClick={onOptimize}
                >
                  <WandSparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-amber-50 text-amber-700 border-amber-200">Optimize Yield</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  )
}
