'use client'

import { useEffect, useRef, useState } from 'react'

interface LightningBolt {
  id: number
  startX: number
  startY: number
  endX: number
  endY: number
  points: { x: number; y: number }[]
  progress: number
  opacity: number
  color: string
  thickness: number
}

interface ElectricityEffectProps {
  targetX?: number
  targetY?: number
  boltCount?: number
  boltSpeed?: number
  boltLifetime?: number
  onComplete?: () => void
}

export default function ElectricityEffect({ 
  targetX = 0.5, 
  targetY = 0.5, 
  boltCount = 4, 
  boltSpeed = 3, 
  boltLifetime = 2000,
  onComplete 
}: ElectricityEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bolts, setBolts] = useState<LightningBolt[]>([])
  const boltIdRef = useRef(0)
  const completedBoltsRef = useRef(0)

  const colors = [
    'rgb(59, 130, 246)', // primary-500
    'rgb(37, 99, 235)', // primary-600
    'rgb(29, 78, 216)', // primary-700
    'rgb(30, 64, 175)', // primary-800
    'rgb(30, 58, 138)', // primary-900
    'rgb(147, 197, 253)', // primary-300
  ]

  const generateLightningPath = (startX: number, startY: number, endX: number, endY: number) => {
    const points = [{ x: startX, y: startY }]
    const segments = 8
    const maxDeviation = 50

    for (let i = 1; i < segments; i++) {
      const t = i / segments
      const baseX = startX + (endX - startX) * t
      const baseY = startY + (endY - startY) * t
      
      const deviationX = (Math.random() - 0.5) * maxDeviation
      const deviationY = (Math.random() - 0.5) * maxDeviation
      
      points.push({
        x: baseX + deviationX,
        y: baseY + deviationY
      })
    }
    
    points.push({ x: endX, y: endY })
    return points
  }

  const createBolt = () => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.width * targetX
    const centerY = rect.height * targetY
    
    // Generate start position from one of the four edges
    const edge = Math.floor(Math.random() * 4)
    let startX = 0, startY = 0
    
    switch (edge) {
      case 0: // top
        startX = Math.random() * rect.width
        startY = -50
        break
      case 1: // right
        startX = rect.width + 50
        startY = Math.random() * rect.height
        break
      case 2: // bottom
        startX = Math.random() * rect.width
        startY = rect.height + 50
        break
      case 3: // left
        startX = -50
        startY = Math.random() * rect.height
        break
    }
    
    const points = generateLightningPath(startX, startY, centerX, centerY)
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    const newBolt: LightningBolt = {
      id: boltIdRef.current++,
      startX,
      startY,
      endX: centerX,
      endY: centerY,
      points,
      progress: 0,
      opacity: 1,
      color,
      thickness: 2 + Math.random() * 3,
    }

    setBolts(prev => [...prev, newBolt])

    // Remove bolt after lifetime
    setTimeout(() => {
      setBolts(prev => prev.filter(bolt => bolt.id !== newBolt.id))
      completedBoltsRef.current++
      
      if (completedBoltsRef.current >= boltCount && onComplete) {
        onComplete()
      }
    }, boltLifetime)
  }

  useEffect(() => {
    // Create initial bolts with staggered timing
    for (let i = 0; i < boltCount; i++) {
      setTimeout(() => createBolt(), i * 200)
    }
  }, [boltCount])

  useEffect(() => {
    const interval = setInterval(() => {
      setBolts(prev => 
        prev.map(bolt => ({
          ...bolt,
          progress: Math.min(1, bolt.progress + boltSpeed / 100),
          opacity: Math.max(0, 1 - bolt.progress),
        }))
      )
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [boltSpeed])

  const renderLightningPath = (bolt: LightningBolt) => {
    const visiblePoints = bolt.points.slice(0, Math.floor(bolt.points.length * bolt.progress))
    
    if (visiblePoints.length < 2) return null

    const pathData = visiblePoints.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      return `L ${point.x} ${point.y}`
    }).join(' ')

    return (
      <path
        key={bolt.id}
        d={pathData}
        stroke={bolt.color}
        strokeWidth={bolt.thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={bolt.opacity}
        filter={`drop-shadow(0 0 8px ${bolt.color}) drop-shadow(0 0 16px ${bolt.color})`}
      />
    )
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
    >
      <svg className="w-full h-full" style={{ minHeight: '100vh' }}>
        {bolts.map(renderLightningPath)}
      </svg>
    </div>
  )
}
