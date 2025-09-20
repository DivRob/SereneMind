import { groq } from "@ai-sdk/groq"
import { convertToModelMessages, streamText, type UIMessage, tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

const assignTaskTool = tool({
  description: "Assign a personalized daily micro-task to help improve mental health",
  inputSchema: z.object({
    taskType: z.enum(["reframe_thought", "screen_break", "breathing", "gratitude", "mindfulness", "movement"]),
    title: z.string().describe("Short, encouraging title for the task"),
    description: z.string().describe("Clear instructions for completing the task"),
    difficultyLevel: z.number().min(1).max(5).describe("Difficulty level from 1-5"),
    pointsReward: z.number().min(5).max(50).describe("Points to award for completion"),
  }),
  execute: async ({ taskType, title, description, difficultyLevel, pointsReward }, { messages }) => {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "User not authenticated" }
      }

      // Insert the new task
      const { data: task, error } = await supabase
        .from("daily_tasks")
        .insert({
          user_id: user.id,
          task_type: taskType,
          title,
          description,
          difficulty_level: difficultyLevel,
          points_reward: pointsReward,
          assigned_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          points: task.points_reward,
          type: task.task_type,
        },
      }
    } catch (error) {
      return { success: false, error: "Failed to assign task" }
    }
  },
})

const completeTaskTool = tool({
  description: "Mark a task as completed and award points",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to complete"),
    completionData: z
      .object({
        reflection: z.string().optional().describe("User reflection on the task"),
        moodBefore: z.number().min(1).max(10).optional(),
        moodAfter: z.number().min(1).max(10).optional(),
      })
      .optional(),
  }),
  execute: async ({ taskId, completionData }) => {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "User not authenticated" }
      }

      // Get the task details
      const { data: task, error: taskError } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("id", taskId)
        .eq("user_id", user.id)
        .single()

      if (taskError || !task) {
        return { success: false, error: "Task not found" }
      }

      if (task.is_completed) {
        return { success: false, error: "Task already completed" }
      }

      // Mark task as completed
      const { error: updateError } = await supabase
        .from("daily_tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      // Record task completion
      const { error: completionError } = await supabase.from("task_completions").insert({
        user_id: user.id,
        task_id: taskId,
        completion_data: completionData || {},
        points_earned: task.points_reward,
        mood_before: completionData?.moodBefore,
        mood_after: completionData?.moodAfter,
      })

      if (completionError) {
        return { success: false, error: completionError.message }
      }

      // Update user points and streak
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points, current_streak, last_activity_date")
        .eq("id", user.id)
        .single()

      const today = new Date().toISOString().split("T")[0]
      const lastActivity = profile?.last_activity_date
      const isConsecutiveDay =
        lastActivity && new Date(lastActivity).getTime() === new Date(today).getTime() - 24 * 60 * 60 * 1000

      const newStreak = isConsecutiveDay ? (profile?.current_streak || 0) + 1 : 1

      await supabase
        .from("profiles")
        .update({
          total_points: (profile?.total_points || 0) + task.points_reward,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, profile?.longest_streak || 0),
          last_activity_date: today,
        })
        .eq("id", user.id)

      return {
        success: true,
        pointsEarned: task.points_reward,
        newStreak: newStreak,
        taskTitle: task.title,
      }
    } catch (error) {
      return { success: false, error: "Failed to complete task" }
    }
  },
})

const getUserProgressTool = tool({
  description: "Get user progress and wellness insights",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "User not authenticated" }
      }

      // Get user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      // Get recent tasks
      const { data: recentTasks } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      // Get badges
      const { data: userBadges } = await supabase.from("user_badges").select("badges(*)").eq("user_id", user.id)

      return {
        success: true,
        profile: {
          totalPoints: profile?.total_points || 0,
          currentStreak: profile?.current_streak || 0,
          longestStreak: profile?.longest_streak || 0,
          subscriptionTier: profile?.subscription_tier || "free",
        },
        recentTasks: recentTasks || [],
        badges: userBadges?.map((ub) => ub.badges) || [],
      }
    } catch (error) {
      return { success: false, error: "Failed to get progress" }
    }
  },
})

export async function POST(req: Request) {
  const { messages, sessionId }: { messages: UIMessage[]; sessionId?: string } = await req.json()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Save user message to database
  if (sessionId && messages.length > 0) {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === "user") {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        user_id: user.id,
        role: "user",
        content: typeof lastMessage.content === "string" ? lastMessage.content : JSON.stringify(lastMessage.content),
      })
    }
  }

  const systemPrompt = `You are MindfulAI, a compassionate and knowledgeable mental health companion. Your role is to:

1. Provide personalized daily micro-tasks to improve mental wellness
2. Offer gentle guidance for reframing negative thoughts into positive ones
3. Suggest mindfulness exercises, breathing techniques, and screen breaks
4. Track user progress and celebrate achievements
5. Provide encouragement and motivation

Key principles:
- Always be empathetic, non-judgmental, and supportive
- Focus on small, achievable steps rather than overwhelming changes
- Personalize recommendations based on user's progress and preferences
- Encourage self-reflection and mindfulness
- Never provide medical advice - suggest professional help when appropriate

Available tools:
- assignTask: Create personalized daily micro-tasks
- completeTask: Help users complete tasks and track progress
- getUserProgress: Check user's current progress and achievements

Remember to celebrate small wins and maintain a positive, encouraging tone throughout all interactions.`

  const prompt = convertToModelMessages([{ role: "system", content: systemPrompt }, ...messages])

  const result = streamText({
    model: groq("llama-3.1-70b-versatile"),
    messages: prompt,
    tools: {
      assignTask: assignTaskTool,
      completeTask: completeTaskTool,
      getUserProgress: getUserProgressTool,
    },
    maxSteps: 3,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ response }) => {
      // Save assistant response to database
      if (sessionId && response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1]
        if (lastMessage.role === "assistant") {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            user_id: user.id,
            role: "assistant",
            content:
              typeof lastMessage.content === "string" ? lastMessage.content : JSON.stringify(lastMessage.content),
          })
        }
      }
    },
  })
}
