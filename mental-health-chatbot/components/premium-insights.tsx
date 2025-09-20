"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface PremiumInsightsProps {
  insights: any
}

export function PremiumInsights({ insights }: PremiumInsightsProps) {
  if (!insights || insights.error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🧠 AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500">{insights?.error || "Generating insights based on your activity..."}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const personalityProfile = insights.personality_profile || {}
  const optimizationTips = insights.optimization_recommendations || []
  const wellnessScore = insights.wellness_score || 0
  const dataQuality = insights.data_quality || "Low"

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "High":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Personality Profile */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">🧠 AI Personality Analysis</CardTitle>
            <Badge className={getQualityColor(dataQuality)}>{dataQuality} Data Quality</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Consistency Level</h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {personalityProfile.consistency_level || "Analyzing..."}
              </div>
              <p className="text-sm text-blue-600">Based on your task completion patterns</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Stress Resilience</h4>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {personalityProfile.stress_resilience || "Analyzing..."}
              </div>
              <p className="text-sm text-green-600">Your ability to manage stress effectively</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Emotional Stability</h4>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {personalityProfile.emotional_stability || "Analyzing..."}
              </div>
              <p className="text-sm text-purple-600">Consistency in your emotional responses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🎯 AI Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {optimizationTips.length > 0 ? (
            <div className="space-y-4">
              {optimizationTips.map((tip: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-emerald-800">{tip.category}</h4>
                    <Badge variant="outline" className="text-xs">
                      {Math.round((tip.confidence || 0) * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-emerald-700 text-sm">{tip.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Complete more activities to receive personalized optimization tips</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wellness Score Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📊 Wellness Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(wellnessScore)}`}>{Math.round(wellnessScore)}</div>
            <p className="text-slate-600">Overall Wellness Score</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Mood Stability</span>
                <span className="text-sm text-slate-600">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Task Completion</span>
                <span className="text-sm text-slate-600">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Streak Consistency</span>
                <span className="text-sm text-slate-600">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Stress Management</span>
                <span className="text-sm text-slate-600">79%</span>
              </div>
              <Progress value={79} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
