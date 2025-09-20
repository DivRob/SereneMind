"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Timer, PenTool, Heart, Star, Trophy, Sparkles, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface UserData {
  points: number
  completedTasks: number
  badges: string[]
  thoughtHistory: Array<{
    negative: string
    positive: string
    timestamp: string
  }>
  streak: number
  mood: number[]
}

interface Task {
  id: string
  type: "reframe" | "screen-break" | "inspiration" | "mood"
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

export default function WellnessApp() {
  const { theme, setTheme } = useTheme()
  const [currentView, setCurrentView] = useState<string>("dashboard")
  const [userData, setUserData] = useState<UserData>({
    points: 0,
    completedTasks: 0,
    badges: [],
    thoughtHistory: [],
    streak: 0,
    mood: [],
  })
  const [dailyMessage, setDailyMessage] = useState<string>("Welcome to your wellness journey!")
  const [reframeInput, setReframeInput] = useState("")
  const [reframeOutput, setReframeOutput] = useState("")
  const [isReframing, setIsReframing] = useState(false)
  const [inspirationPrompt, setInspirationPrompt] = useState("")
  const [inspirationInput, setInspirationInput] = useState("")
  const [screenBreakTimer, setScreenBreakTimer] = useState(30)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentMood, setCurrentMood] = useState(5)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  const tasks: Task[] = [
    {
      id: "reframe",
      type: "reframe",
      title: "Thought Reframing",
      description: "Transform negative thoughts into positive ones",
      icon: <Brain className="w-6 h-6" />,
      color: "bg-primary",
    },
    {
      id: "screen-break",
      type: "screen-break",
      title: "Mindful Break",
      description: "Take a 30-second breathing break",
      icon: <Timer className="w-6 h-6" />,
      color: "bg-secondary",
    },
    {
      id: "inspiration",
      type: "inspiration",
      title: "Creative Writing",
      description: "Express yourself through creative writing",
      icon: <PenTool className="w-6 h-6" />,
      color: "bg-accent",
    },
    {
      id: "mood",
      type: "mood",
      title: "Mood Check-in",
      description: "Track how you're feeling today",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-chart-3",
    },
  ]

