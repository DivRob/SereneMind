"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ChatSession {
  id: string
  title: string
  created_at: string
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>("")
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId },
    }),
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm MindfulAI, your personal wellness companion. I'm here to help you build healthy habits through personalized micro-tasks and gentle guidance. How are you feeling today?",
      },
    ],
  })

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      await loadSessions(user.id)
      await createNewSession(user.id)
    }

    checkUser()
  }, [])

  const loadSessions = async (userId: string) => {
    const { data } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10)

    setSessions(data || [])
  }

  const createNewSession = async (userId: string) => {
    const { data } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        title: "New Chat",
      })
      .select()
      .single()

    if (data) {
      setSessionId(data.id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const message = formData.get("message") as string

    if (message.trim()) {
      sendMessage({ text: message })
      e.currentTarget.reset()
    }
  }

  const renderMessageContent = (content: any) => {
    if (typeof content === "string") {
      return content
    }

    // Handle tool calls and results
    if (Array.isArray(content)) {
      return content.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.text}</span>
        }
        if (part.type === "tool-call") {
          return (
            <div key={index} className="my-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-sm font-medium text-emerald-800">
                {part.toolName === "assignTask" && "🎯 Assigning new task..."}
                {part.toolName === "completeTask" && "✅ Completing task..."}
                {part.toolName === "getUserProgress" && "📊 Checking progress..."}
              </div>
            </div>
          )
        }
        if (part.type === "tool-result") {
          const result = part.result
          if (result.success && result.task) {
            return (
              <Card key={index} className="my-2 border-emerald-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    🎯 New Task Assigned
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      +{result.task.points} points
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-slate-800 mb-2">{result.task.title}</h4>
                  <p className="text-slate-600 text-sm">{result.task.description}</p>
                </CardContent>
              </Card>
            )
          }
          if (result.success && result.pointsEarned) {
            return (
              <div key={index} className="my-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-800 font-medium">🎉 Task completed! +{result.pointsEarned} points</div>
                <div className="text-green-600 text-sm">Current streak: {result.newStreak} days</div>
              </div>
            )
          }
        }
        return null
      })
    }

    return JSON.stringify(content)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-800">MindfulAI Chat</h1>
            </div>
            <p className="text-slate-600">Your personal wellness companion</p>
          </div>

          <Card className="shadow-xl border-0 h-[600px] flex flex-col">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-800">Wellness Chat</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard")}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    Dashboard
                  </Button>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                          : "bg-white border border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="text-sm leading-relaxed">{renderMessageContent(message.content)}</div>
                    </div>
                  </div>
                ))}
                {status === "in_progress" && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-200"></div>
                        <span className="text-sm">MindfulAI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-slate-100 p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  name="message"
                  placeholder="Share how you're feeling or ask for a wellness task..."
                  className="flex-1 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={status === "in_progress"}
                />
                <Button
                  type="submit"
                  disabled={status === "in_progress"}
                  className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  Send
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
