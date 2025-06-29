"use client"

import { ExternalLink } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "./WalletProvider"

export function WalletDetails() {
  const { isConnected, address, balance } = useWallet()

  if (!isConnected || !address) {
    return null
  }

  // Determine the correct Etherscan URL (assuming Ethereum mainnet)
  const etherscanUrl = `https://etherscan.io/address/${address}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Details</CardTitle>
        <CardDescription>Your connected wallet information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Address</div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-sm truncate">{address}</div>
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground">Network</div>
          <div>Ethereum</div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground">Balance</div>
          <div>{balance}</div>
        </div>
      </CardContent>
    </Card>
  )
}

