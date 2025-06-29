"use client"

import { ArrowLeft, ArrowUpRight, Coins, LineChart } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { SiteFooter, SiteHeader } from "@/components/shared/layout"
import { useWallet } from "@/components/shared/wallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getProtocolById } from "@/lib/services"
import { Pool, Protocol } from "@/types/protocols"

type SortOption = 'tvl' | 'apy';

export default function ProtocolDetail() {
  const params = useParams()
  const protocolId = params.id as string
  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState<SortOption>('tvl')

  const { isConnected } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProtocolDetails() {
      try {
        const data = await getProtocolById(protocolId);
        setProtocol(data || null);
      } catch (error) {
        console.error("Failed to fetch protocol details:", error);
        toast({
          title: "Error loading protocol",
          description: "Could not load protocol details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProtocolDetails();
  }, [protocolId, toast]);

  const handleDeposit = (asset: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deposit assets.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Deposit initiated",
      description: `Preparing to deposit to ${protocol?.name} ${asset} pool...`,
    })
  }

  // Separate pools into single and multi-pair categories
  const categorizedPools = protocol?.pools ? {
    singlePair: protocol.pools.filter(pool => !pool.tokenAddresses || pool.tokenAddresses.length <= 1),
    multiPair: protocol.pools.filter(pool => pool.tokenAddresses && pool.tokenAddresses.length > 1)
  } : { singlePair: [], multiPair: [] };

  // Sort pools based on the selected option
  const sortPools = (pools: Pool[]) => {
    return [...pools].sort((a, b) => 
      sortOption === 'tvl' 
        ? b.tvl - a.tvl 
        : b.apy - a.apy
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 bg-muted/40">
          <div className="container py-6 md:py-8">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-muted rounded mb-8"></div>
              <div className="flex justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted"></div>
                  <div>
                    <div className="h-8 w-64 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-40 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-3 mb-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-card rounded-lg p-6">
                    <div className="h-4 w-24 bg-muted rounded mb-4"></div>
                    <div className="h-8 w-32 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-lg p-6 mb-6">
                <div className="h-6 w-48 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-2/3 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 bg-muted/40">
          <div className="container py-6 md:py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Protocol Not Found</h2>
              <p className="text-muted-foreground mb-6">The protocol you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link href="/protocols">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Protocols
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container py-6 md:py-8">
          <div className="mb-6">
            <Link
              href="/protocols"
              className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Protocols
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  {protocol.icon || <div className="text-lg font-bold">{protocol.name.charAt(0)}</div>}
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{protocol.name}</h1>
                  <p className="text-muted-foreground">{protocol.type} Protocol</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  Protocol Website
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
                <Button>
                  <Coins className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${protocol.tvl.toLocaleString()}</div>
                <div className="flex items-center text-xs text-emerald-500">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>+5.2% from last month</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average APY</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{protocol.avgApy.toFixed(2)}%</div>
                <div className="flex items-center text-xs text-emerald-500">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>+0.8% from last week</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{protocol.riskLevel}</div>
                <div className="text-xs text-muted-foreground">Based on our risk assessment model</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {protocol.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{protocol.description}</p>
                {protocol.longDescription && (
                  <p className="text-muted-foreground mt-4">{protocol.longDescription}</p>
                )}

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {protocol.features && protocol.features.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Key Features</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {protocol.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium mb-2">Integration Details</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Integrated since: {protocol.integratedSince}</li>
                      {protocol.supportedAssets && <li>Supported assets: {protocol.supportedAssets.slice(0,100)}...</li>}
                      {protocol.auditedBy && <li>Audited by: {protocol.auditedBy}</li>}
                      <li>
                        Smart contract: <span className="text-primary">View on Etherscan</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="pools">
              <TabsList>
                <TabsTrigger value="pools">Available Pools</TabsTrigger>
                <TabsTrigger value="strategies">Strategies</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              <TabsContent value="pools" className="mt-4">
                <div className="flex justify-end mb-4">
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
                </div>

                {categorizedPools.singlePair.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Lending / Borrowing</CardTitle>
                      <CardDescription>Single-asset pools for lending and borrowing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left pb-4">Asset</th>
                              <th className="text-right pb-4">TVL</th>
                              <th className="text-right pb-4">APY</th>
                              <th className="text-right pb-4">Risk</th>
                              <th className="text-right pb-4">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortPools(categorizedPools.singlePair).map((pool, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="py-4">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                      <Coins className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{pool.name}</div>
                                      <div className="text-xs text-muted-foreground">{pool.type}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right py-4">
                                  <div className="font-medium">${pool.tvl.toLocaleString()}</div>
                                </td>
                                <td className="text-right py-4">
                                  <div className="font-medium text-emerald-500">{pool.apy.toFixed(2)}%</div>
                                </td>
                                <td className="text-right py-4">
                                  <div className="font-medium">{pool.risk}</div>
                                </td>
                                <td className="text-right py-4">
                                  <Button size="sm" onClick={() => handleDeposit(pool.name)}>
                                    Deposit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {categorizedPools.multiPair.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Liquidity Provisioning</CardTitle>
                      <CardDescription>Multi-asset pools for liquidity provision</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left pb-4">Pool</th>
                              <th className="text-right pb-4">TVL</th>
                              <th className="text-right pb-4">APY</th>
                              <th className="text-right pb-4">Risk</th>
                              <th className="text-right pb-4">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortPools(categorizedPools.multiPair).map((pool, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="py-4">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                      <Coins className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{pool.name}</div>
                                      <div className="text-xs text-muted-foreground">{pool.type}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right py-4">
                                  <div className="font-medium">${pool.tvl.toLocaleString()}</div>
                                </td>
                                <td className="text-right py-4">
                                  <div className="font-medium text-emerald-500">{pool.apy.toFixed(2)}%</div>
                                </td>
                                <td className="text-right py-4">
                                  <div className="font-medium">{pool.risk}</div>
                                </td>
                                <td className="text-right py-4">
                                  <Button size="sm" onClick={() => handleDeposit(pool.name)}>
                                    Deposit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {categorizedPools.singlePair.length === 0 && categorizedPools.multiPair.length === 0 && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">
                        <p className="text-muted-foreground">No pools available for this protocol.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="strategies" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>BunDefi Strategies</CardTitle>
                    <CardDescription>Our optimized strategies using this protocol</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {protocol.strategies && protocol.strategies.length > 0 ? (
                        protocol.strategies.map((strategy, index) => (
                          <div
                            key={index}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <LineChart className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{strategy.name}</div>
                                <div className="text-sm text-muted-foreground">{strategy.description}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:gap-8">
                              <div>
                                <div className="text-sm text-muted-foreground">Expected APY</div>
                                <div className="font-medium text-emerald-500">{strategy.expectedApy || strategy.apy}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Risk Level</div>
                                <div className="font-medium">{strategy.risk}</div>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleDeposit(strategy.name)}>
                              Use Strategy
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No strategies available for this protocol yet.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="performance" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Performance</CardTitle>
                    <CardDescription>APY trends over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <div className="flex h-full items-end gap-2">
                        {[
                          40, 42, 45, 43, 46, 48, 50, 49, 47, 45, 48, 50, 52, 54, 53, 55, 57, 58, 56, 55, 57, 59, 60,
                        ].map((height, i) => (
                          <div
                            key={i}
                            className="w-full bg-primary/20 rounded-sm relative group"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {(height / 10).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-4">
                      <div>Jan</div>
                      <div>Feb</div>
                      <div>Mar</div>
                      <div>Apr</div>
                      <div>May</div>
                      <div>Jun</div>
                      <div>Jul</div>
                      <div>Aug</div>
                      <div>Sep</div>
                      <div>Oct</div>
                      <div>Nov</div>
                      <div>Dec</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

const protocolsData = [
  {
    id: "aave",
    name: "Aave",
    icon: <div className="text-lg font-bold">A</div>,
    description: "Leading decentralized lending protocol with multiple asset markets",
    longDescription:
      "Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets. It enables users to deposit cryptocurrencies into lending pools to earn interest, while allowing others to borrow from these pools by posting collateral.",
    type: "Lending",
    tvl: 5800000000,
    avgApy: 4.2,
    riskLevel: "Low",
    integratedSince: "Jan 2023",
    supportedAssets: "ETH, WBTC, USDC, DAI, USDT, LINK, and more",
    auditedBy: "OpenZeppelin, CertiK, PeckShield",
    features: [
      "Variable and stable interest rates",
      "Flash loans",
      "Collateralized borrowing",
      "Multiple asset markets",
      "Safety modules for risk mitigation",
    ],
    pools: [
      { name: "ETH", type: "Supply Market", tvl: 1200000000, apy: 3.8, risk: "Low" },
      { name: "USDC", type: "Supply Market", tvl: 980000000, apy: 4.5, risk: "Low" },
      { name: "WBTC", type: "Supply Market", tvl: 750000000, apy: 2.9, risk: "Low" },
      { name: "DAI", type: "Supply Market", tvl: 620000000, apy: 4.2, risk: "Low" },
      { name: "LINK", type: "Supply Market", tvl: 320000000, apy: 3.5, risk: "Medium" },
    ],
    strategies: [
      {
        name: "Aave ETH Lending Strategy",
        description: "Optimize ETH lending with automatic rate switching",
        expectedApy: 4.2,
        risk: "Low",
      },
      {
        name: "Aave Stablecoin Maximizer",
        description: "Rotate between stablecoins for highest yields",
        expectedApy: 5.1,
        risk: "Low",
      },
      {
        name: "Aave-Curve Stablecoin Strategy",
        description: "Combine Aave lending with Curve LP rewards",
        expectedApy: 7.8,
        risk: "Medium",
      },
    ],
  },
  {
    id: "compound",
    name: "Compound",
    icon: <div className="text-lg font-bold">C</div>,
    description: "Algorithmic money market protocol for lending and borrowing",
    longDescription:
      "Compound is an algorithmic, autonomous interest rate protocol built for developers, to unlock a universe of open financial applications. It allows users to earn interest on their cryptocurrencies by depositing them into one of several pools supported by the platform.",
    type: "Lending",
    tvl: 3200000000,
    avgApy: 5.1,
    riskLevel: "Low",
    integratedSince: "Feb 2023",
    supportedAssets: "ETH, WBTC, USDC, DAI, USDT, and more",
    auditedBy: "OpenZeppelin, Trail of Bits",
    features: [
      "Algorithmic interest rates",
      "Governance token (COMP)",
      "Collateralized borrowing",
      "Liquidity mining",
      "Community governance",
    ],
    pools: [
      { name: "ETH", type: "Supply Market", tvl: 850000000, apy: 3.5, risk: "Low" },
      { name: "USDC", type: "Supply Market", tvl: 720000000, apy: 5.2, risk: "Low" },
      { name: "DAI", type: "Supply Market", tvl: 580000000, apy: 4.9, risk: "Low" },
      { name: "WBTC", type: "Supply Market", tvl: 420000000, apy: 2.8, risk: "Low" },
      { name: "USDT", type: "Supply Market", tvl: 380000000, apy: 5.0, risk: "Low" },
    ],
    strategies: [
      {
        name: "Compound USDC Yield Strategy",
        description: "Maximize USDC yields with COMP rewards",
        expectedApy: 5.8,
        risk: "Low",
      },
      {
        name: "Compound-Aave Optimizer",
        description: "Automatically switch between protocols for best rates",
        expectedApy: 5.5,
        risk: "Low",
      },
      {
        name: "Compound Governance Maximizer",
        description: "Optimize for both yield and COMP token rewards",
        expectedApy: 6.2,
        risk: "Medium",
      },
    ],
  },
  {
    id: "curve",
    name: "Curve",
    icon: <div className="text-lg font-bold">C</div>,
    description: "Specialized AMM for stablecoin trading with low slippage",
    longDescription:
      "Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading and low risk, supplemental fee income for liquidity providers, without an opportunity cost. It allows users to trade between stablecoins with low slippage and low fee algorithms.",
    type: "DEX",
    tvl: 4100000000,
    avgApy: 8.3,
    riskLevel: "Medium",
    integratedSince: "Mar 2023",
    supportedAssets: "USDC, USDT, DAI, ETH, stETH, and more",
    auditedBy: "Trail of Bits, Quantstamp",
    features: [
      "Low slippage stablecoin swaps",
      "Liquidity provider rewards",
      "CRV token rewards",
      "Gauge system for boosted rewards",
      "Vote-escrowed governance (veCRV)",
    ],
    pools: [
      { name: "3pool (USDC/USDT/DAI)", type: "Liquidity Pool", tvl: 980000000, apy: 6.8, risk: "Low" },
      { name: "stETH/ETH", type: "Liquidity Pool", tvl: 850000000, apy: 8.5, risk: "Medium" },
      { name: "FRAX/USDC", type: "Liquidity Pool", tvl: 620000000, apy: 9.2, risk: "Medium" },
      { name: "BUSD/USDC/USDT", type: "Liquidity Pool", tvl: 480000000, apy: 7.5, risk: "Medium" },
      { name: "sBTC/WBTC", type: "Liquidity Pool", tvl: 350000000, apy: 5.8, risk: "Medium" },
    ],
    strategies: [
      {
        name: "Curve 3pool Strategy",
        description: "Stablecoin LP with boosted CRV rewards",
        expectedApy: 8.2,
        risk: "Low",
      },
      {
        name: "Curve ETH/stETH Strategy",
        description: "Liquid staking ETH with additional LP rewards",
        expectedApy: 9.5,
        risk: "Medium",
      },
      {
        name: "Curve Tricrypto Strategy",
        description: "Multi-asset exposure with enhanced yields",
        expectedApy: 12.3,
        risk: "High",
      },
    ],
  },
  {
    id: "yearn",
    name: "Yearn",
    icon: <div className="text-lg font-bold">Y</div>,
    description: "Yield aggregator that automatically moves funds for optimal returns",
    longDescription:
      "Yearn Finance is a suite of products in Decentralized Finance (DeFi) that provides yield generation, lending aggregation, and more on the Ethereum blockchain. The protocol is maintained by various independent developers and is governed by YFI token holders.",
    type: "Yield",
    tvl: 1800000000,
    avgApy: 11.5,
    riskLevel: "Medium",
    integratedSince: "Apr 2023",
    supportedAssets: "ETH, WBTC, USDC, DAI, USDT, and more",
    auditedBy: "MixBytes, ChainSecurity",
    features: [
      "Automated yield farming strategies",
      "Vault system for capital efficiency",
      "YFI governance token",
      "Cross-protocol optimization",
      "Continuous strategy updates",
    ],
    pools: [
      { name: "USDC Vault", type: "Yield Vault", tvl: 520000000, apy: 12.3, risk: "Medium" },
      { name: "ETH Vault", type: "Yield Vault", tvl: 480000000, apy: 9.8, risk: "Medium" },
      { name: "DAI Vault", type: "Yield Vault", tvl: 320000000, apy: 11.2, risk: "Medium" },
      { name: "WBTC Vault", type: "Yield Vault", tvl: 280000000, apy: 8.5, risk: "Medium" },
      { name: "USDT Vault", type: "Yield Vault", tvl: 220000000, apy: 10.8, risk: "Medium" },
    ],
    strategies: [
      {
        name: "Yearn USDC Maximizer",
        description: "Optimized USDC vault strategy with auto-compounding",
        expectedApy: 13.5,
        risk: "Medium",
      },
      {
        name: "Yearn ETH Growth Strategy",
        description: "ETH yield optimization across multiple protocols",
        expectedApy: 10.8,
        risk: "Medium",
      },
      {
        name: "Yearn Stablecoin Diversifier",
        description: "Spread risk across multiple stablecoin vaults",
        expectedApy: 12.5,
        risk: "Medium",
      },
    ],
  },
]

