"use client"

import { ArrowRight, ArrowUpRight, Coins, DollarSign, LineChart, Percent, Wallet } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("assets")

  return (
    <div className="w-full max-w-[600px] rounded-lg border bg-background shadow-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <Button size="sm">
            <Wallet className="mr-2 h-4 w-4" />
            Connected
          </Button>
        </div>
        <div className="grid gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Value</CardTitle>
              <CardDescription>Your portfolio performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">$24,568.80</div>
                <div className="flex items-center text-emerald-500">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="mt-4 h-[80px] w-full">
                <div className="flex h-full items-end gap-2">
                  {[40, 30, 45, 25, 55, 50, 60, 35, 45, 55, 65, 40].map((height, i) => (
                    <div key={i} className="w-full bg-primary/20 rounded-sm" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="assets" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="yields">Yields</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current APY</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Percent className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">12.8%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">$1,245</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary" />
                      <span>ETH</span>
                    </div>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
                      <span>USDC</span>
                    </div>
                    <span>30%</span>
                  </div>
                  <Progress value={30} className="h-2 bg-muted [&>*]:bg-blue-500" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                      <span>WBTC</span>
                    </div>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2 bg-muted [&>*]:bg-green-500" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="assets" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Your Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Coins className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.amount} {asset.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${asset.value.toLocaleString()}</div>
                        <div className={`text-xs ${asset.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {asset.change >= 0 ? "+" : ""}
                          {asset.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="yields" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Yield Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {yields.map((yield_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <LineChart className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{yield_.protocol}</div>
                          <div className="text-xs text-muted-foreground">{yield_.asset}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-emerald-500">{yield_.apy}% APY</div>
                        <div className="text-xs text-muted-foreground">{yield_.risk} Risk</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-6">
          <Button className="w-full">
            {activeTab === "overview" ? "Deposit Assets" : activeTab === "assets" ? "Manage Assets" : "Optimize Yields"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const assets = [
  {
    name: "Ethereum",
    symbol: "ETH",
    amount: 4.5,
    value: 12500,
    change: 2.3,
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    amount: 7500,
    value: 7500,
    change: 0.1,
  },
  {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    amount: 0.15,
    value: 4500,
    change: -1.2,
  },
]

const yields = [
  {
    protocol: "Aave",
    asset: "ETH",
    apy: 4.2,
    risk: "Low",
  },
  {
    protocol: "Compound",
    asset: "USDC",
    apy: 5.8,
    risk: "Low",
  },
  {
    protocol: "Curve",
    asset: "stETH/ETH",
    apy: 8.5,
    risk: "Medium",
  },
  {
    protocol: "Yearn",
    asset: "USDC",
    apy: 12.3,
    risk: "Medium",
  },
]

