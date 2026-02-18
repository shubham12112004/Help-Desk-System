-- =====================================================
-- USER SETTINGS TABLE
-- =====================================================
-- Created: 2026-02-18
-- Purpose: Store user preferences and settings
-- =====================================================

-- User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  
  -- Notification Types
  notify_ticket_created BOOLEAN DEFAULT true,
  notify_ticket_assigned BOOLEAN DEFAULT true,
  notify_ticket_updated BOOLEAN DEFAULT true,
  notify_ticket_commented BOOLEAN DEFAULT true,
  notify_ticket_resolved BOOLEAN DEFAULT true,
  notify_appointment_reminder BOOLEAN DEFAULT true,
  notify_sla_warning BOOLEAN DEFAULT true,
  
  -- Display Preferences
  theme TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h', -- '12h' or '24h'
  
  -- Dashboard Preferences
  default_dashboard_view TEXT DEFAULT 'grid', -- 'grid', 'list', 'compact'
  tickets_per_page INTEGER DEFAULT 10,
  show_closed_tickets BOOLEAN DEFAULT false,
  
  -- Privacy Settings
  profile_visible BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT true,
  
  -- Email Digest Settings
  daily_digest BOOLEAN DEFAULT false,
  weekly_summary BOOLEAN DEFAULT true,
  
  -- Other Settings
  auto_assign_tickets BOOLEAN DEFAULT false,
  enable_sound BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all settings
CREATE POLICY "Admins can view all settings"
  ON public.user_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- FUNCTION: Get or create user settings
-- =====================================================

CREATE OR REPLACE FUNCTION get_or_create_user_settings(p_user_id UUID)
RETURNS user_settings AS $$
DECLARE
  v_settings user_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings
  FROM user_settings
  WHERE user_id = p_user_id;
  
  -- If not found, create default settings
  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.user_settings IS 'User preferences and settings';
COMMENT ON COLUMN public.user_settings.email_notifications IS 'Enable/disable email notifications';
COMMENT ON COLUMN public.user_settings.theme IS 'UI theme preference: light, dark, or system';
COMMENT ON COLUMN public.user_settings.metadata IS 'Additional custom settings in JSON format';
