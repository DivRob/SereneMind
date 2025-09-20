"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Game {
  id: string
  name: string
  description: string
  game_type: string
}

interface GameProgress {
  high_score: number
  times_played: number
  is_unlocked: boolean
}

export default function GamePlayPage({ params }: { params: { gameId: string } }) {
  const [game, setGame] = useState<Game | null>(null)
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [currentScore, setCurrentScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameState, setGameState] = useState<any>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadGameData()
  }, [params.gameId])

  const loadGameData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Get game details
    const { data: gameData } = await supabase.from("mini_games").select("*").eq("id", params.gameId).single()

    if (!gameData) {
      router.push("/games")
      return
    }

    setGame(gameData)

    // Get user progress
    const { data: progressData } = await supabase
      .from("user_game_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("game_id", params.gameId)
      .single()

    if (!progressData?.is_unlocked) {
      router.push("/games")
      return
    }

    setProgress(progressData)
    initializeGame(gameData.game_type)
  }

  const initializeGame = (gameType: string) => {
    switch (gameType) {
      case "memory":
        initMemoryGame()
        break
      case "breathing":
        initBreathingGame()
        break
      case "puzzle":
        initPuzzleGame()
        break
      case "focus":
        initFocusGame()
        break
    }
  }

  const initMemoryGame = () => {
    const symbols = ["🌸", "🍃", "🌊", "☀️", "🌙", "⭐", "🦋", "🌺"]
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5)
    setGameState({
      cards,
      flipped: [],
      matched: [],
      moves: 0,
    })
  }

  const initBreathingGame = () => {
    setGameState({
      phase: "inhale", // inhale, hold, exhale
      timer: 4,
      cycle: 0,
      bubbles: [],
    })
  }

  const initPuzzleGame = () => {
    const pieces = Array.from({ length: 9 }, (_, i) => i)
    const shuffled = pieces.sort(() => Math.random() - 0.5)
    setGameState({
      pieces: shuffled,
      moves: 0,
      solved: false,
    })
  }

  const initFocusGame = () => {
    setGameState({
      obstacles: [],
      playerY: 50,
      score: 0,
      gameSpeed: 1,
    })
  }

  const startGame = () => {
    setIsPlaying(true)
    setCurrentScore(0)
    initializeGame(game?.game_type || "")
  }

  const endGame = async (finalScore: number) => {
    setIsPlaying(false)
    setCurrentScore(finalScore)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Update game progress
    const newHighScore = Math.max(finalScore, progress?.high_score || 0)
    const newTimesPlayed = (progress?.times_played || 0) + 1

    await supabase
      .from("user_game_progress")
      .update({
        high_score: newHighScore,
        times_played: newTimesPlayed,
        last_played: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("game_id", params.gameId)

    // Award points for playing
    const pointsEarned = Math.floor(finalScore / 10) + 5 // Base 5 points + score bonus

    await supabase.rpc("increment", {
      table_name: "profiles",
      column_name: "total_points",
      row_id: user.id,
      increment_value: pointsEarned,
    })

    setProgress((prev) =>
      prev
        ? {
            ...prev,
            high_score: newHighScore,
            times_played: newTimesPlayed,
          }
        : null,
    )
  }

  const renderMemoryGame = () => (
    <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
      {gameState.cards?.map((symbol: string, index: number) => (
        <div
          key={index}
          className={`aspect-square bg-white border-2 border-emerald-200 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all hover:border-emerald-400 ${
            gameState.flipped?.includes(index) || gameState.matched?.includes(index) ? "bg-emerald-50" : "bg-slate-100"
          }`}
          onClick={() => {
            if (
              gameState.flipped?.length < 2 &&
              !gameState.flipped?.includes(index) &&
              !gameState.matched?.includes(index)
            ) {
              const newFlipped = [...(gameState.flipped || []), index]
              setGameState((prev) => ({ ...prev, flipped: newFlipped, moves: prev.moves + 1 }))

              if (newFlipped.length === 2) {
                setTimeout(() => {
                  if (gameState.cards[newFlipped[0]] === gameState.cards[newFlipped[1]]) {
                    setGameState((prev) => ({
                      ...prev,
                      matched: [...prev.matched, ...newFlipped],
                      flipped: [],
                    }))
                    if (gameState.matched?.length + 2 === gameState.cards?.length) {
                      endGame(Math.max(0, 100 - gameState.moves))
                    }
                  } else {
                    setGameState((prev) => ({ ...prev, flipped: [] }))
                  }
                }, 1000)
              }
            }
          }}
        >
          {gameState.flipped?.includes(index) || gameState.matched?.includes(index) ? symbol : "?"}
        </div>
      ))}
    </div>
  )

  const renderBreathingGame = () => (
    <div className="text-center">
      <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center animate-pulse">
        <div className="text-white text-lg font-semibold">{gameState.phase?.toUpperCase()}</div>
      </div>
      <div className="text-2xl font-bold text-slate-800 mb-4">{gameState.timer}</div>
      <div className="text-slate-600">Cycle: {gameState.cycle}/10</div>
    </div>
  )

  const renderPuzzleGame = () => (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
      {gameState.pieces?.map((piece: number, index: number) => (
        <div
          key={index}
          className={`aspect-square border-2 border-slate-300 rounded-lg flex items-center justify-center text-xl font-bold cursor-pointer transition-all hover:border-emerald-400 ${
            piece === 0 ? "bg-slate-100" : "bg-white"
          }`}
          onClick={() => {
            // Simple sliding puzzle logic
            const emptyIndex = gameState.pieces.indexOf(0)
            const canMove = Math.abs(index - emptyIndex) === 1 || Math.abs(index - emptyIndex) === 3

            if (canMove) {
              const newPieces = [...gameState.pieces]
              ;[newPieces[index], newPieces[emptyIndex]] = [newPieces[emptyIndex], newPieces[index]]
              setGameState((prev) => ({ ...prev, pieces: newPieces, moves: prev.moves + 1 }))

              // Check if solved
              const isSolved = newPieces.every((piece, i) => piece === i)
              if (isSolved) {
                endGame(Math.max(0, 100 - gameState.moves))
              }
            }
          }}
        >
          {piece === 0 ? "" : piece}
        </div>
      ))}
    </div>
  )

  const renderFocusGame = () => (
    <div className="text-center">
      <div className="w-full h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg relative overflow-hidden">
        <div className="absolute left-4 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold">
          Focus Game - Use arrow keys to navigate
        </div>
      </div>
      <div className="mt-4 text-slate-600">Score: {gameState.score}</div>
    </div>
  )

  const renderGame = () => {
    if (!isPlaying) return null

    switch (game?.game_type) {
      case "memory":
        return renderMemoryGame()
      case "breathing":
        return renderBreathingGame()
      case "puzzle":
        return renderPuzzleGame()
      case "focus":
        return renderFocusGame()
      default:
        return <div>Game not implemented</div>
    }
  }

  if (!game) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/games")}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  ← Back to Games
                </Button>
                <Badge variant="secondary">{game.game_type}</Badge>
              </div>
              <CardTitle className="text-2xl text-slate-800 mb-2">{game.name}</CardTitle>
              <p className="text-slate-600">{game.description}</p>
            </CardHeader>

            <CardContent>
              {progress && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-emerald-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-800">{progress.high_score}</div>
                    <div className="text-sm text-emerald-600">High Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-800">{progress.times_played}</div>
                    <div className="text-sm text-emerald-600">Times Played</div>
                  </div>
                </div>
              )}

              <div className="min-h-[300px] flex items-center justify-center">
                {isPlaying ? (
                  <div className="w-full">
                    {renderGame()}
                    <div className="text-center mt-6">
                      <Button
                        variant="outline"
                        onClick={() => endGame(currentScore)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        End Game
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {game.game_type === "memory" && "🧠"}
                      {game.game_type === "puzzle" && "🧩"}
                      {game.game_type === "breathing" && "🫁"}
                      {game.game_type === "focus" && "🎯"}
                    </div>
                    <Button
                      size="lg"
                      onClick={startGame}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      Start Game
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
