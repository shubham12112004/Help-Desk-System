
-- 1. Fix profiles: users can only view their own profile, admins can view all
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2. Fix ticket messages: allow users to delete own messages, admins can delete any
CREATE POLICY "Users can delete own messages"
  ON public.ticket_messages FOR DELETE
  USING (auth.uid() = sender_id);

CREATE POLICY "Admins can delete any message"
  ON public.ticket_messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
