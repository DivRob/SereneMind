import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { MoodTracker } from "@/components/mood-tracker"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user analytics
  const { data: analyticsData } = await supabase.rpc("get_user_analytics", {
    p_user_id: user.id,
    p_days: 30,
  })

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get current week goals
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split("T")[0]

  const { data: weeklyGoals } = await supabase
    .from("weekly_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStartStr)

  // Update weekly goals progress
  await supabase.rpc("update_weekly_goals", { p_user_id: user.id })

  // Get recent mood entries
  const { data: recentMoods } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .limit(7)

  const analytics = analyticsData || {}
  const taskStats = analytics.tasks || {}
  const moodStats = analytics.mood || {}
  const streakStats = analytics.streaks || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Wellness Analytics</h1>
                <p className="text-slate-600">Track your mental health journey and progress over time</p>
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

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{taskStats.total_completed || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Average Mood</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {moodStats.avg_mood ? Math.round(moodStats.avg_mood * 10) / 10 : "N/A"}
                </div>
                <p className="text-xs text-slate-500 mt-1">Out of 10</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{profile?.current_streak || 0} days</div>
                <p className="text-xs text-slate-500 mt-1">Daily tasks</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Points/Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {taskStats.avg_points_per_task ? Math.round(taskStats.avg_points_per_task) : 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Points earned</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weekly Goals */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🎯 Weekly Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyGoals && weeklyGoals.length > 0 ? (
                  <div className="space-y-4">
                    {weeklyGoals.map((goal) => {
                      const percentage = Math.min(100, (goal.current_progress / goal.target_value) * 100)
                      const goalLabels = {
                        tasks_completed: "Complete Tasks",
                        points_earned: "Earn Points",
                        streak_maintenance: "Maintain Streak",
                      }

                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-800">
                              {goalLabels[goal.goal_type as keyof typeof goalLabels] || goal.goal_type}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600">
                                {goal.current_progress}/{goal.target_value}
                              </span>
                              {goal.is_completed && <Badge className="bg-green-100 text-green-800">Complete</Badge>}
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No weekly goals set</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood Tracker */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">😊 Mood Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <MoodTracker userId={user.id} recentMoods={recentMoods || []} />
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>📊 Task Completion Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts data={taskStats.completion_by_day || []} type="tasks" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>📈 Mood Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts data={moodStats.mood_trend || []} type="mood" />
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">💡 Wellness Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Favorite Task Type</h4>
                  <p className="text-emerald-700 capitalize">{taskStats.favorite_task_type || "Not enough data"}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Mood Entries</h4>
                  <p className="text-blue-700">{moodStats.entries_count || 0} entries in the last 30 days</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Longest Streak</h4>
                  <p className="text-orange-700">{streakStats.longest_streak || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
