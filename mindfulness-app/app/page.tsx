"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  Eye,
  Hand,
  Ear,
  Mouse as Nose,
  Bone as Tongue,
  Sparkles,
  Star,
  Moon,
  BookOpen,
  PenTool,
  Calendar,
  ArrowLeft,
} from "lucide-react"

const inspirationalQuotes = [
  "The present moment is the only time over which we have dominion. - Thích Nhất Hạnh",
  "Mindfulness is about being fully awake in our lives. - Jon Kabat-Zinn",
  "Peace comes from within. Do not seek it without. - Buddha",
  "Wherever you are, be there totally. - Eckhart Tolle",
  "The best way to take care of the future is to take care of the present moment. - Thích Nhất Hạnh",
  "Mindfulness is the miracle by which we master and restore ourselves. - Thích Nhất Hạnh",
]

const stepData = [
  {
    number: 5,
    icon: Eye,
    title: "Things You Can See",
    description: "Look around and notice 5 things you can see. Take your time with each one.",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    number: 4,
    icon: Hand,
    title: "Things You Can Touch",
    description: "Notice 4 different textures or objects you can feel right now.",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    number: 3,
    icon: Ear,
    title: "Things You Can Hear",
    description: "Listen carefully and identify 3 different sounds around you.",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    number: 2,
    icon: Nose,
    title: "Things You Can Smell",
    description: "Take a deep breath and notice 2 different scents or aromas.",
    color: "from-rose-500 to-orange-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  {
    number: 1,
    icon: Tongue,
    title: "Thing You Can Taste",
    description: "Notice any taste in your mouth, or take a sip of something nearby.",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
]

export default function MindfulnessApp() {
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [inputs, setInputs] = useState<Record<number, string[]>>({})
  const [currentQuote, setCurrentQuote] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showJournal, setShowJournal] = useState(false)
  const [journalEntry, setJournalEntry] = useState("")
  const [journalEntries, setJournalEntries] = useState<
    Array<{
      id: string
      date: string
      content: string
      mood: string
    }>
  >([])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentStep !== null) {
      const completedSteps = 5 - currentStep + 1
      setProgress((completedSteps / 5) * 100)
    }
  }, [currentStep])

  const startExercise = () => {
    setCurrentStep(5)
    setIsComplete(false)
    setInputs({})
    setProgress(20)
  }

  const nextStep = () => {
    if (currentStep && currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      completeExercise()
    }
  }

  const completeExercise = () => {
    setCurrentStep(null)
    setIsComplete(true)
    setProgress(100)
  }

  const restartExercise = () => {
    setCurrentStep(null)
    setIsComplete(false)
    setInputs({})
    setProgress(0)
  }

  const openJournal = () => {
    setShowJournal(true)
  }

  const closeJournal = () => {
    setShowJournal(false)
    setJournalEntry("")
  }

  const saveJournalEntry = () => {
    if (journalEntry.trim()) {
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        content: journalEntry,
        mood: "peaceful", // Could be expanded to let users select mood
      }
      setJournalEntries((prev) => [newEntry, ...prev])
      setJournalEntry("")
    }
  }

  const updateInput = (stepNum: number, index: number, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [stepNum]: {
        ...prev[stepNum],
        [index]: value,
      },
    }))
  }

  const currentStepData = stepData.find((step) => step.number === currentStep)

  if (showJournal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30">
        {/* Floating decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full float"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-40 right-20 w-3 h-3 bg-primary/30 rounded-full float"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-40 left-20 w-2 h-2 bg-primary/20 rounded-full float"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-20 right-10 w-4 h-4 bg-primary/25 rounded-full float"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl relative">
          {/* Journal Header */}
          <div className="text-center mb-12">
            <div className="breathe w-24 h-24 bg-gradient-to-r from-primary to-primary/80 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <BookOpen className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-6xl font-bold text-foreground mb-6 text-balance">Mindful Journal</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Reflect on your mindfulness journey and capture your thoughts
            </p>
          </div>

          {/* Back Button */}
          <Button
            onClick={closeJournal}
            variant="outline"
            className="mb-8 border-2 border-primary/30 text-primary hover:bg-primary/5 rounded-full bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exercise
          </Button>

          {/* New Journal Entry */}
          <Card className="border-0 shadow-2xl bg-card/90 backdrop-blur-sm mb-8">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <PenTool className="w-6 h-6 text-primary mr-3" />
                <h2 className="font-serif text-2xl font-bold text-foreground">New Entry</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    How are you feeling after your mindfulness practice?
                  </label>
                  <Textarea
                    placeholder="Share your thoughts, feelings, and insights from today's practice..."
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    className="min-h-[150px] text-lg p-4 border-2 border-border/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card/80 backdrop-blur-sm transition-all duration-200 resize-none"
                  />
                </div>

                <Button
                  onClick={saveJournalEntry}
                  disabled={!journalEntry.trim()}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Previous Entries */}
          {journalEntries.length > 0 && (
            <Card className="border-0 shadow-2xl bg-card/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Calendar className="w-6 h-6 text-primary mr-3" />
                  <h2 className="font-serif text-2xl font-bold text-foreground">Previous Reflections</h2>
                </div>

                <div className="space-y-6">
                  {journalEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 overflow-hidden"
                    >
                      <CardContent className="p-6 relative">
                        <div className="shimmer absolute inset-0" />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-primary">{entry.date}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Moon className="w-3 h-3 mr-1" />
                              {entry.mood}
                            </div>
                          </div>
                          <p className="text-foreground/80 leading-relaxed text-pretty">{entry.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inspirational Quote for Journal */}
          <div className="text-center mt-12">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="shimmer absolute inset-0" />
                <p className="text-foreground/80 italic text-lg font-medium relative z-10 text-balance">
                  "Writing is the painting of the voice. Through journaling, we paint our inner landscape."
                </p>
                <p className="text-muted-foreground text-sm mt-3 relative z-10">— Voltaire (adapted)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full float"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-20 w-3 h-3 bg-primary/30 rounded-full float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-20 w-2 h-2 bg-primary/20 rounded-full float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 right-10 w-4 h-4 bg-primary/25 rounded-full float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="breathe w-24 h-24 bg-gradient-to-r from-primary to-primary/80 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <Heart className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-6xl font-bold text-foreground mb-6 text-balance">Mindful Moments</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            A grounding technique to help you reconnect with the present moment through your five senses
          </p>
        </div>

        {/* Progress Section */}
        {(currentStep !== null || isComplete) && (
          <Card className="mb-8 border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-border"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="351.86"
                      strokeDashoffset={351.86 - (progress / 100) * 351.86}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(139, 92, 246)" />
                        <stop offset="100%" stopColor="rgb(168, 85, 247)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                  </div>
                </div>
                <p className="text-lg font-medium text-foreground">
                  {isComplete
                    ? "Exercise Complete!"
                    : currentStep
                      ? `Step ${6 - currentStep}: ${currentStepData?.title}`
                      : "Ready to begin"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Screen */}
        {currentStep === null && !isComplete && (
          <Card className="border-0 shadow-2xl bg-card/90 backdrop-blur-sm mb-8">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <Sparkles className="w-16 h-16 text-primary mx-auto mb-6 float" />
                <h2 className="font-serif text-4xl font-bold text-foreground mb-6 text-balance">
                  Welcome to Your Mindful Moment
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto text-pretty">
                  The 54321 technique helps ground you by engaging all five senses. Take your time with each step and
                  breathe deeply.
                </p>
              </div>

              {/* Inspirational Quote */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 mb-8 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="shimmer absolute inset-0" />
                  <p className="text-foreground/80 italic text-lg font-medium relative z-10 text-balance">
                    "{inspirationalQuotes[currentQuote]}"
                  </p>
                </CardContent>
              </Card>

              <Button
                onClick={startExercise}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-12 py-6 text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 pulse-glow"
              >
                <Heart className="w-6 h-6 mr-3" />
                Begin Mindfulness Exercise
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Exercise Steps */}
        {currentStep !== null && currentStepData && (
          <Card
            className={`border-0 shadow-2xl ${currentStepData.bgColor} backdrop-blur-sm mb-8 ${currentStepData.borderColor} border-2`}
          >
            <CardContent className="p-12">
              <div className="text-center mb-10">
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${currentStepData.color} rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl float`}
                >
                  <currentStepData.icon className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-serif text-4xl font-bold text-foreground mb-4 text-balance">
                  {currentStepData.number} {currentStepData.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
                  {currentStepData.description}
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {Array.from({ length: currentStepData.number }, (_, index) => (
                  <div key={index} className="relative">
                    <Input
                      placeholder={`${index + 1}. Something you can ${currentStepData.title.toLowerCase().replace("things you can ", "")}...`}
                      value={inputs[currentStep]?.[index] || ""}
                      onChange={(e) => updateInput(currentStep, index, e.target.value)}
                      className="text-lg p-6 border-2 border-border/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card/80 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={nextStep}
                size="lg"
                className={`w-full bg-gradient-to-r ${currentStepData.color} hover:opacity-90 text-white py-6 text-xl font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300`}
              >
                {currentStep === 1
                  ? "Complete Exercise"
                  : `Continue to ${stepData.find((s) => s.number === currentStep - 1)?.title}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completion Screen */}
        {isComplete && (
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-accent/10 to-secondary/20 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <div className="relative">
                  <Star className="w-20 h-20 text-amber-400 mx-auto mb-6 float" />
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-primary float" style={{ animationDelay: "1s" }} />
                  </div>
                </div>
                <h2 className="font-serif text-5xl font-bold text-foreground mb-6 text-balance">Beautifully Done!</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto text-pretty">
                  You've successfully completed the 54321 mindfulness exercise. Take a moment to notice how you feel
                  right now compared to when you started.
                </p>
              </div>

              {/* Completion Quote */}
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/30 mb-10 overflow-hidden">
                <CardContent className="p-8 relative">
                  <div className="shimmer absolute inset-0" />
                  <Moon className="w-8 h-8 text-primary/60 mx-auto mb-4 relative z-10" />
                  <p className="text-foreground italic text-xl font-medium relative z-10 text-balance">
                    "The present moment is filled with joy and happiness. If you are attentive, you will see it."
                  </p>
                  <p className="text-muted-foreground text-sm mt-3 relative z-10">— Thích Nhất Hạnh</p>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={restartExercise}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-10 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Practice Again
                </Button>
                <Button
                  onClick={openJournal}
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary/30 text-primary hover:bg-primary/5 px-10 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-transparent"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Journal Your Experience
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Quote */}
        {currentStep === null && !isComplete && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground italic text-lg text-balance">
              "Mindfulness is the miracle by which we master and restore ourselves."
            </p>
            <p className="text-muted-foreground text-sm mt-2">— Thích Nhất Hạnh</p>
          </div>
        )}
      </div>
    </div>
  )
}
