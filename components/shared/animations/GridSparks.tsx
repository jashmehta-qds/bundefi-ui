'use client'

import { useEffect, useRef, useState } from 'react'

interface Spark {
  id: number
  x: number
  y: number
  direction: 'horizontal' | 'vertical'
  progress: number
  speed: number
  opacity: number
  color: string
}

interface GridSparksProps {
  gridSize?: number
  sparkCount?: number
  sparkSpeed?: number
  sparkLifetime?: number
}

export default function GridSparks({ 
  gridSize = 20, 
  sparkCount = 3, 
  sparkSpeed = 2, 
  sparkLifetime = 2000 
}: GridSparksProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sparks, setSparks] = useState<Spark[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const sparkIdRef = useRef(0)
  const lastSparkTimeRef = useRef(0)

  // Theme colors using CSS custom properties
  const getThemeColors = () => {
    if (typeof window === 'undefined') return []
    
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    // Get primary and secondary colors from CSS variables
    const primaryColor = computedStyle.getPropertyValue('--primary').trim()
    const secondaryColor = computedStyle.getPropertyValue('--secondary').trim()
    const accentColor = computedStyle.getPropertyValue('--accent').trim()
    
    // Convert HSL to RGB for better compatibility
    const hslToRgb = (hsl: string) => {
      const values = hsl.split(' ').map(v => parseFloat(v))
      if (values.length < 3) return 'rgb(139, 92, 246)' // fallback purple
      
      const [h, s, l] = values
      const sPercent = s / 100
      const lPercent = l / 100
      
      const c = (1 - Math.abs(2 * lPercent - 1)) * sPercent
      const x = c * (1 - Math.abs((h / 60) % 2 - 1))
      const m = lPercent - c / 2
      
      let r = 0, g = 0, b = 0
      
      if (h >= 0 && h < 60) {
        r = c; g = x; b = 0
      } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0
      } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x
      } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c
      } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c
      } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x
      }
      
      return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`
    }
    
    return [
      hslToRgb(primaryColor),   // Primary theme color
      hslToRgb(secondaryColor), // Secondary theme color
      hslToRgb(accentColor),    // Accent theme color
      // Add some variations for visual interest
      `rgba(139, 92, 246, 0.8)`, // Purple variation
      `rgba(168, 85, 247, 0.8)`, // Purple variation 2
    ]
  }

  const snapToGrid = (x: number, y: number) => {
    const snappedX = Math.round(x / gridSize) * gridSize
    const snappedY = Math.round(y / gridSize) * gridSize
    return { x: snappedX, y: snappedY }
  }

  const createSpark = (x: number, y: number) => {
    const snapped = snapToGrid(x, y)
    const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical'
    const colors = getThemeColors()
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    const newSpark: Spark = {
      id: sparkIdRef.current++,
      x: snapped.x,
      y: snapped.y,
      direction,
      progress: 0,
      speed: sparkSpeed + Math.random() * 2,
      opacity: 1,
      color,
    }

    console.log('Creating spark:', newSpark) // Debug log
    setSparks(prev => [...prev, newSpark])

    // Remove spark after lifetime
    setTimeout(() => {
      setSparks(prev => prev.filter(spark => spark.id !== newSpark.id))
    }, sparkLifetime)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setMousePos({ x, y })
    
    // Create sparks more frequently for better visibility
    const now = Date.now()
    if (now - lastSparkTimeRef.current > 100) { // Generate a spark every 100ms
      createSpark(x, y)
      lastSparkTimeRef.current = now
    }
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Create initial sparks at cursor position
    for (let i = 0; i < sparkCount; i++) {
      setTimeout(() => createSpark(x, y), i * 100)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSparks(prev => 
        prev.map(spark => {
          const newProgress = spark.progress + spark.speed
          const maxProgress = spark.direction === 'horizontal' ? 
            (containerRef.current?.clientWidth || 0) : 
            (containerRef.current?.clientHeight || 0)
          
          // Calculate opacity based on progress
          const opacity = Math.max(0, 1 - (newProgress / maxProgress))
          
          return {
            ...spark,
            progress: newProgress,
            opacity,
          }
        }).filter(spark => spark.opacity > 0)
      )
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
    >
        {sparks.map(spark => {
          // Calculate position based on direction and progress
          let x, y
          if (spark.direction === 'horizontal') {
            x = spark.x + spark.progress
            y = spark.y
          } else {
            x = spark.x
            y = spark.y + spark.progress
          }
          
          return (
            <div
              key={spark.id}
              className="absolute pointer-events-none"
              style={{
                left: x,
                top: y,
                width: spark.direction === 'horizontal' ? `${20 + spark.opacity * 10}px` : '2px',
                height: spark.direction === 'vertical' ? `${20 + spark.opacity * 10}px` : '2px',
                backgroundColor: spark.color,
                opacity: spark.opacity,
                boxShadow: `0 0 8px ${spark.color}, 0 0 16px ${spark.color}`,
                transform: spark.direction === 'horizontal' ? 'translateY(-50%)' : 'translateX(-50%)',
                transition: 'opacity 0.1s ease-out, width 0.1s ease-out, height 0.1s ease-out',
                filter: 'blur(0.5px)',
                borderRadius: '1px',
              }}
            />
          )
        })}
    </div>
  )
}
