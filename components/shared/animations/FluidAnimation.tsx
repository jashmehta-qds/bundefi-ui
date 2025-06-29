"use client"

import { useEffect, useRef } from 'react'

export default function FluidAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5, isHovering: false })
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    class Metaball {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      baseRadius: number
      targetX: number
      targetY: number
      phase: number
      hue: number

      constructor(x: number, y: number, radius: number) {
        this.x = x
        this.y = y
        this.targetX = x
        this.targetY = y
        this.vx = 0
        this.vy = 0
        this.radius = radius
        this.baseRadius = radius
        this.phase = Math.random() * Math.PI * 2
        this.hue = 200 + Math.random() * 60 // Blue to purple range
      }

      update(time: number, mouse: { x: number; y: number; isHovering: boolean }, canvas: HTMLCanvasElement, isSelected: boolean) {
        if (mouse.isHovering && isSelected) {
          const mouseX = mouse.x * canvas.width
          const mouseY = mouse.y * canvas.height
          const dx = mouseX - this.x
          const dy = mouseY - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 300) {
            const force = (300 - distance) / 300 * 0.12
            this.vx += (dx / distance) * force
            this.vy += (dy / distance) * force
          }
          
          if (distance < 120) {
            const repulsion = (120 - distance) / 120 * 0.06
            this.vx -= (dx / distance) * repulsion
            this.vy -= (dy / distance) * repulsion
          }
        } else {
          const restForce = 0.02
          this.vx += (this.targetX - this.x) * restForce
          this.vy += (this.targetY - this.y) * restForce
          
          const floatAmplitude = 0.6
          const floatSpeed = 1.5
          this.x += Math.sin(time * floatSpeed + this.phase) * floatAmplitude
          this.y += Math.cos(time * floatSpeed * 0.8 + this.phase) * floatAmplitude * 0.9
        }

        this.x += this.vx
        this.y += this.vy

        if (this.x < this.radius || this.x > canvas.width - this.radius) {
          this.vx *= -0.85
          this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x))
        }
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
          this.vy *= -0.85
          this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y))
        }

        const damping = mouse.isHovering ? 0.98 : 0.92
        this.vx *= damping
        this.vy *= damping

        if (mouse.isHovering && isSelected) {
          this.radius = this.baseRadius + Math.sin(time * 4) * 8
        } else {
          this.radius = this.baseRadius + Math.sin(time * 2 + this.phase) * 2
        }
      }
    }

    const metaballs: Metaball[] = []
    
    // Create more metaballs for richer effect
    for (let i = 0; i < 6; i++) {
      const x = canvas.width * 0.15 + Math.random() * canvas.width * 0.7
      const y = canvas.height * 0.15 + Math.random() * canvas.height * 0.7
      metaballs.push(new Metaball(x, y, 30 + Math.random() * 35))
    }

    const calculateField = (x: number, y: number): number => {
      let field = 0
      metaballs.forEach(ball => {
        const dx = x - ball.x
        const dy = y - ball.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        field += (ball.radius * ball.radius) / (distance * distance + 1)
      })
      return field
    }

    const createModernGradient = (ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number, hue: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 120)
      
      const saturation = mouseRef.current.isHovering ? 85 + intensity * 15 : 75 + intensity * 20
      const baseLightness = mouseRef.current.isHovering ? 30 + intensity * 25 : 25 + intensity * 30
      const midLightness = baseLightness + 20
      const topLightness = Math.min(80, baseLightness + 35)
      
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${topLightness}%, 0.9)`)
      gradient.addColorStop(0.4, `hsla(${hue + 10}, ${saturation - 5}%, ${midLightness}%, 0.7)`)
      gradient.addColorStop(0.8, `hsla(${hue + 20}, ${saturation - 15}%, ${baseLightness}%, 0.5)`)
      gradient.addColorStop(1, `hsla(${hue + 30}, ${saturation - 25}%, ${baseLightness - 10}%, 0.2)`)
      
      return gradient
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX / window.innerWidth
      mouseRef.current.y = event.clientY / window.innerHeight
      mouseRef.current.isHovering = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    const animate = () => {
      timeRef.current += 0.016

      // Enhanced background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      if (mouseRef.current.isHovering) {
        bgGradient.addColorStop(0, '#fefefe')
        bgGradient.addColorStop(0.5, '#fdfdfd')
        bgGradient.addColorStop(1, '#fbfbfb')
      } else {
        bgGradient.addColorStop(0, '#ffffff')
        bgGradient.addColorStop(0.5, '#fefefe')
        bgGradient.addColorStop(1, '#fdfdfd')
      }
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (mouseRef.current.isHovering) {
        const mouseX = mouseRef.current.x * canvas.width
        const mouseY = mouseRef.current.y * canvas.height
        
        const ballDistances = metaballs.map((ball, index) => ({
          index,
          distance: Math.sqrt(Math.pow(ball.x - mouseX, 2) + Math.pow(ball.y - mouseY, 2))
        }))
        
        ballDistances.sort((a, b) => a.distance - b.distance)
        const selectedIndices = new Set(ballDistances.slice(0, 4).map(item => item.index))
        
        metaballs.forEach((ball, index) => {
          const isSelected = selectedIndices.has(index)
          ball.update(timeRef.current, mouseRef.current, canvas, isSelected)
        })
      } else {
        metaballs.forEach(ball => ball.update(timeRef.current, mouseRef.current, canvas, false))
      }

      const threshold = 1.1
      const resolution = 3

      for (let x = 0; x < canvas.width; x += resolution) {
        for (let y = 0; y < canvas.height; y += resolution) {
          const field = calculateField(x, y)
          
          if (field > threshold) {
            const intensity = Math.min(1, (field - threshold) / 2.5)
            const nearestBall = metaballs.reduce((nearest, ball) => {
              const dist = Math.sqrt(Math.pow(x - ball.x, 2) + Math.pow(y - ball.y, 2))
              return dist < nearest.distance ? { ball, distance: dist } : nearest
            }, { ball: metaballs[0], distance: Infinity })
            
            ctx.fillStyle = createModernGradient(ctx, x, y, intensity, nearestBall.ball.hue)
            ctx.globalAlpha = 0.85 + intensity * 0.15
            
            ctx.beginPath()
            ctx.arc(x, y, resolution * (1.2 + intensity * 0.8), 0, Math.PI * 2)
            ctx.fill()
            
            if (intensity > 0.6) {
              const highlightOpacity = mouseRef.current.isHovering ? (intensity - 0.6) * 0.8 : (intensity - 0.6) * 0.4
              ctx.fillStyle = `rgba(255, 255, 255, ${highlightOpacity})`
              ctx.beginPath()
              ctx.arc(x - resolution * 0.3, y - resolution * 0.3, resolution * 0.7, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }

      // Enhanced shimmer effect
      if (mouseRef.current.isHovering) {
        ctx.globalAlpha = 0.4
        const shimmerIntensity = 0.25 + Math.sin(timeRef.current * 3) * 0.15
        ctx.fillStyle = `rgba(255, 255, 255, ${shimmerIntensity})`
        
        for (let i = 0; i < 120; i++) {
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          const field = calculateField(x, y)
          
          if (field > threshold) {
            ctx.beginPath()
            ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  )
}
