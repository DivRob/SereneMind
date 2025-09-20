import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default async function BadgesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get all badges
  const { data: allBadges } = await supabase.from("badges").select("*").order("tier", { ascending: true })

  // Get user badges
  const { data: userBadges } = await supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id)

  // Get task completion counts for progress calculation
  const { data: taskCounts } = await supabase
    .from("task_completions")
    .select("task_id, daily_tasks(task_type)")
    .eq("user_id", user.id)

  const userBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

  const getTaskTypeCount = (taskType: string) => {
    return taskCounts?.filter((tc) => tc.daily_tasks?.task_type === taskType).length || 0
  }

  const getBadgeProgress = (badge: any) => {
    if (userBadgeIds.has(badge.id)) return 100

    switch (badge.requirement_type) {
      case "points":
        return Math.min(100, ((profile?.total_points || 0) / badge.requirement_value) * 100)
      case "streak":
        return Math.min(100, ((profile?.current_streak || 0) / badge.requirement_value) * 100)
      case "task_count":
        let currentCount = 0
        if (badge.name === "Mindful Master") {
          currentCount = getTaskTypeCount("mindfulness")
        } else if (badge.name === "Breath Work Pro") {
          currentCount = getTaskTypeCount("breathing")
        } else if (badge.name === "Gratitude Guru") {
          currentCount = getTaskTypeCount("gratitude")
        } else {
          currentCount = taskCounts?.length || 0
        }
        return Math.min(100, (currentCount / badge.requirement_value) * 100)
      default:
        return 0
    }
  }

  const getProgressText = (badge: any) => {
    if (userBadgeIds.has(badge.id)) return "Earned!"

    switch (badge.requirement_type) {
      case "points":
        return `${profile?.total_points || 0} / ${badge.requirement_value} points`
      case "streak":
        return `${profile?.current_streak || 0} / ${badge.requirement_value} days`
      case "task_count":
        let currentCount = 0
        if (badge.name === "Mindful Master") {
          currentCount = getTaskTypeCount("mindfulness")
        } else if (badge.name === "Breath Work Pro") {
          currentCount = getTaskTypeCount("breathing")
        } else if (badge.name === "Gratitude Guru") {
          currentCount = getTaskTypeCount("gratitude")
        } else {
          currentCount = taskCounts?.length || 0
        }
        return `${currentCount} / ${badge.requirement_value} tasks`
      default:
        return "Special requirement"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "platinum":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const earnedBadges = allBadges?.filter((badge) => userBadgeIds.has(badge.id)) || []
  const availableBadges = allBadges?.filter((badge) => !userBadgeIds.has(badge.id)) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Achievement Badges</h1>
                <p className="text-slate-600">Track your wellness journey and unlock achievements</p>
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Badges Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {earnedBadges.length}/{allBadges?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{profile?.total_points || 0}</div>
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
                <CardTitle className="text-sm font-medium text-slate-600">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{taskCounts?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">🏆 Your Badges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {earnedBadges.map((badge) => (
                  <Card key={badge.id} className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{badge.icon}</span>
                            <div>
                              <CardTitle className="text-lg text-slate-800">{badge.name}</CardTitle>
                              <Badge className={`text-xs ${getTierColor(badge.tier)}`}>{badge.tier}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl">✅</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm mb-3">{badge.description}</p>
                      <div className="text-xs text-emerald-600 font-medium">
                        Earned on{" "}
                        {new Date(
                          userBadges?.find((ub) => ub.badge_id === badge.id)?.earned_at || "",
                        ).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Badges */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">🎯 Available Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBadges.map((badge) => {
                const progress = getBadgeProgress(badge)
                const progressText = getProgressText(badge)

                return (
                  <Card key={badge.id} className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl opacity-60">{badge.icon}</span>
                            <div>
                              <CardTitle className="text-lg text-slate-800">{badge.name}</CardTitle>
                              <Badge className={`text-xs ${getTierColor(badge.tier)}`}>{badge.tier}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm mb-4">{badge.description}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-medium text-slate-800">{progressText}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
