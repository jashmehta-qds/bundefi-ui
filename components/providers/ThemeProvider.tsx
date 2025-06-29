'use client'

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * Force light theme during SSR to match the initial client render,
   * prevents the dark mode class from being applied server-side causing hydration mismatch
   */
  return (
    <NextThemesProvider {...props} forcedTheme={mounted ? undefined : 'light'}>
      {children}
    </NextThemesProvider>
  )
}
