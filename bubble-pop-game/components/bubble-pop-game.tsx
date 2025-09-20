"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Bubble {
  id: string
  x: number
  y: number
  size: number
  color: string
  animationDelay: number
}

interface ScorePopup {
  id: string
  x: number
  y: number
  points: number
}

const BUBBLE_COLORS = [
  "from-pink-400 to-rose-500",
  "from-blue-400 to-indigo-500",
  "from-green-400 to-emerald-500",
  "from-yellow-400 to-orange-500",
  "from-purple-400 to-violet-500",
  "from-cyan-400 to-teal-500",
  "from-red-400 to-pink-500",
  "from-indigo-400 to-purple-500",
]

export default function BubblePopGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameOver">("start")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedTime, setSelectedTime] = useState(60)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    }

    document.addEventListener("click", initAudio, { once: true })
    return () => document.removeEventListener("click", initAudio)
  }, [])

  const createPopSound = useCallback(() => {
    if (!audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContextRef.current.currentTime + 0.15)

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.15)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.15)
  }, [])

  const createBubble = useCallback(() => {
    if (!gameContainerRef.current) return

    const container = gameContainerRef.current
    const containerRect = container.getBoundingClientRect()
    const size = Math.random() * 50 + 40 // 40-90px
    const x = Math.random() * (containerRect.width - size)
    const y = Math.random() * (containerRect.height - size - 120) + 120 // Account for header

    const newBubble: Bubble = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      size,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      animationDelay: Math.random() * 2,
    }

    setBubbles((prev) => [...prev, newBubble])

    // Remove bubble after 5 seconds if not popped
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id))
    }, 5000)
  }, [])

  const popBubble = useCallback(
    (bubble: Bubble, event: React.MouseEvent) => {
      event.preventDefault()
      createPopSound()

      const points = Math.floor(Math.random() * 40) + 20 // 20-60 points
      setScore((prev) => prev + points)

      // Create score popup
      const popup: ScorePopup = {
        id: Math.random().toString(36).substr(2, 9),
        x: event.clientX,
        y: event.clientY,
        points,
      }
      setScorePopups((prev) => [...prev, popup])

      // Remove bubble
      setBubbles((prev) => prev.filter((b) => b.id !== bubble.id))

      // Remove score popup after animation
      setTimeout(() => {
        setScorePopups((prev) => prev.filter((p) => p.id !== popup.id))
      }, 1200)
    },
    [createPopSound],
  )

  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(selectedTime)
    setBubbles([])
    setScorePopups([])
  }, [selectedTime])

  const endGame = useCallback(() => {
    setGameState("gameOver")
    setBubbles([])
  }, [])

  const resetGame = useCallback(() => {
    setGameState("start")
    setScore(0)
    setTimeLeft(selectedTime)
    setBubbles([])
    setScorePopups([])
  }, [selectedTime])

  // Game timer
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, endGame])

  // Bubble creation
  useEffect(() => {
    if (gameState !== "playing") return

    const bubbleInterval = setInterval(createBubble, 1000)

    // Create initial bubbles
    for (let i = 0; i < 3; i++) {
      setTimeout(createBubble, i * 300)
    }

    return () => clearInterval(bubbleInterval)
  }, [gameState, createBubble])

  const getRewardMessage = () => {
    if (score >= 1500) return { emoji: "🏆", title: "Bubble Legend!", message: "Absolutely incredible!" }
    if (score >= 1000) return { emoji: "🥇", title: "Bubble Master!", message: "Amazing performance!" }
    if (score >= 750) return { emoji: "🥈", title: "Bubble Champion!", message: "Excellent work!" }
    if (score >= 500) return { emoji: "🥉", title: "Bubble Expert!", message: "Great job!" }
    if (score >= 250) return { emoji: "⭐", title: "Bubble Apprentice!", message: "Well done!" }
    return { emoji: "🫧", title: "Bubble Beginner!", message: "Keep practicing!" }
  }

  if (gameState === "start") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center backdrop-blur-sm bg-card/80 border-2 border-primary/20 shadow-2xl">
          <div className="space-y-6">
            <div className="text-6xl mb-4 pulse-animation">🫧</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bubble Pop!
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pop as many colorful bubbles as you can! Each bubble gives you points. Ready for the ultimate
              bubble-popping challenge?
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Choose Game Duration</h3>
              <div className="grid grid-cols-3 gap-3">
                {[30, 60, 90, 120, 180, 300].map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={`text-sm py-2 transition-all duration-200 ${
                      selectedTime === time
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg scale-105"
                        : "hover:scale-105"
                    }`}
                  >
                    {time < 60 ? `${time}s` : `${time / 60}m`}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-semibold text-accent">
                  {selectedTime < 60
                    ? `${selectedTime} seconds`
                    : `${selectedTime / 60} minute${selectedTime > 60 ? "s" : ""}`}
                </span>
              </p>
            </div>

            <Button
              onClick={startGame}
              size="lg"
              className="text-xl px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Popping! ✨
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (gameState === "gameOver") {
    const reward = getRewardMessage()
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center backdrop-blur-sm bg-card/80 border-2 border-primary/20 shadow-2xl">
          <div className="space-y-6">
            <div className="text-6xl mb-4">{reward.emoji}</div>
            <h2 className="text-3xl font-bold text-foreground">Game Over!</h2>
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {score}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-accent">{reward.title}</h3>
              <p className="text-muted-foreground">{reward.message}</p>
            </div>
            {score >= 500 && (
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-accent font-medium">🎯 Bonus Achievement Unlocked!</p>
              </div>
            )}
            <Button
              onClick={resetGame}
              size="lg"
              className="text-xl px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Play Again! 🎮
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div
      ref={gameContainerRef}
      className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 relative overflow-hidden cursor-crosshair"
    >
      {/* Game Header */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <Card className="flex items-center gap-8 px-6 py-4 backdrop-blur-md bg-card/90 border-2 border-primary/20 shadow-xl">
          <div className="text-xl font-bold text-foreground">
            Score: <span className="text-primary">{score}</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            Time:{" "}
            <span className={`${timeLeft <= 10 ? "text-destructive pulse-animation" : "text-accent"}`}>
              {timeLeft}s
            </span>
          </div>
        </Card>
      </div>

      {/* Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`absolute rounded-full cursor-pointer bubble-float bg-gradient-to-br ${bubble.color} shadow-lg hover:scale-110 transition-transform duration-200`}
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            animationDelay: `${bubble.animationDelay}s`,
            boxShadow: `
              inset -8px -8px 16px rgba(0, 0, 0, 0.1),
              inset 8px 8px 16px rgba(255, 255, 255, 0.3),
              0 8px 24px rgba(0, 0, 0, 0.2)
            `,
          }}
          onClick={(e) => popBubble(bubble, e)}
        >
          <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-white/60 rounded-full blur-sm" />
        </div>
      ))}

      {/* Score Popups */}
      {scorePopups.map((popup) => (
        <div
          key={popup.id}
          className="fixed text-2xl font-bold text-accent pointer-events-none z-40 score-popup"
          style={{
            left: popup.x - 20,
            top: popup.y - 20,
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          }}
        >
          +{popup.points}
        </div>
      ))}
    </div>
  )
}
