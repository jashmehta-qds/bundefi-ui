"use client"



"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AssetBalance } from "@/lib/contexts"
import { motion } from "framer-motion"
import { Check, Search } from 'lucide-react'
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

interface AssetSelectorProps {
    assets: AssetBalance[]
    value: AssetBalance | null
    onChange: (asset: AssetBalance) => void
    placeholder?: string
    maxHeight?: number
  }


  export function AssetSelector({ assets, value, onChange, maxHeight = 350 }: AssetSelectorProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [displayCount, setDisplayCount] = useState(24) // Show 4 rows of 6 initially
    const observerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
  
    // Filter assets based on search term
    const filteredAssets = assets.filter((asset) => asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  
    // Set up intersection observer for infinite scrolling
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && displayCount < filteredAssets.length) {
            setDisplayCount((prev) => Math.min(prev + 12, filteredAssets.length)) // Load 2 more rows at a time
          }
        },
        { threshold: 0.1 }
      )
  
      if (observerRef.current) {
        observer.observe(observerRef.current)
      }
  
      return () => observer.disconnect()
    }, [displayCount, filteredAssets.length])
  
    // Reset display count when search term changes
    useEffect(() => {
      setDisplayCount(24) // Reset to initial 4 rows
    }, [searchTerm])
  
    // Focus search input on initial render
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, [])
  
    // Handle asset selection
    const handleSelect = (asset: AssetBalance) => {
      onChange(asset)
    }
  
    return (
      <div className="w-full border rounded-md bg-card">
        {/* Search field */}
        <div className="flex items-center border-b px-3 py-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0"
          />
        </div>
  
        {/* Assets grid */}
        <ScrollArea className="p-3" style={{ height: `${maxHeight}px` }}>
          {filteredAssets.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No assets found</div>
          ) : (
            <div>
              {/* Grid layout with 6 items per row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {filteredAssets.slice(0, displayCount).map((asset) => (
                  <motion.div
                    key={asset.symbol}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      flex flex-col items-center justify-center p-2 rounded-md cursor-pointer
                      border transition-all duration-200
                      ${
                        value?.symbol === asset.symbol
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-transparent hover:border-primary/30 hover:bg-accent"
                      }
                    `}
                    onClick={() => handleSelect(asset)}
                  >
                    <div className="relative mb-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        <Image
                          src={asset.logoUrl || "/placeholder.svg"}
                          alt={asset.symbol}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      {value?.symbol === asset.symbol && (
                        <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-center">{asset.symbol}</div>
                    <div className="text-xs text-muted-foreground text-center mt-1 grid grid-rows-2">
                    <div>  {asset.balance} {asset.symbol}</div>
                      <div> ${+(asset.usdValue || 0)?.toFixed(3)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
  
              {/* Intersection observer target for infinite scrolling */}
              {displayCount < filteredAssets.length && <div ref={observerRef} className="h-4 w-full mt-2" />}
            </div>
          )}
        </ScrollArea>
      </div>
    )
  }
