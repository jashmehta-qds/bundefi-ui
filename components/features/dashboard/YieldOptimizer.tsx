"use client"

import { ethers } from "ethers"
import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useBalances } from "@/lib/contexts"
import {
  clearCaches,
  depositToHighestYield,
  fetchProtocolYields,
  getHighestYieldProtocol,
  type ProtocolYield
} from "@/lib/services"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      type: "tween" as const,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20
    }
  }
};

interface YieldOptimizerProps {
  provider?: ethers.providers.Web3Provider;
  address?: string;
  networkId?: number;
}

export function YieldOptimizer({ provider, address, networkId = 1 }: YieldOptimizerProps) {
  const { toast } = useToast()
  const { balances, isLoading: isBalancesLoading, error: balancesError } = useBalances()
  const [protocols, setProtocols] = useState<ProtocolYield[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch data when provider or address changes
  useEffect(() => {
    const fetchData = async () => {
      if (!provider || !address) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        // Fetch protocol yields
        const protocolData = await fetchProtocolYields(provider, networkId)
        setProtocols(protocolData)
        
        // Set default selected token
        if (balances.length > 0) {
          const usdcToken = balances.find(t => t.symbol === "USDC")
          if (usdcToken) {
            setSelectedToken("USDC")
            setSelectedTokenAddress(usdcToken.address)
          } else {
            setSelectedToken(balances[0].symbol)
            setSelectedTokenAddress(balances[0].address)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setErrorMessage("Failed to fetch data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [provider, address, networkId, refreshKey])

  // Handle token selection change
  const handleTokenChange = (value: string) => {
    setSelectedToken(value)
    const token = balances.find(t => t.symbol === value)
    if (token) {
      setSelectedTokenAddress(token.address)
    }
  }

  // Handle deposit
  const handleDeposit = async () => {
    if (!provider || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deposit assets.",
        variant: "destructive",
      })
      return
    }

    setIsDepositing(true)
    setErrorMessage(null)
    setTransactionHash(null)
    
    try {
      // Deposit to the protocol with the highest yield
      const result = await depositToHighestYield(
        provider,
        selectedTokenAddress,
        depositAmount,
        protocols,
        networkId
      )
      
      if (result.success) {
        // Show success message
        setSuccessMessage(result.message)
        setShowSuccessMessage(true)
        
        // Set transaction hash if available
        if (result.txHash) {
          setTransactionHash(result.txHash)
        }
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 5000)
        
        setDepositAmount("")
        
        // Refresh data
        handleRefresh()

        toast({
          title: "Deposit successful",
          description: result.message,
        })
      } else {
        setErrorMessage(result.message)
        toast({
          title: "Deposit failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error depositing:", error)
      const errorMsg = `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      setErrorMessage(errorMsg)
      toast({
        title: "Deposit failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsDepositing(false)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    clearCaches()
    setRefreshKey(prev => prev + 1)
  }

  // Get highest yield protocol
  const highestYieldProtocol = getHighestYieldProtocol(protocols)

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Yield Optimizer</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Protocol cards
            protocols.map((protocol, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`overflow-hidden ${
                  highestYieldProtocol?.name === protocol.name 
                    ? 'border-2 border-green-500 dark:border-green-400' 
                    : ''
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${protocol.color} flex items-center justify-center`}>
                        <span>{protocol.icon}</span>
                      </div>
                      <CardTitle>{protocol.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {highestYieldProtocol?.name === protocol.name && (
                        <span className="text-green-600 dark:text-green-400 font-medium">Highest Yield</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">APY</div>
                        <div className="text-lg font-medium text-green-600 dark:text-green-400">{protocol.apy}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">TVL</div>
                        <div className="font-medium">{protocol.tvl || 'N/A'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Deposit to Highest Yield</CardTitle>
            <CardDescription>
              Automatically deposit to the protocol with the highest APY
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Select Token</Label>
                <Select
                  disabled={isLoading || isDepositing || balances.length === 0}
                  value={selectedToken}
                  onValueChange={handleTokenChange}
                >
                  <SelectTrigger id="token">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {balances.map((token, idx) => (
                      <SelectItem key={idx} value={token.symbol}>
                        <div className="flex items-center">
                          <span className="mr-2">{token.icon || '💰'}</span>
                          <span>{token.symbol} ({token.balance})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={isLoading || isDepositing || balances.length === 0}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2"
                    onClick={() => {
                      const token = balances.find(t => t.symbol === selectedToken)
                      if (token) setDepositAmount(token.balance.replace(/,/g, ''))
                    }}
                    disabled={isLoading || isDepositing || balances.length === 0}
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {showSuccessMessage && (
                <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    <div>{successMessage}</div>
                    {transactionHash && (
                      <div className="mt-2 text-xs">
                        <span className="font-medium">Transaction Hash:</span>
                        <a 
                          href={`https://basescan.org/tx/${transactionHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {transactionHash}
                        </a>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                className="w-full"
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || isLoading || balances.length === 0 || !selectedToken}
              >
                {isDepositing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Deposit to Highest Yield</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Your Assets</CardTitle>
            <CardDescription>
              Current balances in your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : balances.length > 0 ? (
              <div className="space-y-3">
                {balances.map((token, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${token.color || 'from-gray-500 to-gray-700'} flex items-center justify-center mr-2`}>
                        <span>{token.icon || '💰'}</span>
                      </div>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.balance}</div>
                      </div>
                    </div>
                    <div className="font-medium">${token.usdValue || '0.00'}</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No assets found. Connect your wallet to see your balances.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
} 