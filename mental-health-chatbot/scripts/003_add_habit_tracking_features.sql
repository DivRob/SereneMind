-- Create mood tracking table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  notes TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Enable RLS on mood_entries
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for mood_entries
CREATE POLICY "mood_entries_select_own" ON public.mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mood_entries_insert_own" ON public.mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mood_entries_update_own" ON public.mood_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "mood_entries_delete_own" ON public.mood_entries FOR DELETE USING (auth.uid() = user_id);

-- Create habit streaks table for detailed streak tracking
CREATE TABLE IF NOT EXISTS public.habit_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_type TEXT NOT NULL CHECK (habit_type IN ('daily_tasks', 'mood_tracking', 'chat_sessions')),
  streak_start DATE NOT NULL,
  streak_end DATE,
  streak_length INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on habit_streaks
ALTER TABLE public.habit_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for habit_streaks
CREATE POLICY "habit_streaks_select_own" ON public.habit_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habit_streaks_insert_own" ON public.habit_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_streaks_update_own" ON public.habit_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Create weekly goals table
CREATE TABLE IF NOT EXISTS public.weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('tasks_completed', 'mood_improvement', 'streak_maintenance', 'points_earned')),
  target_value INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start, goal_type)
);

-- Enable RLS on weekly_goals
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekly_goals
CREATE POLICY "weekly_goals_select_own" ON public.weekly_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "weekly_goals_insert_own" ON public.weekly_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weekly_goals_update_own" ON public.weekly_goals FOR UPDATE USING (auth.uid() = user_id);

-- Create function to get user analytics
CREATE OR REPLACE FUNCTION public.get_user_analytics(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  task_stats JSON;
  mood_stats JSON;
  streak_stats JSON;
  weekly_stats JSON;
BEGIN
  -- Task completion statistics
  SELECT json_build_object(
    'total_completed', COUNT(*),
    'avg_points_per_task', COALESCE(AVG(points_earned), 0),
    'favorite_task_type', (
      SELECT dt.task_type 
      FROM task_completions tc 
      JOIN daily_tasks dt ON tc.task_id = dt.id 
      WHERE tc.user_id = p_user_id 
        AND tc.completed_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
      GROUP BY dt.task_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    'completion_by_day', (
      SELECT json_agg(
        json_build_object(
          'date', date_trunc('day', completed_at)::date,
          'count', count
        ) ORDER BY date_trunc('day', completed_at)
      )
      FROM (
        SELECT 
          date_trunc('day', completed_at) as day,
          COUNT(*) as count
        FROM task_completions 
        WHERE user_id = p_user_id 
          AND completed_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
        GROUP BY date_trunc('day', completed_at)
      ) daily_counts
    )
  ) INTO task_stats
  FROM task_completions 
  WHERE user_id = p_user_id 
    AND completed_at >= CURRENT_DATE - INTERVAL '1 day' * p_days;

  -- Mood tracking statistics
  SELECT json_build_object(
    'avg_mood', COALESCE(AVG(mood_score), 0),
    'avg_energy', COALESCE(AVG(energy_level), 0),
    'avg_stress', COALESCE(AVG(stress_level), 0),
    'mood_trend', (
      SELECT json_agg(
        json_build_object(
          'date', entry_date,
          'mood', mood_score,
          'energy', energy_level,
          'stress', stress_level
        ) ORDER BY entry_date
      )
      FROM mood_entries 
      WHERE user_id = p_user_id 
        AND entry_date >= CURRENT_DATE - INTERVAL '1 day' * p_days
    ),
    'entries_count', COUNT(*)
  ) INTO mood_stats
  FROM mood_entries 
  WHERE user_id = p_user_id 
    AND entry_date >= CURRENT_DATE - INTERVAL '1 day' * p_days;

  -- Streak statistics
  SELECT json_build_object(
    'current_streaks', json_agg(
      json_build_object(
        'habit_type', habit_type,
        'streak_length', streak_length,
        'streak_start', streak_start
      )
    ) FILTER (WHERE is_active = true),
    'longest_streak', COALESCE(MAX(streak_length), 0)
  ) INTO streak_stats
  FROM habit_streaks 
  WHERE user_id = p_user_id;

  -- Weekly progress
  SELECT json_build_object(
    'current_week_goals', json_agg(
      json_build_object(
        'goal_type', goal_type,
        'target_value', target_value,
        'current_progress', current_progress,
        'is_completed', is_completed,
        'completion_percentage', ROUND((current_progress::float / target_value::float) * 100, 1)
      )
    )
  ) INTO weekly_stats
  FROM weekly_goals 
  WHERE user_id = p_user_id 
    AND week_start = date_trunc('week', CURRENT_DATE)::date;

  -- Combine all statistics
  result := json_build_object(
    'tasks', COALESCE(task_stats, '{}'::json),
    'mood', COALESCE(mood_stats, '{}'::json),
    'streaks', COALESCE(streak_stats, '{}'::json),
    'weekly', COALESCE(weekly_stats, '{}'::json),
    'generated_at', NOW()
  );

  RETURN result;
END;
$$;

-- Create function to update weekly goals progress
CREATE OR REPLACE FUNCTION public.update_weekly_goals(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_start DATE := date_trunc('week', CURRENT_DATE)::date;
  tasks_this_week INTEGER;
  points_this_week INTEGER;
  current_streak INTEGER;
BEGIN
  -- Get current week statistics
  SELECT COUNT(*) INTO tasks_this_week
  FROM task_completions tc
  JOIN daily_tasks dt ON tc.task_id = dt.id
  WHERE tc.user_id = p_user_id 
    AND tc.completed_at >= week_start
    AND tc.completed_at < week_start + INTERVAL '7 days';

  SELECT COALESCE(SUM(points_earned), 0) INTO points_this_week
  FROM task_completions 
  WHERE user_id = p_user_id 
    AND completed_at >= week_start
    AND completed_at < week_start + INTERVAL '7 days';

  SELECT COALESCE(current_streak, 0) INTO current_streak
  FROM profiles 
  WHERE id = p_user_id;

  -- Update or create weekly goals
  INSERT INTO weekly_goals (user_id, week_start, goal_type, target_value, current_progress)
  VALUES 
    (p_user_id, week_start, 'tasks_completed', 7, tasks_this_week),
    (p_user_id, week_start, 'points_earned', 100, points_this_week),
    (p_user_id, week_start, 'streak_maintenance', 7, LEAST(current_streak, 7))
  ON CONFLICT (user_id, week_start, goal_type) 
  DO UPDATE SET 
    current_progress = EXCLUDED.current_progress,
    is_completed = (EXCLUDED.current_progress >= weekly_goals.target_value);
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON public.mood_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_habit_streaks_user_active ON public.habit_streaks(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_week ON public.weekly_goals(user_id, week_start);
