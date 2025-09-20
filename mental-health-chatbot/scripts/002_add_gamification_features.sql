-- Add more badge types and achievements
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value, tier) VALUES
('Early Bird', 'Complete a task before 9 AM', '🌅', 'special', 1, 'bronze'),
('Night Owl', 'Complete a task after 9 PM', '🦉', 'special', 1, 'bronze'),
('Perfectionist', 'Complete all daily tasks for 3 days straight', '💯', 'special', 3, 'silver'),
('Mood Booster', 'Improve mood by 3+ points in a single task', '😊', 'special', 1, 'bronze'),
('Consistency King', 'Complete at least one task every day for 14 days', '👑', 'streak', 14, 'gold'),
('Point Master', 'Earn 500 total points', '⭐', 'points', 500, 'silver'),
('Task Crusher', 'Complete 100 total tasks', '💪', 'task_count', 100, 'gold'),
('Zen Master', 'Complete 25 mindfulness tasks', '☯️', 'task_count', 25, 'silver'),
('Breath Work Pro', 'Complete 20 breathing exercises', '🌬️', 'task_count', 20, 'silver'),
('Gratitude Guru', 'Complete 30 gratitude tasks', '🙏', 'task_count', 30, 'silver');

-- Create mini-games table
CREATE TABLE IF NOT EXISTS public.mini_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('memory', 'puzzle', 'breathing', 'focus')),
  unlock_requirement TEXT NOT NULL CHECK (unlock_requirement IN ('points', 'streak', 'badge', 'premium')),
  unlock_value INTEGER,
  unlock_badge_id UUID REFERENCES public.badges(id),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert mini-games
INSERT INTO public.mini_games (name, description, game_type, unlock_requirement, unlock_value, is_premium) VALUES
('Memory Garden', 'Match pairs of wellness symbols to grow your mental garden', 'memory', 'points', 50, FALSE),
('Breath Bubbles', 'Pop bubbles in rhythm with your breathing pattern', 'breathing', 'streak', 3, FALSE),
('Zen Puzzle', 'Arrange peaceful scenes while practicing mindfulness', 'puzzle', 'points', 100, FALSE),
('Focus Flow', 'Guide a stream of light through obstacles using concentration', 'focus', 'streak', 7, TRUE),
('Mindful Maze', 'Navigate through a calming maze using present-moment awareness', 'puzzle', 'points', 200, TRUE),
('Serenity Sequence', 'Remember and repeat sequences of calming sounds and colors', 'memory', 'streak', 14, TRUE);

-- Enable RLS on mini_games
ALTER TABLE public.mini_games ENABLE ROW LEVEL SECURITY;

-- RLS policies for mini_games (read-only for users)
CREATE POLICY "mini_games_select_all" ON public.mini_games FOR SELECT TO authenticated USING (true);

-- Create user game progress table
CREATE TABLE IF NOT EXISTS public.user_game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.mini_games(id) ON DELETE CASCADE,
  high_score INTEGER DEFAULT 0,
  times_played INTEGER DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE,
  is_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS on user_game_progress
ALTER TABLE public.user_game_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_game_progress
CREATE POLICY "user_game_progress_select_own" ON public.user_game_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_game_progress_insert_own" ON public.user_game_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_game_progress_update_own" ON public.user_game_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create achievements tracking table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_achievements
CREATE POLICY "user_achievements_select_own" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_achievements_insert_own" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE(new_badges JSON)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  badge_record RECORD;
  task_counts RECORD;
  new_badge_list JSON[] := '{}';
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Get task completion counts
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE task_type = 'mindfulness') as mindfulness_count,
    COUNT(*) FILTER (WHERE task_type = 'breathing') as breathing_count,
    COUNT(*) FILTER (WHERE task_type = 'gratitude') as gratitude_count
  INTO task_counts
  FROM public.task_completions 
  WHERE user_id = p_user_id;

  -- Check each badge requirement
  FOR badge_record IN SELECT * FROM public.badges LOOP
    -- Skip if user already has this badge
    IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = p_user_id AND badge_id = badge_record.id) THEN
      CONTINUE;
    END IF;

    -- Check badge requirements
    CASE badge_record.requirement_type
      WHEN 'points' THEN
        IF user_profile.total_points >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
          new_badge_list := array_append(new_badge_list, row_to_json(badge_record));
        END IF;
      
      WHEN 'streak' THEN
        IF user_profile.current_streak >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
          new_badge_list := array_append(new_badge_list, row_to_json(badge_record));
        END IF;
      
      WHEN 'task_count' THEN
        IF badge_record.name = 'Mindful Master' AND task_counts.mindfulness_count >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
          new_badge_list := array_append(new_badge_list, row_to_json(badge_record));
        ELSIF badge_record.name = 'Breath Work Pro' AND task_counts.breathing_count >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
          new_badge_list := array_append(new_badge_list, row_to_json(badge_record));
        ELSIF badge_record.name = 'Gratitude Guru' AND task_counts.gratitude_count >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
          new_badge_list := array_append(new_badge_list, row_to_json(badge_record));
        ELSIF task_counts.total_tasks >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
          new_badge_list := array_append(new_badge_list, row_to_json(badge_record));
        END IF;
    END CASE;
  END LOOP;

  RETURN QUERY SELECT array_to_json(new_badge_list);
END;
$$;

-- Create function to unlock mini-games based on progress
CREATE OR REPLACE FUNCTION public.check_and_unlock_games(p_user_id UUID)
RETURNS TABLE(unlocked_games JSON)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  game_record RECORD;
  unlocked_game_list JSON[] := '{}';
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Check each game unlock requirement
  FOR game_record IN SELECT * FROM public.mini_games LOOP
    -- Skip if user already has this game unlocked
    IF EXISTS (SELECT 1 FROM public.user_game_progress WHERE user_id = p_user_id AND game_id = game_record.id AND is_unlocked = true) THEN
      CONTINUE;
    END IF;

    -- Skip premium games for free users
    IF game_record.is_premium AND user_profile.subscription_tier != 'premium' THEN
      CONTINUE;
    END IF;

    -- Check unlock requirements
    CASE game_record.unlock_requirement
      WHEN 'points' THEN
        IF user_profile.total_points >= game_record.unlock_value THEN
          INSERT INTO public.user_game_progress (user_id, game_id, is_unlocked) 
          VALUES (p_user_id, game_record.id, true)
          ON CONFLICT (user_id, game_id) DO UPDATE SET is_unlocked = true;
          unlocked_game_list := array_append(unlocked_game_list, row_to_json(game_record));
        END IF;
      
      WHEN 'streak' THEN
        IF user_profile.current_streak >= game_record.unlock_value THEN
          INSERT INTO public.user_game_progress (user_id, game_id, is_unlocked) 
          VALUES (p_user_id, game_record.id, true)
          ON CONFLICT (user_id, game_id) DO UPDATE SET is_unlocked = true;
          unlocked_game_list := array_append(unlocked_game_list, row_to_json(game_record));
        END IF;
    END CASE;
  END LOOP;

  RETURN QUERY SELECT array_to_json(unlocked_game_list);
END;
$$;
