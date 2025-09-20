"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface MoodEntry {
  id: string
  mood_score: number
  energy_level: number
  stress_level: number
  notes: string
  entry_date: string
}

interface MoodTrackerProps {
  userId: string
  recentMoods: MoodEntry[]
}

export function MoodTracker({ userId, recentMoods }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null)
  const [selectedStress, setSelectedStress] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!selectedMood) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("mood_entries").upsert({
        user_id: userId,
        mood_score: selectedMood,
        energy_level: selectedEnergy,
        stress_level: selectedStress,
        notes: notes.trim() || null,
        entry_date: new Date().toISOString().split("T")[0],
      })

      if (error) throw error

      // Reset form
      setSelectedMood(null)
      setSelectedEnergy(null)
      setSelectedStress(null)
      setNotes("")
      setShowForm(false)

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error saving mood entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMoodEmoji = (score: number) => {
    if (score <= 2) return "😢"
    if (score <= 4) return "😕"
    if (score <= 6) return "😐"
    if (score <= 8) return "🙂"
    return "😊"
  }

  const getEnergyEmoji = (score: number) => {
    if (score <= 3) return "🔋"
    if (score <= 6) return "🔋🔋"
    return "🔋🔋🔋"
  }

  const getStressColor = (score: number) => {
    if (score <= 3) return "text-green-600"
    if (score <= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const todayEntry = recentMoods.find((mood) => mood.entry_date === new Date().toISOString().split("T")[0])

  return (
    <div className="space-y-4">
      {/* Today's Entry or Form */}
      {todayEntry ? (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-emerald-800">Today's Mood</h4>
              <Badge className="bg-emerald-100 text-emerald-800">Logged</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">{getMoodEmoji(todayEntry.mood_score)}</div>
                <div className="text-sm text-emerald-700">Mood: {todayEntry.mood_score}/10</div>
              </div>
              <div>
                <div className="text-2xl mb-1">{getEnergyEmoji(todayEntry.energy_level)}</div>
                <div className="text-sm text-emerald-700">Energy: {todayEntry.energy_level}/10</div>
              </div>
              <div>
                <div className="text-2xl mb-1">😰</div>
                <div className={`text-sm ${getStressColor(todayEntry.stress_level)}`}>
                  Stress: {todayEntry.stress_level}/10
                </div>
              </div>
            </div>
            {todayEntry.notes && (
              <div className="mt-3 p-2 bg-white rounded border border-emerald-200">
                <p className="text-sm text-slate-600">{todayEntry.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : showForm ? (
        <div className="space-y-4">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">How are you feeling today? (1-10)</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => setSelectedMood(score)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedMood === score
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Energy Level (1-10)</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => setSelectedEnergy(score)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedEnergy === score
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Stress Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Stress Level (1-10)</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => setSelectedStress(score)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedStress === score
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white text-slate-700 border-slate-200 hover:border-red-300"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? What's on your mind?"
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-slate-600 mb-4">Track your mood for today</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            Log Today's Mood
          </Button>
        </div>
      )}

      {/* Recent Entries */}
      {recentMoods.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Recent Entries</h4>
          <div className="space-y-2">
            {recentMoods.slice(0, 5).map((mood) => (
              <div
                key={mood.id}
                className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getMoodEmoji(mood.mood_score)}</span>
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {new Date(mood.entry_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      Mood: {mood.mood_score} • Energy: {mood.energy_level} • Stress: {mood.stress_level}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
