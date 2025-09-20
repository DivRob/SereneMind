import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get today's tasks
  const today = new Date().toISOString().split("T")[0]
  const { data: todaysTasks } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("assigned_date", today)
    .order("created_at", { ascending: false })

  // Get recent completions
  const { data: recentCompletions } = await supabase
    .from("task_completions")
    .select("*, daily_tasks(title, task_type)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5)

  // Get user badges
  const { data: userBadges } = await supabase.from("user_badges").select("badges(*)").eq("user_id", user.id)

  const completedToday = todaysTasks?.filter((task) => task.is_completed).length || 0
  const totalToday = todaysTasks?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  Welcome back, {profile?.display_name || "User"}!
                </h1>
                <p className="text-slate-600">Continue your wellness journey with personalized tasks</p>
              </div>
              <div className="flex gap-3">
                {profile?.subscription_tier === "premium" && (
                  <Link href="/premium">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      👑 Premium
                    </Button>
                  </Link>
                )}
                <Link href="/analytics">
                  <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent">
                    Analytics
                  </Button>
                </Link>
                <Link href="/games">
                  <Button
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
                  >
                    Mini-Games
                  </Button>
                </Link>
                <Link href="/badges">
                  <Button
                    variant="outline"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent"
                  >
                    Badges
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    Chat with MindfulAI
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Points</CardTitle>
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
                <CardTitle className="text-sm font-medium text-slate-600">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {completedToday}/{totalToday}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={profile?.subscription_tier === "premium" ? "default" : "secondary"}
                  className={
                    profile?.subscription_tier === "premium" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""
                  }
                >
                  {profile?.subscription_tier || "free"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {profile?.subscription_tier !== "premium" && (
            <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">🚀 Unlock Premium Features</h3>
                    <p className="text-purple-100">
                      Get AI personality analysis, advanced analytics, and personalized optimization tips
                    </p>
                  </div>
                  <Link href="/premium">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Tasks */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Today's Tasks
                  <Badge variant="outline" className="ml-auto">
                    {completedToday}/{totalToday} completed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysTasks && todaysTasks.length > 0 ? (
                  <div className="space-y-3">
                    {todaysTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border ${
                          task.is_completed ? "bg-green-50 border-green-200" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4
                              className={`font-medium ${
                                task.is_completed ? "text-green-800 line-through" : "text-slate-800"
                              }`}
                            >
                              {task.title}
                            </h4>
                            <p className={`text-sm mt-1 ${task.is_completed ? "text-green-600" : "text-slate-600"}`}>
                              {task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="secondary" className="text-xs">
                              +{task.points_reward}
                            </Badge>
                            {task.is_completed && <span className="text-green-500 text-lg">✅</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">No tasks assigned for today</p>
                    <Link href="/chat">
                      <Button
                        variant="outline"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                      >
                        Chat with MindfulAI to get started
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📈 Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentCompletions && recentCompletions.length > 0 ? (
                  <div className="space-y-3">
                    {recentCompletions.map((completion) => (
                      <div
                        key={completion.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm">✓</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{completion.daily_tasks?.title}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(completion.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{completion.points_earned}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
          {userBadges && userBadges.length > 0 && (
            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🏆 Your Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userBadges.map((userBadge) => (
                    <div
                      key={userBadge.badges.id}
                      className="text-center p-4 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="text-2xl mb-2">{userBadge.badges.icon}</div>
                      <h4 className="font-medium text-slate-800 text-sm">{userBadge.badges.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{userBadge.badges.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
