-- Update user role from patient to admin
-- This will change ff.bgmi.player420@gmail.com account to have admin privileges

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'ff.bgmi.player420@gmail.com';

-- Verify the change
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE email = 'ff.bgmi.player420@gmail.com';
