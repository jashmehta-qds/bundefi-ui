"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileNav, Notifications } from "@/components/shared/layout";
import { ConnectWalletButton, NetworkSelector } from "@/components/shared/wallet";
import { HomeIcon, Zap } from "lucide-react";
import Image from "next/image";

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-secondary-200/20 backdrop-blur supports-[backdrop-filter]:bg-secondary-800/80">
      <div className="container relative flex h-16 items-center">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 transition-all duration-300" />
          
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">
                BunDefi
              </span>
              <span className="text-xs text-secondary-300 -mt-1 hidden sm:block">
                Smarter Yields
              </span>
            </div>
          </Link>
        </div>

        {/* Absolutely Centered Navigation */}
        <nav className="hidden md:flex items-center gap-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link
            href="/dashboard"
            className={`relative px-4 py-2 text-sm font-medium rounded-md group ${
              isActive("/dashboard")
                ? "text-primary-400 border-2 border-b-4 border-primary-400"
                : "text-secondary-300 hover:text-white hover:bg-secondary-700/30"
            }`}
          >
            <span className="relative z-10">
              <HomeIcon className="h-5 w-5" />
            </span>
            <div
              className={`absolute inset-0 bg-transparent transition-opacity duration-200 rounded-l ${
                isActive("/dashboard") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />
          </Link>
          <Link
            href="/automation"
            className={`relative px-4 py-2 text-sm font-medium rounded-md group ${
              isActive("/automation")
                ? "text-primary-400 border-2 border-b-4 border-primary-400"
                : "text-secondary-300 hover:text-white hover:bg-secondary-700/30"
            }`}
          >
            <span className="relative z-10">
              <Zap className="h-5 w-5" />
            </span>
            <div
              className={`absolute inset-0 bg-transparent transition-opacity duration-200 rounded-md ${
                isActive("/automation") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />
          </Link>
        </nav>

        {/* Wallet Section */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-3">
            <NetworkSelector />
            <Notifications />
            <ConnectWalletButton />
          </div>
          <MobileNav />
        </div>
      </div>

      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </header>
  );
}
