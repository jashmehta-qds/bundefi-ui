"use client"

import { Bell, CreditCard, Lock, LogOut, Settings, User } from "lucide-react"
import { useState } from "react"

import { SiteFooter, SiteHeader } from "@/components/shared/layout"
import { useWallet } from "@/components/shared/wallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()

  const [gasPreference, setGasPreference] = useState("normal")
  const [slippageTolerance, setSlippageTolerance] = useState("0.5")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSaveSettings = () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to save settings.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container py-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and settings</p>
            </div>
          </div>

          <Tabs defaultValue="general">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/4">
                <TabsList className="flex flex-col h-auto bg-transparent p-0 justify-start">
                  <TabsTrigger value="general" className="justify-start w-full mb-1 data-[state=active]:bg-muted">
                    <Settings className="h-4 w-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="account" className="justify-start w-full mb-1 data-[state=active]:bg-muted">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start w-full mb-1 data-[state=active]:bg-muted">
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start w-full mb-1 data-[state=active]:bg-muted">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="justify-start w-full mb-1 data-[state=active]:bg-muted">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="md:w-3/4">
                <TabsContent value="general" className="m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>Manage your general application preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <div className="flex items-center justify-between">
                          <span>Dark Mode</span>
                          <Switch checked={darkMode} onCheckedChange={setDarkMode} id="theme" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select id="language" className="w-full p-2 rounded-md border" defaultValue="en">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Display Currency</Label>
                        <select id="currency" className="w-full p-2 rounded-md border" defaultValue="usd">
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                          <option value="gbp">GBP (£)</option>
                          <option value="jpy">JPY (¥)</option>
                        </select>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleSaveSettings}>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="account" className="m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-address">Wallet Address</Label>
                        <div className="flex items-center gap-2">
                          <Input id="wallet-address" value={address || "Not connected"} readOnly />
                          <Button variant="outline" size="sm">
                            Copy
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="your@email.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="Your username" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleSaveSettings}>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Transaction Signing</Label>
                        <div className="flex items-center justify-between">
                          <span>Require confirmation for all transactions</span>
                          <Switch defaultChecked id="tx-signing" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Two-Factor Authentication</Label>
                        <div className="flex items-center justify-between">
                          <span>Enable 2FA for additional security</span>
                          <Switch id="2fa" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gas-preference">Gas Price Preference</Label>
                        <RadioGroup id="gas-preference" value={gasPreference} onValueChange={setGasPreference}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="slow" id="gas-slow" />
                            <Label htmlFor="gas-slow">Slow (Cheaper)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="gas-normal" />
                            <Label htmlFor="gas-normal">Normal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fast" id="gas-fast" />
                            <Label htmlFor="gas-fast">Fast (More Expensive)</Label>
                            <Label htmlFor="gas-fast">Fast (More Expensive)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
                        <Input
                          id="slippage"
                          type="number"
                          value={slippageTolerance}
                          onChange={(e) => setSlippageTolerance(e.target.value)}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleSaveSettings}>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Email Notifications</Label>
                        <div className="flex items-center justify-between">
                          <span>Receive email notifications</span>
                          <Switch
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                            id="email-notifications"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Push Notifications</Label>
                        <div className="flex items-center justify-between">
                          <span>Receive push notifications</span>
                          <Switch
                            checked={pushNotifications}
                            onCheckedChange={setPushNotifications}
                            id="push-notifications"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Notification Types</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Deposit/Withdrawal Confirmations</span>
                            <Switch defaultChecked id="tx-notifications" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Yield Updates</span>
                            <Switch defaultChecked id="yield-notifications" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Protocol Alerts</span>
                            <Switch defaultChecked id="protocol-notifications" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Marketing & Promotions</span>
                            <Switch id="marketing-notifications" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleSaveSettings}>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="billing" className="m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Settings</CardTitle>
                      <CardDescription>Manage your subscription and payment methods</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-medium">Current Plan</h3>
                        <div className="bg-muted p-4 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">Free Plan</div>
                              <div className="text-sm text-muted-foreground">Basic features with standard limits</div>
                            </div>
                            <Button variant="outline">Upgrade</Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Payment Methods</h3>
                        <div className="bg-muted p-4 rounded-md">
                          <div className="text-center text-muted-foreground">No payment methods added yet</div>
                        </div>
                        <Button variant="outline" className="w-full mt-2">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Add Payment Method
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Billing History</h3>
                        <div className="bg-muted p-4 rounded-md">
                          <div className="text-center text-muted-foreground">No billing history available</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cancel Subscription
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

