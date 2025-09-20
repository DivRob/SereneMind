import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-800">MindfulAI</h1>
          </div>

          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Your AI-powered wellness companion that transforms mental health through personalized micro-tasks,
            gamification, and intelligent progress tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 text-lg"
              >
                Start Your Journey
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-3 text-lg bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🎯</span>
                </div>
                <CardTitle className="text-xl text-slate-800">Personalized Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center">
                  AI-generated micro-tasks tailored to your mental health needs, from thought reframing to mindfulness
                  breaks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🏆</span>
                </div>
                <CardTitle className="text-xl text-slate-800">Gamification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center">
                  Earn points, unlock badges, and maintain streaks to build lasting wellness habits through engaging
                  gameplay.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">📊</span>
                </div>
                <CardTitle className="text-xl text-slate-800">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center">
                  Comprehensive analytics and insights that help the AI understand you better and provide more effective
                  guidance.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Task Types */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Wellness Micro-Tasks</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Thought Reframing</h3>
                <p className="text-sm text-slate-600">Transform negative thoughts into positive perspectives</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💻</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Screen Breaks</h3>
                <p className="text-sm text-slate-600">30-second mindful breaks from digital devices</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🫁</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Breathing</h3>
                <p className="text-sm text-slate-600">Guided breathing exercises for stress relief</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🙏</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Gratitude</h3>
                <p className="text-sm text-slate-600">Daily gratitude practices to boost positivity</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🧘</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Mindfulness</h3>
                <p className="text-sm text-slate-600">Present-moment awareness exercises</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏃</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Movement</h3>
                <p className="text-sm text-slate-600">Simple physical activities for mental clarity</p>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardHeader className="text-center pb-6">
              <Badge className="bg-white text-purple-600 mb-4 mx-auto">Premium</Badge>
              <CardTitle className="text-2xl">Unlock Advanced Features</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-semibold mb-2">🎮 Mini-Games</h4>
                  <p className="text-purple-100 text-sm">Unlock wellness-focused mini-games as rewards</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📈 Advanced Analytics</h4>
                  <p className="text-purple-100 text-sm">Deep insights into your wellness patterns</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 Personalized AI</h4>
                  <p className="text-purple-100 text-sm">More sophisticated task recommendations</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🏆 Exclusive Badges</h4>
                  <p className="text-purple-100 text-sm">Premium-only achievements and rewards</p>
                </div>
              </div>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
