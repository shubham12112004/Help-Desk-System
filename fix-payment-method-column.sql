-- Fix: Add payment_method column to billing table if it doesn't exist
-- Run this in Supabase SQL Editor

-- Check if payment_method column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'billing' 
        AND column_name = 'payment_method'
    ) THEN
        -- Add payment_method column
        ALTER TABLE public.billing 
        ADD COLUMN payment_method TEXT;
        
        RAISE NOTICE 'Added payment_method column to billing table';
    ELSE
        RAISE NOTICE 'payment_method column already exists';
    END IF;
END $$;

-- Update any existing NULL values to 'pending' or default
UPDATE public.billing 
SET payment_method = 'pending' 
WHERE payment_method IS NULL;

-- Create index for faster queries on payment_method
CREATE INDEX IF NOT EXISTS idx_billing_payment_method 
ON public.billing(payment_method);

-- Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'billing' 
  AND column_name = 'payment_method';

-- Show success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ payment_method column is now available in billing table';
END $$;
