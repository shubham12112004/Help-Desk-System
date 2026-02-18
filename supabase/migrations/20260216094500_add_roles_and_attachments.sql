ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'citizen';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';

UPDATE public.user_roles
SET role = 'citizen'
WHERE role = 'user';

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload ticket attachments"
  ON storage.objects;

CREATE POLICY "Authenticated users can upload ticket attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ticket-attachments' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Authenticated users can view ticket attachments"
  ON storage.objects;

CREATE POLICY "Authenticated users can view ticket attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'ticket-attachments');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
  role_to_assign app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));

  requested_role := NEW.raw_user_meta_data ->> 'role';
  role_to_assign := CASE
    WHEN requested_role = 'staff' THEN 'staff'::app_role
    WHEN requested_role = 'citizen' THEN 'citizen'::app_role
    WHEN requested_role = 'user' THEN 'citizen'::app_role
    ELSE 'citizen'::app_role
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, role_to_assign);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
