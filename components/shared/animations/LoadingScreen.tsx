'use client'

import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

interface LoadingScreenProps {
  onComplete: () => void
  minDuration?: number
}

export default function LoadingScreen({ onComplete, minDuration = 1500 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 100)
        
        if (newProgress >= 100) {
          clearInterval(interval)
          
          // Ensure minimum duration
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, minDuration - elapsed)
          
          setTimeout(() => {
            setIsComplete(true)
            setTimeout(onComplete, 500) // Fade out delay
          }, remaining)
        }
        
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [onComplete, minDuration])

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-secondary-900 to-slate-900 transition-opacity duration-500 ${
      isComplete ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-primary-600/10 to-primary-600/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.05),transparent_50%)] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Zap className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          <span className="text-white">
            BunDefi
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg mb-8 text-center max-w-md">
          Loading cross-chain DeFi protocol...
        </p>

        {/* Progress bar */}
        <div className="w-64 md:w-80 bg-gray-800 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress text */}
        <p className="text-gray-500 text-sm">
          {Math.round(progress)}% complete
        </p>

        {/* Loading dots */}
        <div className="flex space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
