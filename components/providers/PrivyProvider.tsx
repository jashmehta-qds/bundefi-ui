"use client";

import { PrivyProvider as PrivyAuthProvider } from '@privy-io/react-auth';
import { useTheme } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  // Replace with your actual Privy app ID from the Privy dashboard
  const PRIVY_APP_ID = "cm8dd9lf700iuu3r9lfzc24om";
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the theme - default to 'light' during SSR to match initial render
  const privyTheme = mounted ? (resolvedTheme === 'dark' ? 'dark' : 'light') : 'light';

  return (
    <PrivyAuthProvider
      appId={PRIVY_APP_ID}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: privyTheme,
          accentColor: '#676FFF',
          logo: '/logo.png', // Update with your actual logo path
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        // Configure login methods
        loginMethods: ['email', 'wallet'],
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
} 