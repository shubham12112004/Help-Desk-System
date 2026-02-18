-- =====================================================
-- AMBULANCE LOCATION TRACKING
-- Add GPS coordinates and tracking fields
-- =====================================================

-- Add location columns for user pickup location
ALTER TABLE public.ambulance_requests
ADD COLUMN IF NOT EXISTS user_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS user_longitude DECIMAL(11, 8);

-- Add location columns for ambulance current location
ALTER TABLE public.ambulance_requests
ADD COLUMN IF NOT EXISTS ambulance_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS ambulance_longitude DECIMAL(11, 8);

-- Add tracking metadata
ALTER TABLE public.ambulance_requests
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(6, 2),
ADD COLUMN IF NOT EXISTS eta_minutes INT;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_location 
ON public.ambulance_requests(ambulance_latitude, ambulance_longitude) 
WHERE status IN ('assigned', 'dispatched');

-- Add comment
COMMENT ON COLUMN public.ambulance_requests.user_latitude IS 'Patient pickup location latitude';
COMMENT ON COLUMN public.ambulance_requests.user_longitude IS 'Patient pickup location longitude';
COMMENT ON COLUMN public.ambulance_requests.ambulance_latitude IS 'Current ambulance location latitude';
COMMENT ON COLUMN public.ambulance_requests.ambulance_longitude IS 'Current ambulance location longitude';
COMMENT ON COLUMN public.ambulance_requests.last_location_update IS 'Last time ambulance location was updated';
COMMENT ON COLUMN public.ambulance_requests.distance_km IS 'Calculated distance between ambulance and pickup location';
COMMENT ON COLUMN public.ambulance_requests.eta_minutes IS 'Estimated time of arrival in minutes';
