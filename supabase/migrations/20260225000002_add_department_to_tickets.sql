-- Add department column to tickets table
-- This allows tickets to be categorized by hospital department

ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Create index for department filtering
CREATE INDEX IF NOT EXISTS idx_tickets_department ON public.tickets(department);

-- Add comment
COMMENT ON COLUMN public.tickets.department IS 'Hospital department associated with the ticket (Cardiology, Emergency, etc.)';
