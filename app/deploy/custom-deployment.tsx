"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useBalances } from "@/lib/contexts"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpDown, CheckCircle2, Coins, Loader2, Search } from 'lucide-react'
import Image from "next/image"
import { useState } from "react"

// Mock protocols data
const mockProtocols = [
  { 
    id: "aave", 
    name: "Aave", 
    apy: 4.2, 
    tvl: 5.8, 
    icon: "/placeholder.svg?height=40&width=40", 
    description: "Decentralized lending protocol",
    supportedAssets: ["ETH", "USDC", "USDT", "DAI", "WBTC"]
  },
  { 
    id: "compound", 
    name: "Compound", 
    apy: 4.0, 
    tvl: 3.2, 
    icon: "/placeholder.svg?height=40&width=40", 
    description: "Algorithmic money market",
    supportedAssets: ["ETH", "USDC", "DAI", "WBTC"]
  },
  { 
    id: "curve", 
    name: "Curve", 
    apy: 3.9, 
    tvl: 4.1, 
    icon: "/placeholder.svg?height=40&width=40", 
    description: "Stablecoin AMM with yield farming",
    supportedAssets: ["USDC", "USDT", "DAI"]
  },
  { 
    id: "lido", 
    name: "Lido", 
    apy: 3.8, 
    tvl: 15.2, 
    icon: "/placeholder.svg?height=40&width=40", 
    description: "Liquid staking solution for ETH",
    supportedAssets: ["ETH"]
  },
  { 
    id: "balancer", 
    name: "Balancer", 
    apy: 5.2, 
    tvl: 1.8, 
    icon: "/placeholder.svg?height=40&width=40", 
    description: "Automated portfolio manager",
    supportedAssets: ["ETH", "USDC", "DAI", "WBTC", "MATIC"]
  },
]

type Step = "select-protocol" | "select-assets" | "confirm"
type SortField = "name" | "apy" | "tvl"
type SortDirection = "asc" | "desc"

