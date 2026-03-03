-- =====================================================
-- CREATE PATIENT MEDICAL RECORDS TABLE
-- =====================================================
-- This migration creates the missing patient_medical_records table
-- that is referenced by the PatientMonitoringPanel and enhance-hospital service

-- Create patient_medical_records table
CREATE TABLE IF NOT EXISTS public.patient_medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  department TEXT NOT NULL,
  condition_status TEXT DEFAULT 'stable' CHECK (condition_status IN ('stable', 'observation', 'critical', 'improving', 'discharged')),
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  assigned_doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_nurse_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  critical_alert BOOLEAN DEFAULT false,
  vitals JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patient_medical_records_patient_id ON public.patient_medical_records(patient_id);
CREATE INDEX idx_patient_medical_records_department ON public.patient_medical_records(department);
CREATE INDEX idx_patient_medical_records_condition_status ON public.patient_medical_records(condition_status);
CREATE INDEX idx_patient_medical_records_admission_date ON public.patient_medical_records(admission_date DESC);
CREATE INDEX idx_patient_medical_records_assigned_doctor ON public.patient_medical_records(assigned_doctor_id);
CREATE INDEX idx_patient_medical_records_critical ON public.patient_medical_records(critical_alert) WHERE critical_alert = true;

-- Add updated_at trigger
CREATE TRIGGER update_patient_medical_records_updated_at 
  BEFORE UPDATE ON public.patient_medical_records
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.patient_medical_records ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all patient medical records
CREATE POLICY "Anyone authenticated can view patient medical records"
  ON public.patient_medical_records FOR SELECT
  TO authenticated
  USING (true);

-- Allow doctors and staff to create medical records
CREATE POLICY "Staff and doctors can create patient medical records"
  ON public.patient_medical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff', 'doctor')
    )
  );

-- Allow doctors and staff to update medical records
CREATE POLICY "Staff and doctors can update patient medical records"
  ON public.patient_medical_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff', 'doctor', 'nurse')
    )
  );

-- Allow admins to delete medical records
CREATE POLICY "Admins can delete patient medical records"
  ON public.patient_medical_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- SAMPLE DATA (for testing/demo)
-- =====================================================

-- This will be populated with demo data in subsequent migrations
-- or by the application as real patient data is created

COMMENT ON TABLE public.patient_medical_records IS 'Stores comprehensive medical records for admitted patients including vitals, diagnosis, and treatment plans';
COMMENT ON COLUMN public.patient_medical_records.vitals IS 'JSON object containing vital signs like heart_rate, blood_pressure, temperature, oxygen_saturation, etc.';
COMMENT ON COLUMN public.patient_medical_records.condition_status IS 'Current medical condition status of the patient';
