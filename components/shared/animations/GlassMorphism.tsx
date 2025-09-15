'use client'

import { ReactNode } from 'react'

interface GlassMorphismProps {
  children: ReactNode
  className?: string
  blur?: number
  opacity?: number
  border?: boolean
  glow?: boolean
}

export default function GlassMorphism({ 
  children, 
  className = '', 
  blur = 10, 
  opacity = 0.1, 
  border = true,
  glow = false 
}: GlassMorphismProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        border: border ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
        boxShadow: glow 
          ? '0 8px 32px rgba(31, 38, 135, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.18)' 
          : '0 8px 32px rgba(31, 38, 135, 0.37)',
      }}
    >
      {children}
    </div>
  )
}
