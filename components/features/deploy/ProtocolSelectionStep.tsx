import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatWithSuffix } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  SwitchCameraIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ChainlinkLoadingOverlay } from "./ChainlinkLoadingOverlay";
import { useDeployManager } from "./hooks/useDeployManager";
import { Protocol } from "./types";
import { getChainLogo, getChainName } from "./utils/chainLogos";

interface ProtocolSelectionStepProps {
  protocols: Protocol[];
  isLoading: boolean;
}

export function ProtocolSelectionStep({
  protocols,
  isLoading,
}: ProtocolSelectionStepProps) {
  const {
    state,
    handleProtocolSelect,
    handleNext,
    handleBack,
    handleCCIPEnabled,
  } = useDeployManager();
  const selectedAsset = state.selectedAsset?.symbol || "";
  const selectedProtocol = state.selectedProtocol;
  const [showCCIPLoading, setShowCCIPLoading] = useState(false);

  // Find the selected protocol to get its APY and TVL for comparison
  const selectedProtocolData = protocols.find((p) => p.id === selectedProtocol);
  const selectedApy = selectedProtocolData?.apy || 0;
  const selectedTvl = selectedProtocolData?.tvl || 0;

  // Helper functions to get colors based on comparison
  const getApyColor = (protocolApy: number, isSelected: boolean) => {
    if (!selectedProtocol) {
      // Unselected state - current color
      return isSelected ? "text-emerald-700" : "text-emerald-500";
    }

    // Selected state
    if (isSelected) {
      return "text-emerald-700";
    }

    // Compare with selected protocol's APY
    if (protocolApy > selectedApy) {
      return "text-emerald-800"; // Darker green for higher APY
    }

    return "text-emerald-500"; // Current color for lower APY
  };

  const getTvlColor = (protocolTvl: number) => {
    if (!selectedProtocol) {
      // Unselected state - current color
      return "text-gray-600";
    }

    // Selected state - compare with selected protocol's TVL
    if (protocolTvl > selectedTvl) {
      return "text-emerald-800 border border-emerald-800"; // Darker green for higher TVL
    }

    return "text-gray-600"; // Current color for lower TVL
  };

  const handleEnableCCIPYields = () => {
    handleCCIPEnabled(true);
    setShowCCIPLoading(true);
  };

  const handleCCIPLoadingComplete = () => {
    setShowCCIPLoading(false);
    // You can add additional logic here after CCIP yields are enabled
    // For example, show a success message or update the UI state
  };
  const handleDisableCCIPYields = () => {
    handleCCIPEnabled(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-[500px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h3 className="text-lg font-medium">
            Available Protocols for {selectedAsset}
          </h3>
          {state.isCCIPEnabled ? (
            <Button
              onClick={handleDisableCCIPYields}
              variant="outline"
              size="sm"
              className="text-black border-black hover:bg-gray-100 hover:border-black transition-colors"
            >
              <Image
                src="/chainlink-black.svg"
                alt="Chainlink Black"
                width={20}
                height={20}
              />
              Disable CCIP Yields
            </Button>
          ) : (
            <Button
              onClick={handleEnableCCIPYields}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-colors"
            >
              <Image
                src="/chainlink-blue.svg"
                alt="Chainlink Black"
                width={20}
                height={20}
              />
              Enable CCIP Yields
            </Button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : protocols.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No protocols available for this asset
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="h-full relative"
            >
              {/* Top shadow */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10" />

              <div className="h-full overflow-y-auto px-1 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent">
                {protocols.map((protocol, idx) => (
                  <motion.div
                    key={`protocol.id-${idx}`}
                    variants={itemVariants}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                        selectedProtocol === protocol.id
                          ? "bg-emerald-200/30 ring-1 ring-emerald-700"
                          : "hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
                      }`}
                      onClick={() => handleProtocolSelect(protocol.id)}
                    >
                      {/* Animated background wave effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/15 to-emerald-300/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out delay-200" />

                      <CardContent className="p-4 flex items-center justify-between relative z-10 group-hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-center">
                          <div className="relative">
                            <motion.div
                              className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-shadow duration-300"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                            >
                              <Image
                                src={protocol.icon}
                                alt={protocol.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            </motion.div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium group-hover:text-emerald-700 transition-colors duration-300">
                                {protocol.name}
                              </h4>

                              <>
                                {protocol.chainId &&
                                  getChainName(protocol.chainId) && (
                                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                      {/* Chain logo overlay */}
                                      {protocol.chainId &&
                                        getChainLogo(protocol.chainId) && (
                                          <div className=" h-5 w-5 rounded-full bg-white border border-black flex items-center justify-center">
                                            <Image
                                              src={
                                                getChainLogo(protocol.chainId)!
                                              }
                                              alt={
                                                getChainName(
                                                  protocol.chainId
                                                ) || "Chain"
                                              }
                                              width={16}
                                              height={16}
                                              className="rounded-full"
                                            />
                                          </div>
                                        )}
                                      {getChainName(protocol.chainId)}
                                    </span>
                                  )}
                                <span
                                  className={`flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-full ${getTvlColor(protocol.tvl)}`}
                                >
                                  {/* Chain logo overlay */}

                                  <div className=" h-5 w-5 rounded-full flex items-center justify-center">
                                    <LockKeyhole />
                                  </div>

                                  {formatWithSuffix(protocol.tvl)}
                                </span>
                              </>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          {selectedProtocol === protocol.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 20,
                              }}
                            >
                              <CheckCircle2 className="h-5 w-5 text-emerald-700 ml-auto" />
                            </motion.div>
                          )}
                          <motion.div
                            className={`${getApyColor(protocol.apy, selectedProtocol === protocol.id)} font-medium group-hover:text-emerald-600 transition-colors duration-300`}
                            whileHover={{ scale: 1.1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                            }}
                          >
                            {protocol.apy.toFixed(2)}%{" "}
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Bottom shadow */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
            </motion.div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t bg-white pt-4 flex-shrink-0 flex gap-4">
          <Button
            variant="outline"
            className="flex-1 text-yellow-500 border-yellow-400 hover:text-yellow-600 hover:border-yellow-500"
            onClick={handleBack}
          >
            Switch Coin
            <SwitchCameraIcon className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedProtocol}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* CCIP Loading Overlay */}
      <ChainlinkLoadingOverlay
        isVisible={showCCIPLoading}
        onComplete={handleCCIPLoadingComplete}
      />
    </>
  );
}
