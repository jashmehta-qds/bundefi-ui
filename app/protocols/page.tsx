"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { SiteFooter, SiteHeader } from "@/components/shared/layout"
import { useWallet } from "@/components/shared/wallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useProtocols } from "@/lib/hooks"
import { Pool } from "@/types/protocols"

type SortOption = 'tvl' | 'apy';

export default function Protocols() {
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const { protocols, loading, error, refetch, lastUpdated } = useProtocols()
  const [sortOption, setSortOption] = useState<SortOption>('tvl')

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading protocols",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleProtocolAction = (protocolName: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to interact with protocols.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Action initiated",
      description: `Connecting to ${protocolName}...`,
    })
  }
  
  // Sort pools based on the selected option
  const sortPools = (pools: Pool[]) => {
    return [...pools].sort((a, b) => 
      sortOption === 'tvl' 
        ? b.tvl - a.tvl 
        : b.apy - a.apy
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container py-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Protocols</h1>
              <p className="text-muted-foreground">Explore integrated DeFi protocols and their yields</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-background rounded-md p-1">
                <Button 
                  variant={sortOption === 'tvl' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setSortOption('tvl')}
                  className="text-xs"
                >
                  Sort by TVL
                </Button>
                <Button 
                  variant={sortOption === 'apy' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setSortOption('apy')}
                  className="text-xs"
                >
                  Sort by APY
                </Button>
              </div>
              {lastUpdated && (
                <div className="text-xs text-muted-foreground flex items-center">
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                  <Button variant="ghost" size="sm" className="ml-2" onClick={() => refetch()}>
                    <RefreshIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="h-6 w-1/3 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="h-6 w-1/3 bg-muted rounded animate-pulse"></div>
                        </div>
                        <div>
                          <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="h-6 w-1/3 bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div>
                        <div className="h-4 w-1/3 bg-muted rounded animate-pulse mb-2"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                          <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2 mt-auto">
                    <div className="h-9 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-9 w-full bg-muted rounded animate-pulse"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {protocols.map((protocol, index) => (
                <Card key={index} className="overflow-hidden flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <div className="text-lg font-bold">{protocol.name.charAt(0)}</div>
                      </div>
                      <CardTitle>{protocol.name}</CardTitle>
                    </div>
                    <CardDescription>{protocol.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Type</div>
                          <div className="font-medium">{protocol.type}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">TVL</div>
                          <div className="font-medium">${protocol.tvl.toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {sortOption === 'tvl' ? 'Top Markets by TVL' : 'Top Markets by APY'}
                        </div>
                        <div className="space-y-2">
                          {sortPools(protocol.pools).slice(0, 4).map((pool, yIndex) => (
                            <div key={yIndex} className="flex items-center justify-between">
                              <div className="text-sm">{pool.name}</div>
                              <div className="text-sm font-medium text-emerald-500">{pool.apy.toFixed(2)}% APY</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2 mt-auto">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/protocols/${protocol.id}`}>View Details</Link>
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleProtocolAction(protocol.name)}>
                      Deposit
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Protocol Comparison</h2>
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-4">Protocol</th>
                        <th className="text-left pb-4">Type</th>
                        <th className="text-right pb-4">TVL</th>
                        <th className="text-right pb-4">Avg. APY</th>
                        <th className="text-right pb-4">Risk Level</th>
                        <th className="text-right pb-4">Integrated Since</th>
                      </tr>
                    </thead>
                    <tbody>
                      {protocols.map((protocol, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                <div className="text-lg font-bold">{protocol.name.charAt(0)}</div>
                              </div>
                              <div className="font-medium">{protocol.name}</div>
                            </div>
                          </td>
                          <td className="py-4">{protocol.type}</td>
                          <td className="text-right py-4">${protocol.tvl.toLocaleString()}</td>
                          <td className="text-right py-4 text-emerald-500">{protocol.avgApy.toFixed(2)}%</td>
                          <td className="text-right py-4">{protocol.riskLevel}</td>
                          <td className="text-right py-4">{protocol.integratedSince}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

