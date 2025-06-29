"use client"

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ChainlinkLoadingOverlayProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function ChainlinkLoadingOverlay({ isVisible, onComplete }: ChainlinkLoadingOverlayProps) {
  const [animationState, setAnimationState] = useState<"idle" | "moving" | "overlapping" | "transformed">("idle")

  useEffect(() => {
    if (isVisible) {
      setAnimationState("moving")

      // Start overlapping when they meet
      const overlapTimer = setTimeout(() => {
        setAnimationState("overlapping")
      }, 2000)

      // Transform to blue and scale up
      const transformTimer = setTimeout(() => {
        setAnimationState("transformed")
      }, 2300)

      // Complete the animation and call onComplete
      const completeTimer = setTimeout(() => {
        onComplete?.()
      }, 4000)

      return () => {
        clearTimeout(overlapTimer)
        clearTimeout(transformTimer)
        clearTimeout(completeTimer)
      }
    } else {
      setAnimationState("idle")
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
    >
      <div className="relative w-full max-w-2xl h-48 mx-auto">

        {/* Transformed Blue Logo */}
        <AnimatePresence>
          {animationState === "transformed" && (
            <motion.div
              className="absolute top-1/2 left-[calc(45%)] transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 1, rotate: 0, opacity: 0 }}
              animate={{
                scale: 1.2,
                rotate: 180,
                opacity: 1,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: 2,
                  ease: "easeInOut",
                }}
              >
                <Image src="/chainlink-blue.svg" alt="Transformed Blue Chainlink" width={80} height={92} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Enabling CCIP Yields using Chainlink</h3>
        <p className="text-gray-600">Connecting cross-chain protocols...</p>
      </motion.div>
    </motion.div>
  )
} 