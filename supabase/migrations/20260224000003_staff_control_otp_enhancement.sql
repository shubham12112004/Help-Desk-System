-- Migration: Add OTP and enhanced fields to appointments table
-- Created: 2026-02-24
-- Description: Support OTP token verification and staff assignments

-- Add OTP fields to appointments if they don't exist
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP,
ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS assigned_doctor_id UUID REFERENCES public.profiles(id);

-- Add patient medical history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.patient_medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.profiles(id),
  diagnosis TEXT,
  symptoms TEXT,
  treatment_plan TEXT,
  notes TEXT,
  medical_history_type VARCHAR(50) CHECK (medical_history_type IN ('diagnosis', 'treatment', 'note', 'observation')),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_medical_history_patient_id ON public.patient_medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_history_recorded_at ON public.patient_medical_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_appointments_otp_code ON public.appointments(otp_code);

-- Add enhanced tracking fields to ambulance_requests
ALTER TABLE public.ambulance_requests 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Enable RLS on patient_medical_history
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Staff can view and insert patient medical history
CREATE POLICY IF NOT EXISTS "staff_manage_patient_medical_history"
  ON public.patient_medical_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('doctor', 'staff', 'nurse', 'admin')
    )
  );

-- Grant permissions to profiles for OTP verification
CREATE OR REPLACE FUNCTION verify_appointment_otp(appointment_id UUID, provided_otp VARCHAR(6))
RETURNS BOOLEAN AS $$
DECLARE
  stored_otp VARCHAR(6);
  otp_expiry_time TIMESTAMP;
  is_valid BOOLEAN;
BEGIN
  SELECT otp_code, otp_expiry INTO stored_otp, otp_expiry_time
  FROM public.appointments WHERE id = appointment_id;

  IF stored_otp IS NULL THEN
    RETURN FALSE;
  END IF;

  IF stored_otp = provided_otp AND NOW() < otp_expiry_time THEN
    UPDATE public.appointments
    SET otp_verified = TRUE
    WHERE id = appointment_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION verify_appointment_otp TO authenticated;

-- Notification function for critical patient alerts
CREATE OR REPLACE FUNCTION notify_critical_patient()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admission_status = 'critical' AND OLD.admission_status != 'critical' THEN
    -- Insert notification record (would be picked up by real-time subscriptions)
    PERFORM pg_notify(
      'critical_alert',
      json_build_object(
        'patient_id', NEW.id,
        'patient_name', NEW.full_name,
        'message', NEW.full_name || ' marked as critical',
        'timestamp', NOW()
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for critical patient notifications
DROP TRIGGER IF NOT EXISTS on_patient_critical ON public.patients;
CREATE TRIGGER on_patient_critical
AFTER UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION notify_critical_patient();

-- Log summary
DO $$
BEGIN
  RAISE NOTICE 'OTP and Medical History Migration Complete!';
  RAISE NOTICE 'New columns added to appointments table';
  RAISE NOTICE 'Patient medical history table created';
  RAISE NOTICE 'Real-time notifications enabled for critical patients';
  RAISE NOTICE 'OTP verification function created';
END $$;
