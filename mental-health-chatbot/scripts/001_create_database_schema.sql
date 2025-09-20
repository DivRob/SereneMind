-- Create users profiles table for extended user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  wellness_goals TEXT[],
  preferred_task_types TEXT[]
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create daily tasks table
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('reframe_thought', 'screen_break', 'breathing', 'gratitude', 'mindfulness', 'movement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  points_reward INTEGER DEFAULT 10,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on daily_tasks
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_tasks
CREATE POLICY "daily_tasks_select_own" ON public.daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_tasks_insert_own" ON public.daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_tasks_update_own" ON public.daily_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "daily_tasks_delete_own" ON public.daily_tasks FOR DELETE USING (auth.uid() = user_id);

-- Create task completions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
  completion_data JSONB, -- Store user responses, reflections, etc.
  points_earned INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 10),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 10)
);

-- Enable RLS on task_completions
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_completions
CREATE POLICY "task_completions_select_own" ON public.task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "task_completions_insert_own" ON public.task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "task_completions_update_own" ON public.task_completions FOR UPDATE USING (auth.uid() = user_id);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak', 'points', 'task_count', 'special')),
  requirement_value INTEGER,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value, tier) VALUES
('First Step', 'Complete your first task', '🌟', 'task_count', 1, 'bronze'),
('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 7, 'silver'),
('Point Collector', 'Earn 100 points', '💎', 'points', 100, 'bronze'),
('Mindful Master', 'Complete 50 mindfulness tasks', '🧘', 'task_count', 50, 'gold'),
('Streak Legend', 'Maintain a 30-day streak', '👑', 'streak', 30, 'platinum');

-- Create user badges table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_badges
CREATE POLICY "user_badges_select_own" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_badges_insert_own" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions
CREATE POLICY "chat_sessions_select_own" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_sessions_insert_own" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_sessions_update_own" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "chat_sessions_delete_own" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_messages
CREATE POLICY "chat_messages_select_own" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create wellness insights table for tracking user progress patterns
CREATE TABLE IF NOT EXISTS public.wellness_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('mood_trend', 'task_preference', 'streak_analysis', 'improvement_area')),
  insight_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on wellness_insights
ALTER TABLE public.wellness_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for wellness_insights
CREATE POLICY "wellness_insights_select_own" ON public.wellness_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wellness_insights_insert_own" ON public.wellness_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_date ON public.task_completions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
