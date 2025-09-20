"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WellnessScoreProps {
  score: number
}

export function WellnessScore({ score }: WellnessScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Very Good"
    if (score >= 70) return "Good"
    if (score >= 60) return "Fair"
    if (score >= 50) return "Needs Attention"
    return "Needs Improvement"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const roundedScore = Math.round(score)

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-slate-800 mb-4">Your Wellness Score</CardTitle>
        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-8 border-white shadow-lg">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(roundedScore)}`}>{roundedScore}</div>
              <div className="text-sm text-slate-600">/ 100</div>
            </div>
          </div>
          <Badge
            className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getScoreBadgeColor(roundedScore)}`}
          >
            {getScoreLabel(roundedScore)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-slate-600 mb-4">
            Your wellness score is calculated based on mood patterns, task completion, streak consistency, and stress
            management over the past 7 days.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-lg font-semibold text-emerald-800">Trending</div>
              <div className="text-sm text-emerald-600">↗️ Improving</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-800">Focus Area</div>
              <div className="text-sm text-blue-600">Stress Management</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
