"use client"

import { useEffect, useRef } from "react"

export default function ParticleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      baseOpacity: number
      connections: Particle[]

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2 + 1
        this.baseOpacity = Math.random() * 0.3 + 0.1
        this.opacity = this.baseOpacity
        this.connections = []
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1

        // Keep particles in bounds
        this.x = Math.max(0, Math.min(canvas!.width, this.x))
        this.y = Math.max(0, Math.min(canvas!.height, this.y))

        // Mouse interaction
        if (mouseRef.current.isHovering) {
          const dx = mouseRef.current.x - this.x
          const dy = mouseRef.current.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const force = (150 - distance) / 150
            this.opacity = this.baseOpacity + force * 0.4
            this.vx += (dx / distance) * force * 0.01
            this.vy += (dy / distance) * force * 0.01
          } else {
            this.opacity = this.baseOpacity
          }
        } else {
          this.opacity = this.baseOpacity
        }

        // Damping
        this.vx *= 0.99
        this.vy *= 0.99
      }

      draw() {
        ctx!.beginPath()
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(99, 102, 241, ${this.opacity})`
        ctx!.fill()
      }
    }

    // Create particles
    const particles: Particle[] = []
    const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000))

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            const opacity = ((120 - distance) / 120) * 0.1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY
      mouseRef.current.isHovering = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      drawConnections()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full opacity-40" />
    </div>
  )
}
