-- Make ff.bgmi.player420@gmail.com an ADMIN with FULL ACCESS
-- Run this SQL in Supabase SQL Editor

UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'ff.bgmi.player420@gmail.com';

-- Verify the update
SELECT id, email, full_name, role FROM public.profiles 
WHERE email = 'ff.bgmi.player420@gmail.com';
