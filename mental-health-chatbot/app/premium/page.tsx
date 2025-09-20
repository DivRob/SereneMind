import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PremiumInsights } from "@/components/premium-insights"
import { WellnessScore } from "@/components/wellness-score"

export default async function PremiumPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user has premium access
  if (profile?.subscription_tier !== "premium") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl">👑</span>
                </div>
                <CardTitle className="text-3xl mb-4">Upgrade to Premium</CardTitle>
                <p className="text-purple-100 text-lg">
                  Unlock advanced analytics, personalized insights, and premium features
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Premium Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧠</span>
                        <div>
                          <h4 className="font-medium">AI Personality Analysis</h4>
                          <p className="text-sm text-purple-100">Deep insights into your mental health patterns</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                          <h4 className="font-medium">Advanced Analytics</h4>
                          <p className="text-sm text-purple-100">Comprehensive wellness scoring and trends</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <h4 className="font-medium">Personalized Optimization</h4>
                          <p className="text-sm text-purple-100">Custom recommendations based on your data</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎮</span>
                        <div>
                          <h4 className="font-medium">Premium Mini-Games</h4>
                          <p className="text-sm text-purple-100">Exclusive wellness games and challenges</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">What You Get</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-green-300">✓</span>
                        <span>Unlimited AI chat sessions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-300">✓</span>
                        <span>Advanced mood prediction</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-300">✓</span>
                        <span>Stress pattern analysis</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-300">✓</span>
                        <span>Habit optimization insights</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-300">✓</span>
                        <span>Priority customer support</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-300">✓</span>
                        <span>Export your wellness data</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-purple-100">/month</span>
                  </div>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg">
                    Start Premium Trial
                  </Button>
                  <p className="text-sm text-purple-100 mt-4">7-day free trial • Cancel anytime • No commitment</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Premium user content
  // Generate premium insights
  const { data: premiumInsights } = await supabase.rpc("generate_premium_insights", {
    p_user_id: user.id,
  })

  // Get wellness score
  const { data: wellnessScore } = await supabase.rpc("calculate_wellness_score", {
    p_user_id: user.id,
  })

  // Get personalized recommendations
  const { data: recommendations } = await supabase
    .from("personalized_recommendations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_dismissed", false)
    .order("priority_score", { ascending: false })
    .limit(5)

  // Get recent premium analytics
  const { data: recentAnalytics } = await supabase
    .from("premium_analytics")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("generated_at", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">👑</span>
                  <h1 className="text-3xl font-bold text-slate-800">Premium Dashboard</h1>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Premium</Badge>
                </div>
                <p className="text-slate-600">Advanced insights and personalized wellness analytics</p>
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

          {/* Wellness Score */}
          <div className="mb-8">
            <WellnessScore score={wellnessScore || 0} />
          </div>

          {/* Premium Insights */}
          <div className="mb-8">
            <PremiumInsights insights={premiumInsights} />
          </div>

          {/* Personalized Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🎯 Personalized Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations && recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            Priority {rec.priority_score}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{rec.description}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            Apply
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs text-slate-500">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No recommendations available</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Complete more tasks and mood entries to get personalized insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Analytics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📊 Recent Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAnalytics && recentAnalytics.length > 0 ? (
                  <div className="space-y-4">
                    {recentAnalytics.map((analysis) => (
                      <div key={analysis.id} className="p-4 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-800 capitalize">
                            {analysis.analysis_type.replace("_", " ")}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round((analysis.confidence_score || 0) * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm">
                          Generated on {new Date(analysis.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No recent analysis</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Analytics are generated based on your activity patterns
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Premium Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="text-center">
                <span className="text-3xl mb-2 block">🧠</span>
                <CardTitle className="text-lg">AI Personality Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 text-sm mb-4">
                  Deep insights into your mental health patterns and personality traits
                </p>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  View Analysis
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="text-center">
                <span className="text-3xl mb-2 block">📈</span>
                <CardTitle className="text-lg">Predictive Insights</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 text-sm mb-4">
                  AI-powered predictions for mood trends and wellness optimization
                </p>
                <Button size="sm" className="bg-green-500 hover:bg-green-600">
                  View Predictions
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="text-center">
                <span className="text-3xl mb-2 block">🎯</span>
                <CardTitle className="text-lg">Custom Optimization</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 text-sm mb-4">
                  Personalized recommendations for optimal wellness routines
                </p>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  Get Recommendations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
