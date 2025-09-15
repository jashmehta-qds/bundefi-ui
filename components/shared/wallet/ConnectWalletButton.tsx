"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useLogout } from "@/lib/hooks/useLogout"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ChevronDown, LogOut, Wallet } from "lucide-react"
import { useState } from "react"

export function ConnectWalletButton() {
  const { toast } = useToast()
  const { login, logout, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [showOptions, setShowOptions] = useState(false)
  const { clearAllStates } = useLogout()
  
  const address = wallets.length > 0 ? wallets[0].address : null
  const network = wallets.length > 0 ? wallets[0].chainId : null
  
  // Helper to get network logo and name
  const getNetworkInfo = (chainId: string | null) => {
    if (!chainId) return { logo: "🔄", name: "Unknown" }
    
    // Map chainIds to their logos and names - extend this map as needed
    const networks: Record<string, { logo: string, name: string }> = {
      "0x38": { logo: "BSC", name: "Binance Smart Chain" },
      "0x1": { logo: "ETH", name: "Ethereum Mainnet" },
      "0x89": { logo: "MATIC", name: "Polygon" },
      // Add more networks as needed
    }
    
    return networks[chainId] || { logo: "🔄", name: "Unknown" }
  }
  
  const networkInfo = getNetworkInfo(network)

  const handleConnect = async () => {
    try {
      clearAllStates()
      login()
      if (address) {
        // Create a transaction record when the wallet is connected
        // await createTransaction(address, 'connect', 0)
      }

      toast({
        title: 'Wallet connected',
        description: address
          ? `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`
          : 'Wallet connected successfully',
        variant: null,
      })
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = async () => {
    try {
      // Clear all states before logout
      clearAllStates()
      
      // Perform logout
      await logout()
      
      // Close the dropdown
      setShowOptions(false)
      
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected and all data cleared.",
      })
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error)
      toast({
        title: 'Disconnect failed',
        description: error.message || 'Failed to disconnect wallet. Please try again.',
        variant: 'destructive',
      })
    }
  }
  
  const handleNetworkChange = () => {
    // Implement network switching logic here
    // This will depend on how Privy handles network switching
    setShowOptions(false)
    toast({
      title: "Network change",
      description: "Network switching functionality to be implemented",
    })
  }

  // Check if user is authenticated AND has a wallet address
  const isConnected = authenticated && address

  if (isConnected) {
    return (
      <div className="relative">
        <Button 
          variant="outline" 
          size="lg" 
          className="h-10 flex items-center gap-2 bg-transparent"
          onClick={() => setShowOptions(!showOptions)}
          onBlur={() => setTimeout(() => setShowOptions(false), 100)}
        >
          <Wallet className="h-4 w-4" />
          <span>{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        {showOptions && (
          <div className="absolute right-0 mt-2 w-full bg-white/90 backdrop-blur-sm rounded-md shadow-lg z-50 py-1 border border-gray-200">
            <button 
              className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100 "
              onClick={handleDisconnect}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Button variant="outline" size="lg" className="h-10 bg-primary-200/30 text-white" onClick={handleConnect}>
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  )
}

