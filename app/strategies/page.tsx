"use client"
import { LineChart } from "lucide-react"

import { SiteFooter, SiteHeader } from "@/components/shared/layout"
import { useWallet } from "@/components/shared/wallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function Strategies() {
  const { isConnected } = useWallet()
  const { toast } = useToast()

  const handleStrategyAction = (strategyName: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to use strategies.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Strategy action initiated",
      description: `Setting up ${strategyName}...`,
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container py-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Yield Strategies</h1>
              <p className="text-muted-foreground">Optimize your returns with our curated strategies</p>
            </div>
          </div>

          <div className="mb-8">
            <Tabs defaultValue="recommended">
              <TabsList>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="highest">Highest Yield</TabsTrigger>
                <TabsTrigger value="lowest">Lowest Risk</TabsTrigger>
              </TabsList>
              <TabsContent value="recommended" className="mt-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {recommendedStrategies.map((strategy, index) => (
                    <StrategyCard key={index} strategy={strategy} onAction={handleStrategyAction} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="popular" className="mt-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {popularStrategies.map((strategy, index) => (
                    <StrategyCard key={index} strategy={strategy} onAction={handleStrategyAction} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="highest" className="mt-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {highestYieldStrategies.map((strategy, index) => (
                    <StrategyCard key={index} strategy={strategy} onAction={handleStrategyAction} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="lowest" className="mt-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {lowestRiskStrategies.map((strategy, index) => (
                    <StrategyCard key={index} strategy={strategy} onAction={handleStrategyAction} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Strategy Comparison</h2>
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-4">Strategy</th>
                        <th className="text-left pb-4">Protocols</th>
                        <th className="text-right pb-4">Assets</th>
                        <th className="text-right pb-4">APY</th>
                        <th className="text-right pb-4">Risk Level</th>
                        <th className="text-right pb-4">TVL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStrategies.slice(0, 8).map((strategy, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                <LineChart className="h-4 w-4" />
                              </div>
                              <div className="font-medium">{strategy.name}</div>
                            </div>
                          </td>
                          <td className="py-4">{strategy.protocols.join(", ")}</td>
                          <td className="text-right py-4">{strategy.assets.join(", ")}</td>
                          <td className="text-right py-4 text-emerald-500">{strategy.apy}%</td>
                          <td className="text-right py-4">{strategy.risk}</td>
                          <td className="text-right py-4">${strategy.tvl.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Build Your Own Strategy</h2>
            <Card>
              <CardHeader>
                <CardTitle>Custom Strategy Builder</CardTitle>
                <CardDescription>Create a personalized yield strategy based on your preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-4">1. Select your risk tolerance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Conservative</span>
                        <span>Aggressive</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>

                    <h3 className="font-medium mb-4 mt-8">2. Choose your assets</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="eth" className="mr-2" defaultChecked />
                        <label htmlFor="eth">ETH</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="usdc" className="mr-2" defaultChecked />
                        <label htmlFor="usdc">USDC</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="wbtc" className="mr-2" />
                        <label htmlFor="wbtc">WBTC</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="dai" className="mr-2" />
                        <label htmlFor="dai">DAI</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">3. Select protocols</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="aave" className="mr-2" defaultChecked />
                        <label htmlFor="aave">Aave</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="compound" className="mr-2" defaultChecked />
                        <label htmlFor="compound">Compound</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="curve" className="mr-2" />
                        <label htmlFor="curve">Curve</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="yearn" className="mr-2" />
                        <label htmlFor="yearn">Yearn</label>
                      </div>
                    </div>

                    <h3 className="font-medium mb-4 mt-8">4. Strategy duration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Short-term</span>
                        <span>Long-term</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button className="w-full" onClick={() => handleStrategyAction("Custom Strategy")}>
                    Generate Custom Strategy
                  </Button>
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

interface Strategy {
  name: string
  description: string
  protocols: string[]
  assets: string[]
  apy: number
  risk: string
  tvl: number
  features: string[]
}

interface StrategyCardProps {
  strategy: Strategy
  onAction: (name: string) => void
}

function StrategyCard({ strategy, onAction }: StrategyCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <LineChart className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">{strategy.name}</CardTitle>
        </div>
        <CardDescription>{strategy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">APY</div>
              <div className="font-medium text-emerald-500">{strategy.apy}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Risk</div>
              <div className="font-medium">{strategy.risk}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Protocols</div>
            <div className="flex flex-wrap gap-1">
              {strategy.protocols.map((protocol, index) => (
                <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                  {protocol}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Assets</div>
            <div className="flex flex-wrap gap-1">
              {strategy.assets.map((asset, index) => (
                <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                  {asset}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Key Features</div>
            <ul className="text-sm list-disc pl-5">
              {strategy.features.slice(0, 2).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="pt-2 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onAction(strategy.name)}>
              Learn More
            </Button>
            <Button size="sm" className="flex-1" onClick={() => onAction(strategy.name)}>
              Use Strategy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const allStrategies: Strategy[] = [
  {
    name: "Stablecoin Yield Optimizer",
    description: "Maximize stablecoin yields across lending protocols",
    protocols: ["Aave", "Compound"],
    assets: ["USDC", "DAI"],
    apy: 5.8,
    risk: "Low",
    tvl: 12500000,
    features: ["Automatic rate switching", "Compounding interest", "Gas-optimized rebalancing"],
  },
  {
    name: "ETH Maximizer",
    description: "Optimize ETH yields with liquid staking and lending",
    protocols: ["Lido", "Aave"],
    assets: ["ETH"],
    apy: 6.2,
    risk: "Low",
    tvl: 18700000,
    features: ["Liquid staking rewards", "Additional lending yield", "Minimal impermanent loss"],
  },
  {
    name: "Curve Boosted Strategy",
    description: "Enhanced yields through Curve LP tokens and CRV rewards",
    protocols: ["Curve", "Convex"],
    assets: ["USDC", "USDT", "DAI"],
    apy: 9.5,
    risk: "Medium",
    tvl: 8900000,
    features: ["Boosted CRV rewards", "CVX staking rewards", "Optimized gauge selection"],
  },
  {
    name: "BTC Yield Strategy",
    description: "Generate yield on Bitcoin through wrapped tokens",
    protocols: ["Aave", "Yearn"],
    assets: ["WBTC"],
    apy: 4.8,
    risk: "Low",
    tvl: 7500000,
    features: ["Multiple yield sources", "Automatic compounding", "Risk diversification"],
  },
  {
    name: "Multi-Asset Yield Basket",
    description: "Diversified yield strategy across multiple assets",
    protocols: ["Aave", "Compound", "Yearn"],
    assets: ["ETH", "USDC", "WBTC"],
    apy: 7.5,
    risk: "Medium",
    tvl: 15200000,
    features: ["Asset diversification", "Protocol diversification", "Weighted optimization"],
  },
  {
    name: "Options Yield Strategy",
    description: "Enhanced yields through covered call options",
    protocols: ["Ribbon"],
    assets: ["ETH", "WBTC"],
    apy: 15.2,
    risk: "High",
    tvl: 5600000,
    features: ["Weekly option premiums", "Automated option writing", "Strike price optimization"],
  },
  {
    name: "Yearn Vault Optimizer",
    description: "Maximize returns through Yearn's auto-compounding vaults",
    protocols: ["Yearn"],
    assets: ["USDC", "ETH", "DAI"],
    apy: 12.3,
    risk: "Medium",
    tvl: 9800000,
    features: ["Auto-compounding", "Strategy diversification", "Vault rotation"],
  },
  {
    name: "Liquid Staking Maximizer",
    description: "Optimize staking yields for PoS assets",
    protocols: ["Lido", "Rocket Pool"],
    assets: ["ETH"],
    apy: 4.5,
    risk: "Low",
    tvl: 22500000,
    features: ["Staking rewards", "Token appreciation", "No lockup period"],
  },
  {
    name: "DeFi Index Strategy",
    description: "Exposure to a basket of DeFi tokens with yield",
    protocols: ["Index Coop", "Aave"],
    assets: ["DPI", "ETH"],
    apy: 8.7,
    risk: "High",
    tvl: 4200000,
    features: ["DeFi sector exposure", "Additional lending yield", "Automated rebalancing"],
  },
  {
    name: "Real Yield ETH Strategy",
    description: "Focus on sustainable yields from protocol revenue",
    protocols: ["GMX", "Gains"],
    assets: ["ETH"],
    apy: 10.5,
    risk: "Medium",
    tvl: 6800000,
    features: ["Fee-based yields", "Protocol revenue sharing", "Sustainable returns"],
  },
]

const recommendedStrategies = allStrategies.slice(0, 3)
const popularStrategies = [allStrategies[1], allStrategies[4], allStrategies[6]]
const highestYieldStrategies = [allStrategies[5], allStrategies[6], allStrategies[9]]
const lowestRiskStrategies = [allStrategies[0], allStrategies[1], allStrategies[7]]

