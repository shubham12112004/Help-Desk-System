-- =====================================================
-- QUICK FIX: Add missing department column to tickets
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/yoifuexgukjsfbqsmwrn/sql

-- 1. Add department column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_tickets_department ON public.tickets(department);

-- 3. Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets' AND column_name = 'department';

-- =====================================================
-- DONE! Your tickets table now has the department column
-- =====================================================
