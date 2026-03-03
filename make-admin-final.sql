-- SQL to make ff.bgmi.player420@gmail.com an ADMIN
-- Run this in Supabase SQL Editor

-- Step 1: Update the profile to admin role
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'ff.bgmi.player420@gmail.com';

-- Step 2: Verify the update
SELECT id, email, full_name, role FROM public.profiles 
WHERE email = 'ff.bgmi.player420@gmail.com';
