'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import ElectricityEffect from './ElectricityEffect'
import GlassMorphism from './GlassMorphism'
import { Shield, Workflow, LineChart } from 'lucide-react'

export default function HeroLanding() {
  const [isGlowing, setIsGlowing] = useState(false)
  const [showElectricity, setShowElectricity] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Pre-generate particle positions to prevent re-rendering - only on client
  const particles = useMemo(() => {
    if (!isClient) return []
    
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      transform: `translateY(${Math.random() * 20 - 10}px)`,
    }))
  }, [isClient])

  useEffect(() => {
    // Set initial loaded state immediately to prevent white flash
    setIsLoaded(true)
    
    // Start the animation sequence with a smoother delay
    const timer = setTimeout(() => {
      setShowElectricity(true)
      setAnimationPhase(1)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const handleElectricityComplete = () => {
    setIsGlowing(true)
    setAnimationPhase(2)
  }

  const handleGlowEnd = () => {
    setIsGlowing(false)
    setAnimationPhase(3)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Floating particles - fixed positions to prevent re-rendering - only on client */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={`absolute w-1 h-1 bg-primary-500/30 rounded-full animate-pulse transition-opacity duration-1000 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
                transform: particle.transform,
              }}
            />
          ))}
        </div>
      )}

      {/* Electricity effect */}
      {showElectricity && (
        <ElectricityEffect
          targetX={0.5}
          targetY={0.45}
          boltCount={6}
          boltSpeed={2}
          boltLifetime={2500}
          onComplete={handleElectricityComplete}
        />
      )}

      {/* Main content - always rendered with smooth opacity transitions */}
      <div className={`hero-content relative z-10 text-center px-4 max-w-6xl mx-auto transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Hero title */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="text-gray-900">
              Smart. Automated. Secure.
            </span>
       
           
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Navigate the entire DeFi ecosystem across 15+ blockchains with 
            <span className="text-primary-600 font-semibold"> intelligent routing</span> and 
            <span className="text-accent-500 font-semibold"> automated strategies</span>
          </p>
        </div>

        {/* Feature highlights - always rendered with smooth transitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <GlassMorphism 
            className={`p-6 rounded-2xl transition-all duration-1000 ${
              animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} 
            opacity={0.1} 
            glow={animationPhase >= 2}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Non-Custodial</h3>
            <p className="text-gray-600 text-sm">Your funds stay in your wallet with industry-leading security</p>
          </GlassMorphism>

          <GlassMorphism 
            className={`p-6 rounded-2xl transition-all duration-1000 delay-200 ${
              animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} 
            opacity={0.1} 
            glow={animationPhase >= 2}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Workflow className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Intelligent Automation</h3>
            <p className="text-gray-600 text-sm">Set up automated strategies that optimize your yields 24/7</p>
          </GlassMorphism>

          <GlassMorphism 
            className={`p-6 rounded-2xl transition-all duration-1000 delay-400 ${
              animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} 
            opacity={0.1} 
            glow={animationPhase >= 2}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <LineChart className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unified Dashboard</h3>
            <p className="text-gray-600 text-sm">Track all your positions across chains in one place</p>
          </GlassMorphism>
        </div>

        {/* Stats - always rendered with smooth transitions */}
        <div className={`mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-600 ${
          animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">15+</div>
            <div className="text-gray-500 text-sm">Blockchains</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">200+</div>
            <div className="text-gray-500 text-sm">Protocols</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent-600 mb-2">$50M+</div>
            <div className="text-gray-500 text-sm">TVL</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">10K+</div>
            <div className="text-gray-500 text-sm">Users</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - always rendered */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 delay-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="w-6 h-10 border-2 border-primary-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-500 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
