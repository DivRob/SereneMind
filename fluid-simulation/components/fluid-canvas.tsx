"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
  opacity: number
}

class FluidParticle implements Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
  opacity: number

  constructor(x: number, y: number, vx = 0, vy = 0, color: string) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.life = 1.0
    this.size = Math.random() * 12 + 3
    this.color = color
    this.opacity = 1.0
  }

  update(canvasWidth: number, canvasHeight: number, physicsEnabled: boolean) {
    if (!physicsEnabled) return

    // Apply velocity with enhanced fluid dynamics
    this.x += this.vx
    this.y += this.vy

    // Enhanced friction and fluid behavior
    this.vx *= 0.985
    this.vy *= 0.985

    // Subtle gravity
    this.vy += 0.015

    // Boundary interactions with energy conservation
    if (this.x < 0 || this.x > canvasWidth) {
      this.vx *= -0.7
      this.x = Math.max(0, Math.min(canvasWidth, this.x))
    }
    if (this.y < 0 || this.y > canvasHeight) {
      this.vy *= -0.7
      this.y = Math.max(0, Math.min(canvasHeight, this.y))
    }

    // Enhanced lifecycle
    this.life -= 0.003
    this.opacity = Math.max(0, this.life)
    this.size *= 0.9995
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.globalAlpha = this.opacity * 0.9

    const hexToRgba = (hex: string, alpha: number) => {
      const r = Number.parseInt(hex.slice(1, 3), 16)
      const g = Number.parseInt(hex.slice(3, 5), 16)
      const b = Number.parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Enhanced gradient with proper rgba colors
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.5)
    gradient.addColorStop(0, this.color)
    gradient.addColorStop(0.7, hexToRgba(this.color, 0.5))
    gradient.addColorStop(1, "transparent")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

interface FluidCanvasProps {
  className?: string
}

export function FluidCanvas({ className }: FluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<FluidParticle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })

  const [currentColor, setCurrentColor] = useState("#ff6b9d")
  const [physicsEnabled, setPhysicsEnabled] = useState(true)
  const [isInteracting, setIsInteracting] = useState(false)

  const colors = [
    "#ff6b9d", // Pink
    "#4ecdc4", // Teal
    "#45b7d1", // Blue
    "#96ceb4", // Green
    "#feca57", // Yellow
    "#ff9ff3", // Light Pink
    "#54a0ff", // Light Blue
    "#5f27cd", // Purple
  ]

  const updateMousePosition = useCallback((e: MouseEvent | Touch) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = (e.clientX - rect.left) * (canvas.width / rect.width)
    mouseRef.current.y = (e.clientY - rect.top) * (canvas.height / rect.height)
  }, [])

  const createSwirl = useCallback(
    (prevX: number, prevY: number) => {
      const { x: mouseX, y: mouseY } = mouseRef.current
      const dx = mouseX - prevX
      const dy = mouseY - prevY
      const speed = Math.sqrt(dx * dx + dy * dy)

      // Enhanced particle generation
      const particleCount = Math.min(Math.floor(speed * 0.8), 20)

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI * 0.8
        const distance = Math.random() * 40
        const x = mouseX + Math.cos(angle) * distance
        const y = mouseY + Math.sin(angle) * distance

        // Enhanced swirl physics
        const swirl = Math.random() * 0.15
        const vx = dx * 0.12 + Math.cos(angle + Math.PI / 2) * swirl * speed * 0.8
        const vy = dy * 0.12 + Math.sin(angle + Math.PI / 2) * swirl * speed * 0.8

        particlesRef.current.push(new FluidParticle(x, y, vx, vy, currentColor))
      }
    },
    [currentColor],
  )

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Enhanced trailing effect with better blending
    ctx.fillStyle = "rgba(20, 20, 30, 0.08)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    const particles = particlesRef.current
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.update(canvas.width, canvas.height, physicsEnabled)
      particle.draw(ctx)

      // Remove dead particles
      if (particle.life <= 0 || particle.size < 0.8) {
        particles.splice(i, 1)
      }
    }

    // Add ambient particles for atmosphere
    if (Math.random() < 0.015 && particles.length < 800) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      particles.push(
        new FluidParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          randomColor,
        ),
      )
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [physicsEnabled, colors])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true
      setIsInteracting(true)
      updateMousePosition(e)
    }

    const handleMouseUp = () => {
      mouseRef.current.isDown = false
      setIsInteracting(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const prevX = mouseRef.current.x
      const prevY = mouseRef.current.y
      updateMousePosition(e)

      if (mouseRef.current.isDown) {
        createSwirl(prevX, prevY)
      }
    }

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      mouseRef.current.isDown = true
      setIsInteracting(true)
      updateMousePosition(e.touches[0])
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      mouseRef.current.isDown = false
      setIsInteracting(false)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const prevX = mouseRef.current.x
      const prevY = mouseRef.current.y
      updateMousePosition(e.touches[0])
      createSwirl(prevX, prevY)
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchend", handleTouchEnd)
    canvas.addEventListener("touchmove", handleTouchMove)

    // Start animation
    animate()

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("touchmove", handleTouchMove)

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, createSwirl, updateMousePosition])

  const clearCanvas = () => {
    particlesRef.current = []
  }

  const togglePhysics = () => {
    setPhysicsEnabled(!physicsEnabled)
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className={`rounded-2xl shadow-2xl cursor-crosshair transition-all duration-300 ${
          isInteracting ? "scale-[1.02]" : ""
        } ${className}`}
        style={{
          background: "radial-gradient(circle at center, #1a1a2e, #16213e)",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Enhanced Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 p-4 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl">
        <button
          onClick={clearCanvas}
          className="px-6 py-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-xl transition-all duration-200 hover:scale-105 font-medium"
        >
          Clear
        </button>

        <button
          onClick={togglePhysics}
          className={`px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105 font-medium ${
            physicsEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {physicsEnabled ? "Physics On" : "Physics Off"}
        </button>

        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 border-2 ${
                currentColor === color ? "border-foreground shadow-lg scale-110" : "border-border/50"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
