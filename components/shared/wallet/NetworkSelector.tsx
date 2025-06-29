"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetwork } from "@/lib/contexts";
import { motion } from "framer-motion";
import { Check, Globe, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function NetworkSelector() {
  const {
    networks,
    selectedNetwork,
    setSelectedNetwork,
    isLoading,
    error,
    refreshNetworks,
  } = useNetwork();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNetworks();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-[140px] rounded-lg" />;
  }

  if (error) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={handleRefresh}
        className="h-10 text-red-500 border-red-200 hover:bg-red-50"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="h-10 flex items-center gap-2">
          {selectedNetwork ? (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: selectedNetwork.color + "20",
                    color: selectedNetwork.color,
                  }}
                >
                  <Image
                    src={selectedNetwork.logo || ""}
                    alt={selectedNetwork.name}
                    width={24}
                    height={24}
                  />
                </div>
              </motion.div>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Network</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[200px] p-2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
          Select Network
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />

        <div className="space-y-1">
          {networks.map((network) => (
            <DropdownMenuItem
              key={network.id}
              onClick={() => setSelectedNetwork(network)}
              className="p-0 focus:bg-slate-50 rounded-lg cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 w-full p-2 rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor: network.color + "20",
                    color: network.color,
                    border: `1px solid ${network.color}40`,
                  }}
                >
                  <Image
                    src={network.logo || ""}
                    alt={network.name}
                    width={32}
                    height={32}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {network.name}
                  </div>
                  <div className="text-xs text-slate-500">
                     Chain {network.chainId}
                  </div>
                </div>

                {selectedNetwork?.id === network.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </motion.div>
                )}
              </motion.div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuItem
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 focus:bg-slate-50 rounded-lg cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Networks
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
