-- Setup Admin User for Testing
-- This script creates an admin user with email and password

-- NOTE: In Supabase, you need to use the Supabase Auth API to create users
-- This SQL sets up the profile and role after auth user is created

-- Insert admin profile (replace 'admin_user_id_here' with actual user ID from Supabase Auth)
-- First, create the user through Supabase Dashboard or API

-- After creating user through Supabase Auth with email: admin@hospital.local and password: Admin@123456

-- Insert profile
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
VALUES (
  'REPLACE_WITH_AUTH_USER_ID',
  'admin@hospital.local',
  'Admin Dashboard',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Insert admin role
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES (
  'REPLACE_WITH_AUTH_USER_ID',
  'admin',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  created_at = NOW();

-- Verify the data
SELECT * FROM public.profiles WHERE email = 'admin@hospital.local';
SELECT * FROM public.user_roles WHERE role = 'admin';
