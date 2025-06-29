import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "../globals.css"

import { PrivyProvider, ThemeProvider } from "@/components/providers"
import { SiteHeader } from "@/components/shared/layout"
import { Toaster } from "@/components/ui/toaster"
import { BalancesProvider, NetworkProvider } from "@/lib/contexts"
import { memo } from 'react'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BunDefi - Smarter Yields",
  icons: {
    icon: "/logo.png",
  },
  description: "Maximize your DeFi yields automatically across multiple protocols",
}

// Memoize the header to prevent unnecessary re-renders
const MemoizedHeader = memo(SiteHeader)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PrivyProvider>
          <NetworkProvider>
            <BalancesProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <MemoizedHeader />
                {children}
                <Toaster />
              </ThemeProvider>
            </BalancesProvider>
          </NetworkProvider>
        </PrivyProvider>
      </body>
    </html>
  )
}