  // Load user data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("wellnessAppUserData")
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }
    generateDailyMessage()
  }, [])

  // Save user data to localStorage
  const updateUserData = (updates: Partial<UserData>) => {
    const newUserData = { ...userData, ...updates }

    // Award badges based on points
    const newBadges = [...newUserData.badges]
    if (newUserData.points >= 10 && !newBadges.includes("Novice")) newBadges.push("Novice")
    if (newUserData.points >= 50 && !newBadges.includes("Habit Builder")) newBadges.push("Habit Builder")
    if (newUserData.points >= 100 && !newBadges.includes("Mindful Master")) newBadges.push("Mindful Master")
    if (newUserData.streak >= 7 && !newBadges.includes("Week Warrior")) newBadges.push("Week Warrior")

    newUserData.badges = newBadges
    setUserData(newUserData)
    localStorage.setItem("wellnessAppUserData", JSON.stringify(newUserData))
  }

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const generateDailyMessage = () => {
    const messages = [
      "Today is a new opportunity to grow and flourish.",
      "Your mental wellness journey matters. Take it one step at a time.",
      "Every small positive action creates ripples of change.",
      "You have the strength to overcome any challenge today.",
      "Breathe deeply and embrace the present moment.",
      "Your thoughts shape your reality. Choose them wisely.",
      "Progress, not perfection, is the goal.",
      "You are worthy of love, peace, and happiness.",
    ]
    setDailyMessage(messages[Math.floor(Math.random() * messages.length)])
  }

  const handleReframeThought = async () => {
    if (!reframeInput.trim()) return

    setIsReframing(true)
    setReframeOutput("Reframing your thought...")

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const reframedThought = `Let's reframe that... Instead of "${reframeInput}", try thinking: "This is a challenge I can learn from and overcome with patience and self-compassion."`
      setReframeOutput(reframedThought)

      updateUserData({
        points: userData.points + 5,
        completedTasks: userData.completedTasks + 1,
        thoughtHistory: [
          ...userData.thoughtHistory,
          {
            negative: reframeInput,
            positive: reframedThought,
            timestamp: new Date().toISOString(),
          },
        ],
      })

      showNotificationMessage("Great work! +5 points earned!")
      setIsReframing(false)
    }, 2000)
  }

  const startScreenBreak = () => {
    setIsTimerRunning(true)
    const timer = setInterval(() => {
      setScreenBreakTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsTimerRunning(false)
          updateUserData({
            points: userData.points + 3,
            completedTasks: userData.completedTasks + 1,
          })
          showNotificationMessage("Mindful break complete! +3 points!")
          setScreenBreakTimer(30)
          return 30
        }
        return prev - 1
      })
    }, 1000)
  }

  const generateInspirationPrompt = () => {
    const prompts = [
      "Write about a moment when you felt truly at peace.",
      "Describe your ideal day from start to finish.",
      "What would you tell your younger self?",
      "Write about a place that makes you feel safe and happy.",
      "Describe a challenge you overcame and how it changed you.",
      "What are three things you're grateful for today?",
      "Write about someone who inspires you and why.",
      "Describe your hopes and dreams for the future.",
    ]
    setInspirationPrompt(prompts[Math.floor(Math.random() * prompts.length)])
  }

  const submitInspiration = () => {
    if (inspirationInput.trim()) {
      updateUserData({
        points: userData.points + 5,
        completedTasks: userData.completedTasks + 1,
      })
      showNotificationMessage("Beautiful writing! +5 points!")
      setInspirationInput("")
      setCurrentView("dashboard")
    }
  }

  const submitMoodCheck = () => {
    updateUserData({
      points: userData.points + 2,
      completedTasks: userData.completedTasks + 1,
      mood: [...userData.mood, currentMood],
    })
    showNotificationMessage("Mood logged! +2 points!")
    setCurrentView("dashboard")
  }

  const getRandomTask = () => {
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
    if (randomTask.type === "inspiration") {
      generateInspirationPrompt()
    }
    setCurrentView(randomTask.type)
  }

  const renderDashboard = () => (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Wellness Journey</h1>
          <p className="text-muted-foreground mt-1">{dailyMessage}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points</p>
                <p className="text-3xl font-bold text-primary">{userData.points}</p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-secondary">{userData.completedTasks}</p>
              </div>
              <Trophy className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-3xl font-bold text-accent">{userData.streak}</p>
              </div>
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {userData.badges.length > 0 && (
        <Card className="bg-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Your Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userData.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="bg-secondary text-secondary-foreground">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Task */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold text-card-foreground mb-2">Ready for Today's Challenge?</h2>
          <p className="text-muted-foreground mb-4">Choose a wellness activity to boost your mental health</p>
          <Button onClick={getRandomTask} className="bg-primary hover:bg-primary/90 text-primary-foreground pulse-glow">
            Get Random Task
          </Button>
        </CardContent>
      </Card>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className="bg-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer float-animation"
            onClick={() => {
              if (task.type === "inspiration") generateInspirationPrompt()
              setCurrentView(task.type)
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${task.color} text-white`}>{task.icon}</div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Thought History */}
      {userData.thoughtHistory.length > 0 && (
        <Card className="bg-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Recent Reframes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userData.thoughtHistory
              .slice(-3)
              .reverse()
              .map((thought, index) => (
                <div key={index} className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium text-destructive mb-1">"{thought.negative}"</p>
                  <p className="text-sm text-muted-foreground">"{thought.positive}"</p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderReframeGame = () => (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="bg-card border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
            <Brain className="w-8 h-8" />
            Thought Reframing
          </CardTitle>
          <p className="text-muted-foreground">Transform negative thoughts into positive ones</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-card-foreground mb-2 block">
              What negative thought are you having?
            </label>
            <Input
              value={reframeInput}
              onChange={(e) => setReframeInput(e.target.value)}
              placeholder="I'm not good enough..."
              className="bg-input border-border"
            />
          </div>

          <Button
            onClick={handleReframeThought}
            disabled={isReframing || !reframeInput.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isReframing ? "Reframing..." : "Reframe This Thought"}
          </Button>

          {reframeOutput && (
            <Card className="bg-muted border-0">
              <CardContent className="p-4">
                <p className="text-card-foreground">{reframeOutput}</p>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderScreenBreak = () => (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="bg-card border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-secondary flex items-center justify-center gap-2">
            <Timer className="w-8 h-8" />
            Mindful Break
          </CardTitle>
          <p className="text-muted-foreground">Take a moment to breathe and relax</p>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className={`text-8xl font-bold text-secondary ${isTimerRunning ? "breathe-animation" : ""}`}>
            {screenBreakTimer}
          </div>

          <p className="text-muted-foreground">
            {isTimerRunning ? "Close your eyes and breathe deeply..." : "Ready for a mindful break?"}
          </p>

          <Button
            onClick={startScreenBreak}
            disabled={isTimerRunning}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {isTimerRunning ? "Breathing..." : "Start 30-Second Break"}
          </Button>

          <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderInspiration = () => (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="bg-card border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-accent flex items-center justify-center gap-2">
            <PenTool className="w-8 h-8" />
            Creative Writing
          </CardTitle>
          <p className="text-muted-foreground">Express yourself through words</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="p-4">
              <p className="text-card-foreground font-medium italic">"{inspirationPrompt}"</p>
            </CardContent>
          </Card>

          <div>
            <label className="text-sm font-medium text-card-foreground mb-2 block">Your response:</label>
            <Textarea
              value={inspirationInput}
              onChange={(e) => setInspirationInput(e.target.value)}
              placeholder="Start writing here..."
              rows={6}
              className="bg-input border-border resize-none"
            />
          </div>

          <Button
            onClick={submitInspiration}
            disabled={!inspirationInput.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Submit Your Writing
          </Button>

          <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderMoodCheck = () => (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="bg-card border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-chart-3 flex items-center justify-center gap-2">
            <Heart className="w-8 h-8" />
            Mood Check-in
          </CardTitle>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {currentMood <= 2
                ? "😢"
                : currentMood <= 4
                  ? "😐"
                  : currentMood <= 6
                    ? "🙂"
                    : currentMood <= 8
                      ? "😊"
                      : "😄"}
            </div>
            <p className="text-lg font-medium text-card-foreground">
              {currentMood <= 2
                ? "Not great"
                : currentMood <= 4
                  ? "Could be better"
                  : currentMood <= 6
                    ? "Okay"
                    : currentMood <= 8
                      ? "Good"
                      : "Excellent!"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Rate your mood (1-10):</label>
            <input
              type="range"
              min="1"
              max="10"
              value={currentMood}
              onChange={(e) => setCurrentMood(Number.parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <Button onClick={submitMoodCheck} className="w-full bg-chart-3 hover:bg-chart-3/90 text-white">
            Log My Mood
          </Button>

          <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right">
          {notificationMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl">
        {currentView === "dashboard" && renderDashboard()}
        {currentView === "reframe" && renderReframeGame()}
        {currentView === "screen-break" && renderScreenBreak()}
        {currentView === "inspiration" && renderInspiration()}
        {currentView === "mood" && renderMoodCheck()}
      </div>
    </div>
  )
}
