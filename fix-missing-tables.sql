-- Run this to fix missing tables and ensure auth works
-- Copy this SQL and run it in Supabase Dashboard > SQL Editor

-- Ensure ticket_messages table exists (it should from migration)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_agent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for ticket_messages
DROP POLICY IF EXISTS "Users can view messages on their tickets" ON public.ticket_messages;
DROP POLICY IF EXISTS "Authenticated users can add messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins can add messages to any ticket" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins can delete any message" ON public.ticket_messages;

CREATE POLICY "Users can view messages on their tickets"
  ON public.ticket_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_messages.ticket_id
      AND (tickets.requester_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Authenticated users can add messages"
  ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages"
  ON public.ticket_messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Admins can manage messages"
  ON public.ticket_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Ensure user_roles policies allow reading for role display
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Test queries
SELECT 'ticket_messages table exists' as status, COUNT(*) as count FROM public.ticket_messages;
SELECT 'user_roles table exists' as status, COUNT(*) as count FROM public.user_roles;