export function CustomDeployment() {
  const { balances = [] } = useBalances()
  const [step, setStep] = useState<Step>("select-protocol")
  const [selectedProtocol, setSelectedProtocol] = useState<string>("")
  const [selectedAssets, setSelectedAssets] = useState<Record<string, boolean>>({})
  const [assetAmounts, setAssetAmounts] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("apy")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isDeploying, setIsDeploying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  
  // Filter protocols by search term
  const filteredProtocols = mockProtocols.filter(protocol => 
    protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    protocol.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Sort protocols
  const sortedProtocols = [...filteredProtocols].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name)
    } else {
      const aValue = a[sortField as keyof typeof a] as number
      const bValue = b[sortField as keyof typeof b] as number
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
  })
  
  // Get the selected protocol
  const protocol = mockProtocols.find(p => p.id === selectedProtocol)
  
  // Get available assets for the selected protocol
  const availableAssets = protocol 
    ? balances.filter(asset => 
        protocol.supportedAssets.includes(asset.symbol) && 
        asset.usdValue && asset.usdValue > 0
      )
    : []
  
  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }
  
  // Handle protocol selection
  const handleProtocolSelect = (id: string) => {
    setSelectedProtocol(id)
    setSelectedAssets({})
    setAssetAmounts({})
  }
  
  // Handle asset selection
  const handleAssetSelect = (symbol: string, checked: boolean) => {
    setSelectedAssets(prev => ({
      ...prev,
      [symbol]: checked
    }))
    
    if (checked && !assetAmounts[symbol]) {
      const asset = balances.find(a => a.symbol === symbol)
      if (asset) {
        setAssetAmounts(prev => ({
          ...prev,
          [symbol]: 100
        }))
      }
    }
  }
  
  // Handle amount change
  const handleAmountChange = (symbol: string, value: string) => {
    const amount = parseFloat(value)
    if (!isNaN(amount)) {
      setAssetAmounts(prev => ({
        ...prev,
        [symbol]: amount
      }))
    }
  }
  
  // Handle max amount
  const handleMaxAmount = (symbol: string) => {
    const asset = balances.find(a => a.symbol === symbol)
    if (asset) {
      setAssetAmounts(prev => ({
        ...prev,
        [symbol]: 100
      }))
    }
  }
  
  // Move to next step
  const handleNext = () => {
    if (step === "select-protocol") {
      setStep("select-assets")
    } else if (step === "select-assets") {
      setStep("confirm")
    }
  }
  
  // Handle deployment
  const handleDeploy = () => {
    setIsDeploying(true)
    
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false)
      setIsComplete(true)
      
      // Reset after completion
      setTimeout(() => {
        setStep("select-protocol")
        setSelectedProtocol("")
        setSelectedAssets({})
        setAssetAmounts({})
        setIsComplete(false)
      }, 3000)
    }, 2000)
  }
  
  // Check if any assets are selected
  const hasSelectedAssets = Object.values(selectedAssets).some(selected => selected)
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "select-protocol" && (
          <motion.div 
            key="select-protocol"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 "
          >
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search protocols..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleSort("name")}
                        className="flex items-center -ml-4 font-medium"
                      >
                        Protocol
                        {sortField === "name" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleSort("apy")}
                        className="flex items-center -ml-4 font-medium"
                      >
                        APY
                        {sortField === "apy" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleSort("tvl")}
                        className="flex items-center -ml-4 font-medium"
                      >
                        TVL (B)
                        {sortField === "tvl" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedProtocols.map((protocol) => (
                      <motion.tr 
                        key={protocol.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`${selectedProtocol === protocol.id ? 'bg-muted/50' : ''}`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                              <Image 
                                src={protocol.icon || "/placeholder.svg"} 
                                alt={protocol.name} 
                                width={32} 
                                height={32} 
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <div>{protocol.name}</div>
                              <div className="text-xs text-muted-foreground">{protocol.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-emerald-500 font-medium">{protocol.apy}%</TableCell>
                        <TableCell>${protocol.tvl}B</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={selectedProtocol === protocol.id ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handleProtocolSelect(protocol.id)}
                          >
                            {selectedProtocol === protocol.id ? "Selected" : "Select"}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            
            <Button 
              onClick={handleNext} 
              disabled={!selectedProtocol}
              className="w-full"
            >
              Continue with {mockProtocols.find(p => p.id === selectedProtocol)?.name || "Selected Protocol"}
            </Button>
          </motion.div>
        )}
        
        {step === "select-assets" && (
          <motion.div 
            key="select-assets"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 "
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  Select Assets for {protocol?.name}
                </h3>
                <Button variant="outline" size="sm" onClick={() => setStep("select-protocol")}>
                  Change Protocol
                </Button>
              </div>
              
              {availableAssets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No compatible assets found in your wallet for this protocol.
                </div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {availableAssets.map((asset) => (
                    <motion.div key={asset.symbol} variants={itemVariants}>
                      <Card className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Checkbox 
                                id={`asset-${asset.symbol}`}
                                checked={selectedAssets[asset.symbol] || false}
                                onCheckedChange={(checked) => 
                                  handleAssetSelect(asset.symbol, checked === true)
                                }
                                className="mr-2"
                              />
                              <label 
                                htmlFor={`asset-${asset.symbol}`}
                                className="font-medium cursor-pointer"
                              >
                                {asset.symbol}
                              </label>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Available: {asset.balance} {asset.symbol}
                            </div>
                          </div>
                          
                          {selectedAssets[asset.symbol] && (
                            <div className="flex items-center mt-2">
                              <div className="flex-1 mr-2">
                                <Input 
                                  type="number"
                                  value={assetAmounts[asset.symbol] || ""}
                                  onChange={(e) => handleAmountChange(asset.symbol, e.target.value)}
                                  placeholder={`Amount of ${asset.symbol}`}
                                  min={0}
                                  max={asset.balance}
                                  step={0.0001}
                                />
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleMaxAmount(asset.symbol)}
                              >
                                Max
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
            
            <Button 
              onClick={handleNext} 
              disabled={!hasSelectedAssets || availableAssets.length === 0}
              className="w-full"
            >
              Continue
            </Button>
          </motion.div>
        )}
        
        {step === "confirm" && (
          <motion.div 
            key="confirm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">Deployment Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Protocol</span>
                  <span className="font-medium">{protocol?.name}</span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Expected APY</span>
                  <span className="font-medium text-emerald-500">{protocol?.apy}%</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Assets to Deploy</h4>
                  {Object.entries(selectedAssets)
                    .filter(([_, selected]) => selected)
                    .map(([symbol]) => (
                      <div key={symbol} className="flex justify-between items-center py-1 border-b border-dashed">
                        <span>{symbol}</span>
                        <span className="font-medium">
                          {assetAmounts[symbol]?.toFixed(4) || 0} {symbol}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            
            {isComplete ? (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>Funds successfully deployed! Redirecting...</span>
              </div>
            ) : (
              <Button 
                onClick={handleDeploy} 
                disabled={isDeploying}
                className="w-full"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    Deploy Funds
                    <Coins className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            
            {!isComplete && !isDeploying && (
              <Button 
                variant="outline" 
                onClick={() => setStep("select-assets")}
                className="w-full mt-2"
              >
                Back
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
