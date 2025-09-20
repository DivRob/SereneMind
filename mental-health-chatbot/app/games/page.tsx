import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function GamesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get all mini-games
  const { data: games } = await supabase.from("mini_games").select("*").order("unlock_value", { ascending: true })

  // Get user game progress
  const { data: gameProgress } = await supabase.from("user_game_progress").select("*").eq("user_id", user.id)

  // Check and unlock games
  await supabase.rpc("check_and_unlock_games", { p_user_id: user.id })

  // Refresh game progress after potential unlocks
  const { data: updatedGameProgress } = await supabase.from("user_game_progress").select("*").eq("user_id", user.id)

  const getGameProgress = (gameId: string) => {
    return updatedGameProgress?.find((gp) => gp.game_id === gameId)
  }

  const isGameUnlocked = (game: any) => {
    const progress = getGameProgress(game.id)
    if (progress?.is_unlocked) return true

    // Check unlock requirements
    if (game.is_premium && profile?.subscription_tier !== "premium") return false

    switch (game.unlock_requirement) {
      case "points":
        return (profile?.total_points || 0) >= game.unlock_value
      case "streak":
        return (profile?.current_streak || 0) >= game.unlock_value
      default:
        return false
    }
  }

  const getUnlockText = (game: any) => {
    if (game.is_premium && profile?.subscription_tier !== "premium") {
      return "Premium Required"
    }

    switch (game.unlock_requirement) {
      case "points":
        return `Unlock at ${game.unlock_value} points`
      case "streak":
        return `Unlock with ${game.unlock_value} day streak`
      default:
        return "Locked"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Wellness Mini-Games</h1>
                <p className="text-slate-600">Unlock and play games to boost your mental wellness</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                  >
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Your Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{profile?.total_points || 0}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{profile?.current_streak || 0} days</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Games Unlocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {games?.filter((game) => isGameUnlocked(game)).length || 0}/{games?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games?.map((game) => {
              const unlocked = isGameUnlocked(game)
              const progress = getGameProgress(game.id)

              return (
                <Card
                  key={game.id}
                  className={`border-0 shadow-lg transition-all hover:shadow-xl ${
                    unlocked ? "cursor-pointer" : "opacity-60"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-800 mb-2">{game.name}</CardTitle>
                        <div className="flex gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {game.game_type}
                          </Badge>
                          {game.is_premium && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">Premium</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-3xl">
                        {game.game_type === "memory" && "🧠"}
                        {game.game_type === "puzzle" && "🧩"}
                        {game.game_type === "breathing" && "🫁"}
                        {game.game_type === "focus" && "🎯"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{game.description}</p>

                    {progress && unlocked && (
                      <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-emerald-700">High Score:</span>
                          <span className="font-semibold text-emerald-800">{progress.high_score}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-emerald-700">Times Played:</span>
                          <span className="font-semibold text-emerald-800">{progress.times_played}</span>
                        </div>
                      </div>
                    )}

                    {unlocked ? (
                      <Link href={`/games/${game.id}`}>
                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                          Play Game
                        </Button>
                      </Link>
                    ) : (
                      <div className="text-center">
                        <div className="text-sm text-slate-500 mb-2">{getUnlockText(game)}</div>
                        <Button disabled className="w-full">
                          🔒 Locked
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Premium Upgrade CTA */}
          {profile?.subscription_tier !== "premium" && (
            <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white mt-8">
              <CardHeader className="text-center pb-6">
                <Badge className="bg-white text-purple-600 mb-4 mx-auto">Premium</Badge>
                <CardTitle className="text-2xl">Unlock Premium Games</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-100 mb-6">Get access to advanced mini-games designed by wellness experts</p>
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
