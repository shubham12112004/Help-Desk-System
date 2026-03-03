-- =====================================================
-- ADD SAMPLE PATIENT MEDICAL RECORDS DATA
-- =====================================================
-- This migration adds demo data to the patient_medical_records table

-- Insert sample patient medical records for testing
-- Note: This assumes profiles table has some patient records
-- You may need to adjust the UUIDs to match actual patient IDs in your system

DO $$
DECLARE
  patient_record RECORD;
  doctor_record RECORD;
  nurse_record RECORD;
  counter INTEGER := 0;
BEGIN
  -- Get first available doctor
  SELECT id INTO doctor_record FROM public.profiles WHERE role IN ('doctor', 'admin') LIMIT 1;
  
  -- Get first available nurse  
  SELECT id INTO nurse_record FROM public.profiles WHERE role IN ('nurse', 'staff', 'admin') LIMIT 1;
  
  -- Create medical records for patients who don't have any yet
  FOR patient_record IN 
    SELECT p.id, p.full_name, p.email 
    FROM public.profiles p
    WHERE p.role IN ('patient', 'citizen')
    AND NOT EXISTS (
      SELECT 1 FROM public.patient_medical_records pmr 
      WHERE pmr.patient_id = p.id
    )
    LIMIT 10
  LOOP
    counter := counter + 1;
    
    -- Insert medical record with varied conditions
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
      patient_record.id,
      NOW() - (counter || ' days')::INTERVAL,
      CASE counter % 5
        WHEN 0 THEN 'Cardiology'
        WHEN 1 THEN 'Neurology'
        WHEN 2 THEN 'Pediatrics'
        WHEN 3 THEN 'Orthopedics'
        ELSE 'General'
      END,
      CASE counter % 4
        WHEN 0 THEN 'critical'
        WHEN 1 THEN 'observation'
        WHEN 2 THEN 'stable'
        ELSE 'improving'
      END,
      CASE counter % 6
        WHEN 0 THEN 'Chest pain and shortness of breath'
        WHEN 1 THEN 'Severe headache and dizziness'
        WHEN 2 THEN 'High fever and cough'
        WHEN 3 THEN 'Leg fracture from accident'
        WHEN 4 THEN 'Abdominal pain'
        ELSE 'General checkup and monitoring'
      END,
      CASE counter % 6
        WHEN 0 THEN 'Acute Coronary Syndrome'
        WHEN 1 THEN 'Possible Stroke'
        WHEN 2 THEN 'Pneumonia'
        WHEN 3 THEN 'Tibial Fracture'
        WHEN 4 THEN 'Gastritis'
        ELSE 'General health assessment'
      END,
      CASE counter % 6
        WHEN 0 THEN 'Emergency cardiac monitoring, oxygen therapy, medications'
        WHEN 1 THEN 'CT scan, neurological monitoring, observe for 48 hours'
        WHEN 2 THEN 'Antibiotics, rest, respiratory support'
        WHEN 3 THEN 'Surgery scheduled, pain management, immobilization'
        WHEN 4 THEN 'Dietary management, antacids, monitoring'
        ELSE 'Regular checkups, lifestyle counseling'
      END,
      doctor_record,
      nurse_record,
      (counter % 4 = 0), -- Set critical_alert for critical cases
      jsonb_build_object(
        'heart_rate', 60 + (counter * 5) % 40,
        'blood_pressure', (100 + (counter * 10) % 60) || '/' || (60 + (counter * 5) % 40),
        'temperature', 36.5 + (counter * 0.3) % 3.5,
        'oxygen_saturation', 90 + (counter * 2) % 10,
        'respiratory_rate', 12 + (counter * 2) % 12,
        'last_updated', NOW()
      ),
      'Patient admitted through ' || CASE counter % 3 WHEN 0 THEN 'Emergency' WHEN 1 THEN 'OPD' ELSE 'Referral' END
    );
  END LOOP;
  
  RAISE NOTICE 'Created % patient medical records', counter;
END $$;

-- Create a few discharged records as well
DO $$
DECLARE
  patient_record RECORD;
  doctor_record RECORD;
  counter INTEGER := 0;
BEGIN
  SELECT id INTO doctor_record FROM public.profiles WHERE role IN ('doctor', 'admin') LIMIT 1;
  
  FOR patient_record IN 
    SELECT p.id 
    FROM public.profiles p
    WHERE p.role IN ('patient', 'citizen')
    AND NOT EXISTS (
      SELECT 1 FROM public.patient_medical_records pmr 
      WHERE pmr.patient_id = p.id AND pmr.discharge_date IS NOT NULL
    )
    LIMIT 5
  LOOP
    counter := counter + 1;
    
    INSERT INTO public.patient_medical_records (
      patient_id,
      admission_date,
      discharge_date,
      department,
      condition_status,
      chief_complaint,
      diagnosis,
      treatment_plan,
      assigned_doctor_id,
      critical_alert,
      vitals,
      notes
    ) VALUES (
      patient_record.id,
      NOW() - (30 + counter) || ' days'::INTERVAL,
      NOW() - (20 + counter) || ' days'::INTERVAL,
      'General',
      'discharged',
      'Follow-up examination',
      'Recovered successfully',
      'Completed treatment course',
      doctor_record,
      false,
      jsonb_build_object(
        'heart_rate', 72,
        'blood_pressure', '120/80',
        'temperature', 37.0,
        'oxygen_saturation', 98
      ),
      'Patient discharged in good health. Follow-up recommended in 2 weeks.'
    );
  END LOOP;
END $$;
