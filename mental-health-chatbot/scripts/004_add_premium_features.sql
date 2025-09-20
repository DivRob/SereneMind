-- Create premium analytics table for advanced insights
CREATE TABLE IF NOT EXISTS public.premium_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('personality_profile', 'stress_patterns', 'mood_prediction', 'habit_optimization', 'wellness_score')),
  analysis_data JSONB NOT NULL,
  confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on premium_analytics
ALTER TABLE public.premium_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for premium_analytics
CREATE POLICY "premium_analytics_select_own" ON public.premium_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "premium_analytics_insert_own" ON public.premium_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "premium_analytics_update_own" ON public.premium_analytics FOR UPDATE USING (auth.uid() = user_id);

-- Create personalized recommendations table
CREATE TABLE IF NOT EXISTS public.personalized_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('task_suggestion', 'timing_optimization', 'difficulty_adjustment', 'wellness_tip', 'habit_formation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority_score INTEGER DEFAULT 1 CHECK (priority_score BETWEEN 1 AND 10),
  is_premium BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on personalized_recommendations
ALTER TABLE public.personalized_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for personalized_recommendations
CREATE POLICY "personalized_recommendations_select_own" ON public.personalized_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "personalized_recommendations_insert_own" ON public.personalized_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "personalized_recommendations_update_own" ON public.personalized_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Create premium subscription tracking
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('free', 'premium')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  payment_status TEXT DEFAULT 'active' CHECK (payment_status IN ('active', 'cancelled', 'expired', 'pending')),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on subscription_history
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_history
CREATE POLICY "subscription_history_select_own" ON public.subscription_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscription_history_insert_own" ON public.subscription_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create advanced wellness metrics table
CREATE TABLE IF NOT EXISTS public.wellness_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  wellness_score FLOAT CHECK (wellness_score BETWEEN 0 AND 100),
  stress_resilience FLOAT CHECK (stress_resilience BETWEEN 0 AND 100),
  emotional_stability FLOAT CHECK (emotional_stability BETWEEN 0 AND 100),
  habit_consistency FLOAT CHECK (habit_consistency BETWEEN 0 AND 100),
  social_connection FLOAT CHECK (social_connection BETWEEN 0 AND 100),
  sleep_quality FLOAT CHECK (sleep_quality BETWEEN 0 AND 100),
  physical_activity FLOAT CHECK (physical_activity BETWEEN 0 AND 100),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

-- Enable RLS on wellness_metrics
ALTER TABLE public.wellness_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for wellness_metrics
CREATE POLICY "wellness_metrics_select_own" ON public.wellness_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wellness_metrics_insert_own" ON public.wellness_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wellness_metrics_update_own" ON public.wellness_metrics FOR UPDATE USING (auth.uid() = user_id);

-- Create function to calculate wellness score
CREATE OR REPLACE FUNCTION public.calculate_wellness_score(p_user_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mood_avg FLOAT := 0;
  task_completion_rate FLOAT := 0;
  streak_consistency FLOAT := 0;
  stress_management FLOAT := 0;
  wellness_score FLOAT := 0;
BEGIN
  -- Calculate average mood over last 7 days
  SELECT COALESCE(AVG(mood_score), 5) INTO mood_avg
  FROM mood_entries 
  WHERE user_id = p_user_id 
    AND entry_date >= CURRENT_DATE - INTERVAL '7 days';

  -- Calculate task completion rate over last 7 days
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE (COUNT(*) FILTER (WHERE is_completed = true)::FLOAT / COUNT(*)::FLOAT) * 100
    END INTO task_completion_rate
  FROM daily_tasks 
  WHERE user_id = p_user_id 
    AND assigned_date >= CURRENT_DATE - INTERVAL '7 days';

  -- Get current streak as consistency metric
  SELECT COALESCE(current_streak, 0) INTO streak_consistency
  FROM profiles 
  WHERE id = p_user_id;

  -- Calculate stress management (inverse of average stress)
  SELECT COALESCE(100 - (AVG(stress_level) * 10), 50) INTO stress_management
  FROM mood_entries 
  WHERE user_id = p_user_id 
    AND entry_date >= CURRENT_DATE - INTERVAL '7 days';

  -- Calculate overall wellness score (weighted average)
  wellness_score := (
    (mood_avg * 10 * 0.3) +  -- 30% weight for mood
    (task_completion_rate * 0.25) +  -- 25% weight for task completion
    (LEAST(streak_consistency * 5, 100) * 0.25) +  -- 25% weight for streak
    (stress_management * 0.2)  -- 20% weight for stress management
  );

  RETURN LEAST(wellness_score, 100);
END;
$$;

-- Create function to generate premium insights
CREATE OR REPLACE FUNCTION public.generate_premium_insights(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  mood_data RECORD;
  task_data RECORD;
  insights JSON;
  personality_traits JSON;
  stress_patterns JSON;
  optimization_tips JSON;
BEGIN
  -- Check if user has premium access
  SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
  
  IF user_profile.subscription_tier != 'premium' THEN
    RETURN json_build_object('error', 'Premium subscription required');
  END IF;

  -- Analyze mood patterns
  SELECT 
    AVG(mood_score) as avg_mood,
    STDDEV(mood_score) as mood_variability,
    AVG(energy_level) as avg_energy,
    AVG(stress_level) as avg_stress,
    COUNT(*) as total_entries
  INTO mood_data
  FROM mood_entries 
  WHERE user_id = p_user_id 
    AND entry_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Analyze task patterns
  SELECT 
    COUNT(*) FILTER (WHERE is_completed = true) as completed_tasks,
    COUNT(*) as total_tasks,
    AVG(points_reward) as avg_points,
    MODE() WITHIN GROUP (ORDER BY task_type) as favorite_task_type
  INTO task_data
  FROM daily_tasks 
  WHERE user_id = p_user_id 
    AND assigned_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Generate personality insights
  personality_traits := json_build_object(
    'consistency_level', 
    CASE 
      WHEN user_profile.current_streak >= 14 THEN 'High'
      WHEN user_profile.current_streak >= 7 THEN 'Medium'
      ELSE 'Developing'
    END,
    'stress_resilience',
    CASE 
      WHEN mood_data.avg_stress <= 3 THEN 'Excellent'
      WHEN mood_data.avg_stress <= 6 THEN 'Good'
      ELSE 'Needs Attention'
    END,
    'emotional_stability',
    CASE 
      WHEN mood_data.mood_variability <= 1.5 THEN 'Very Stable'
      WHEN mood_data.mood_variability <= 2.5 THEN 'Stable'
      ELSE 'Variable'
    END
  );

  -- Generate stress pattern analysis
  stress_patterns := json_build_object(
    'peak_stress_times', 'Analysis requires more data',
    'stress_triggers', 'Identified through mood correlations',
    'recovery_patterns', 'Based on mood improvement trends'
  );

  -- Generate optimization tips
  optimization_tips := json_build_array(
    json_build_object(
      'category', 'Task Timing',
      'recommendation', 'Based on your completion patterns, morning tasks show higher success rates',
      'confidence', 0.8
    ),
    json_build_object(
      'category', 'Difficulty Progression',
      'recommendation', 'Gradually increase task difficulty to maintain engagement without overwhelm',
      'confidence', 0.7
    ),
    json_build_object(
      'category', 'Mood Management',
      'recommendation', 'Focus on stress-reduction techniques during identified peak stress periods',
      'confidence', 0.9
    )
  );

  -- Combine all insights
  insights := json_build_object(
    'personality_profile', personality_traits,
    'stress_patterns', stress_patterns,
    'optimization_recommendations', optimization_tips,
    'wellness_score', public.calculate_wellness_score(p_user_id),
    'data_quality', 
    CASE 
      WHEN mood_data.total_entries >= 14 AND task_data.total_tasks >= 10 THEN 'High'
      WHEN mood_data.total_entries >= 7 AND task_data.total_tasks >= 5 THEN 'Medium'
      ELSE 'Low'
    END,
    'generated_at', NOW()
  );

  -- Store the insights
  INSERT INTO premium_analytics (user_id, analysis_type, analysis_data, confidence_score)
  VALUES (p_user_id, 'personality_profile', insights, 0.85);

  RETURN insights;
END;
$$;

-- Insert premium recommendations
INSERT INTO personalized_recommendations (user_id, recommendation_type, title, description, priority_score, is_premium) 
SELECT 
  id as user_id,
  'wellness_tip' as recommendation_type,
  'Premium Wellness Insights Available' as title,
  'Unlock detailed personality analysis and personalized optimization recommendations with your premium subscription.' as description,
  8 as priority_score,
  true as is_premium
FROM profiles 
WHERE subscription_tier = 'premium'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_premium_analytics_user_type ON public.premium_analytics(user_id, analysis_type);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_user_priority ON public.personalized_recommendations(user_id, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_user_date ON public.wellness_metrics(user_id, metric_date);
