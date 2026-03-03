-- =====================================================
-- QUICK FIX: Ensure all required tables exist
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/yoifuexgukjsfbqsmwrn/sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADD DEPARTMENT COLUMN TO TICKETS TABLE
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Create index for department filtering
CREATE INDEX IF NOT EXISTS idx_tickets_department ON public.tickets(department);

-- 2. Create notification type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
      'ticket_created',
      'ticket_assigned',
      'ticket_updated',
      'ticket_commented',
      'appointment_scheduled',
      'appointment_reminder',
      'sla_warning',
      'sla_breach',
      'system_alert'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  appointment_id UUID,
  comment_id UUID,
  
  -- Metadata
  data JSONB,
  link TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_ticket_id ON public.notifications(ticket_id);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Verify tables exist
SELECT 
  'tickets' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'department'
  ) as has_department_column
UNION ALL
SELECT 
  'notifications' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'notifications'
  ) as exists;

-- =====================================================
-- DONE! All required tables should now exist
-- =====================================================
