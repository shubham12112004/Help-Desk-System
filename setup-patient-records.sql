-- =====================================================
-- QUICK SETUP: Patient Medical Records with Demo Data
-- =====================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- This will create the table and populate it with sample data

-- Step 1: Create the patient_medical_records table
CREATE TABLE IF NOT EXISTS public.patient_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_patient_id ON public.patient_medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_department ON public.patient_medical_records(department);
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_condition_status ON public.patient_medical_records(condition_status);
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_admission_date ON public.patient_medical_records(admission_date DESC);

-- Step 3: Enable RLS
ALTER TABLE public.patient_medical_records ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
DROP POLICY IF EXISTS "Anyone authenticated can view patient medical records" ON public.patient_medical_records;
CREATE POLICY "Anyone authenticated can view patient medical records"
  ON public.patient_medical_records FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff and doctors can create patient medical records" ON public.patient_medical_records;
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

DROP POLICY IF EXISTS "Staff and doctors can update patient medical records" ON public.patient_medical_records;
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

-- Step 5: Insert Sample Patient Medical Records
DO $$
DECLARE
  v_patient_id UUID;
  v_doctor_id UUID;
  v_nurse_id UUID;
  v_counter INTEGER := 0;
  v_departments TEXT[] := ARRAY['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General', 'Emergency'];
  v_conditions TEXT[] := ARRAY['stable', 'observation', 'critical', 'improving'];
  v_complaints TEXT[] := ARRAY[
    'Chest pain and shortness of breath',
    'Severe headache and dizziness',
    'High fever and cough',
    'Leg fracture from accident',
    'Abdominal pain',
    'General checkup and monitoring',
    'Chronic back pain',
    'Diabetes management'
  ];
  v_diagnoses TEXT[] := ARRAY[
    'Acute Coronary Syndrome',
    'Possible Stroke',
    'Pneumonia',
    'Tibial Fracture',
    'Gastritis',
    'General health assessment',
    'Lumbar Strain',
    'Type 2 Diabetes'
  ];
  v_treatments TEXT[] := ARRAY[
    'Emergency cardiac monitoring, oxygen therapy, medications',
    'CT scan, neurological monitoring, observe for 48 hours',
    'Antibiotics, rest, respiratory support',
    'Surgery scheduled, pain management, immobilization',
    'Dietary management, antacids, monitoring',
    'Regular checkups, lifestyle counseling',
    'Physical therapy, pain management',
    'Insulin therapy, dietary counseling'
  ];
BEGIN
  -- Get first doctor
  SELECT id INTO v_doctor_id 
  FROM public.profiles 
  WHERE role IN ('doctor', 'admin') 
  LIMIT 1;
  
  -- Get first nurse
  SELECT id INTO v_nurse_id 
  FROM public.profiles 
  WHERE role IN ('nurse', 'staff', 'admin') 
  LIMIT 1;
  
  -- Insert records for each patient/citizen
  FOR v_patient_id IN 
    SELECT id FROM public.profiles 
    WHERE role IN ('patient', 'citizen')
    LIMIT 12
  LOOP
    v_counter := v_counter + 1;
    
    INSERT INTO public.patient_medical_records (
      patient_id,
      admission_date,
      department,
      condition_status,
      chief_complaint,
      diagnosis,
      treatment_plan,
      assigned_doctor_id,
      assigned_nurse_id,
      critical_alert,
      vitals,
      notes
    ) VALUES (
      v_patient_id,
      NOW() - (v_counter || ' days')::INTERVAL,
      v_departments[(v_counter % 6) + 1],
      v_conditions[(v_counter % 4) + 1],
      v_complaints[(v_counter % 8) + 1],
      v_diagnoses[(v_counter % 8) + 1],
      v_treatments[(v_counter % 8) + 1],
      v_doctor_id,
      v_nurse_id,
      (v_counter % 4 = 1), -- Every 4th patient is critical
      jsonb_build_object(
        'heart_rate', 60 + (v_counter * 5) % 40,
        'blood_pressure', (100 + (v_counter * 10) % 60)::text || '/' || (60 + (v_counter * 5) % 40)::text,
        'temperature', round((36.5 + (v_counter * 0.3) % 3.5)::numeric, 1),
        'oxygen_saturation', 90 + (v_counter * 2) % 10,
        'respiratory_rate', 12 + (v_counter * 2) % 12,
        'last_updated', NOW()
      ),
      CASE 
        WHEN v_counter % 3 = 0 THEN 'Patient admitted through Emergency. '
        WHEN v_counter % 3 = 1 THEN 'Patient admitted through OPD. '
        ELSE 'Patient admitted through Referral. '
      END ||
      CASE 
        WHEN v_counter % 4 = 1 THEN '⚠️ CRITICAL - Requires immediate attention!'
        ELSE 'Regular monitoring in progress.'
      END
    );
  END LOOP;
  
  RAISE NOTICE 'Successfully created % patient medical records', v_counter;
END $$;

-- Step 6: Verify the data
SELECT 
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE condition_status = 'critical') as critical_cases,
  COUNT(*) FILTER (WHERE condition_status = 'stable') as stable_cases,
  COUNT(*) FILTER (WHERE condition_status = 'observation') as observation_cases,
  COUNT(*) FILTER (WHERE condition_status = 'improving') as improving_cases
FROM public.patient_medical_records;

-- Show sample records
SELECT 
  pmr.id,
  p.full_name as patient_name,
  pmr.department,
  pmr.condition_status,
  pmr.chief_complaint,
  pmr.admission_date,
  pmr.critical_alert
FROM public.patient_medical_records pmr
JOIN public.profiles p ON p.id = pmr.patient_id
ORDER BY pmr.admission_date DESC
LIMIT 10;

-- Done!
SELECT '✅ Patient Medical Records Setup Complete!' as status;
