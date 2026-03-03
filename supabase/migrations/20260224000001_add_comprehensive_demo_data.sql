-- ===================================================
-- COMPREHENSIVE DEMO DATA FOR ALL FEATURES
-- Adds realistic data across all tables with proper access control
-- ===================================================

-- ===================================================
-- 1. ADD SAMPLE MEDICINES
-- ===================================================

INSERT INTO public.medicines (name, category, description, dosage, unit_price, stock_quantity, supplier)
VALUES 
  ('Amoxicillin 500mg', 'Antibiotic', 'Broad-spectrum antibiotic', '500mg tablet', 15, 500, 'PharmaCorp Ltd'),
  ('Metformin 500mg', 'Diabetes', 'For blood sugar control', '500mg tablet', 12, 800, 'MediFirst'),
  ('Aspirin 100mg', 'Pain Relief', 'Mild pain and fever relief', '100mg tablet', 8, 1200, 'HealthCare Plus'),
  ('Lisinopril 10mg', 'Blood Pressure', 'ACE inhibitor for hypertension', '10mg tablet', 20, 400, 'CardioMed'),
  ('Vitamin D3 1000IU', 'Supplements', 'Calcium and bone health', '1000IU capsule', 10, 600, 'NutriLife'),
  ('Omeprazole 20mg', 'Gastric', 'Acid reflux and ulcer treatment', '20mg capsule', 18, 350, 'DigestCare'),
  ('Loratadine 10mg', 'Allergy', 'Antihistamine for allergies', '10mg tablet', 14, 450, 'AllergyStop'),
  ('Ibuprofen 400mg', 'Pain Relief', 'Anti-inflammatory pain relief', '400mg tablet', 9, 900, 'PainFree'),
  ('Atorvastatin 20mg', 'Cholesterol', 'Cholesterol control', '20mg tablet', 25, 300, 'CardioWell'),
  ('Amlodipine 5mg', 'Blood Pressure', 'Calcium channel blocker', '5mg tablet', 22, 400, 'HyperControl')
ON CONFLICT DO NOTHING;

-- ===================================================
-- 2. ADD SAMPLE PRESCRIPTIONS FOR PATIENT
-- ===================================================

INSERT INTO public.prescriptions (
  patient_id, doctor_id, medication_name, dosage, frequency, duration_days, 
  instructions, status, prescribed_date, start_date, end_date
)
VALUES 
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    'Amoxicillin 500mg',
    '1 tablet',
    'Twice daily',
    10,
    'Take with food. Complete full course even if symptoms disappear.',
    'active',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '5 days'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    'Metformin 500mg',
    '1 tablet',
    'Three times daily',
    30,
    'Take with meals. Monitor blood sugar levels regularly.',
    'active',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '30 days'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    'Vitamin D3 1000IU',
    '1 capsule',
    'Once daily',
    90,
    'Take in morning with breakfast.',
    'active',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days',
    NOW() + INTERVAL '70 days'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    'Lisinopril 10mg',
    '1 tablet',
    'Once daily',
    90,
    'Take in morning. If dizziness occurs, inform doctor.',
    'active',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days',
    NOW() + INTERVAL '45 days'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    'Loratadine 10mg',
    '1 tablet',
    'Once daily at night',
    60,
    'For allergy relief. Take as needed.',
    'completed',
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '30 days'
  )
ON CONFLICT DO NOTHING;

-- ===================================================
-- 3. ADD SAMPLE MEDICINE REQUESTS
-- ===================================================

INSERT INTO public.medicine_requests (
  patient_id, prescription_id, medicine_name, quantity_requested, status, 
  request_date, delivery_date
)
VALUES 
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM prescriptions WHERE medication_name = 'Amoxicillin 500mg' LIMIT 1),
    'Amoxicillin 500mg',
    10,
    'pending',
    NOW() - INTERVAL '2 days',
    NULL
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM prescriptions WHERE medication_name = 'Metformin 500mg' LIMIT 1),
    'Metformin 500mg',
    30,
    'delivered',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '10 days'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM prescriptions WHERE medication_name = 'Vitamin D3 1000IU' LIMIT 1),
    'Vitamin D3 1000IU',
    30,
    'delivered',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '18 days'
  )
ON CONFLICT DO NOTHING;

-- ===================================================
-- 4. ADD SAMPLE LAB REPORTS
-- ===================================================

INSERT INTO public.lab_reports (
  patient_id, test_name, test_category, lab_name, ordered_date, 
  report_date, status, test_values, reference_range, interpretation,
  ordered_by
)
VALUES 
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    'Blood Sugar (Fasting)',
    'Endocrinology',
    'Metro Diagnostic Lab',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days',
    'completed',
    '118 mg/dL',
    '70-100 mg/dL (Fasting)',
    'Slightly elevated. Consider lifestyle modifications. Consult endocrinologist.',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1)
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    'Complete Blood Count (CBC)',
    'Hematology',
    'Metro Diagnostic Lab',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days',
    'completed',
    'RBC: 4.8, WBC: 7.2, Hemoglobin: 13.5',
    'RBC: 4.5-5.9, WBC: 4.5-11.0, Hb: 12-16',
    'All values within normal range. No abnormalities detected.',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1)
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    'Liver Function Test (LFT)',
    'Biochemistry',
    'Metro Diagnostic Lab',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days',
    'completed',
    'ALT: 28, AST: 32, ALP: 65, Bilirubin: 0.8',
    'ALT: 7-56, AST: 10-40, ALP: 30-120, Bilirubin: 0.1-1.2',
    'All liver parameters normal. Liver function is healthy.',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1)
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    'Blood Pressure Monitoring',
    'Cardiology',
    'Hospital Home Service',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days',
    'completed',
    'Systolic: 128 mmHg, Diastolic: 82 mmHg',
    'Systolic: <120 mmHg, Diastolic: <80 mmHg',
    'Stage 1 Hypertension. Continue current medication. Follow-up in 1 month.',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1)
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    'Lipid Profile',
    'Biochemistry',
    'Metro Diagnostic Lab',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days',
    'completed',
    'Total Cholesterol: 215, LDL: 145, HDL: 38, Triglycerides: 180',
    'Total: <200, LDL: <100, HDL: >40 (M), Triglycerides: <150',
    'Elevated cholesterol and triglycerides. Continue atorvastatin. Dietary modifications recommended.',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- ===================================================
-- 5. ADD SAMPLE MEDICAL INFO (ROOM ALLOCATIONS)
-- ===================================================

INSERT INTO public.room_allocations (
  patient_id, room_number, room_type, floor, status,
  admission_date, discharge_date, assigned_doctor_id, assigned_nurse_id,
  bed_number, ward_type
)
VALUES 
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    '301',
    'General Ward',
    3,
    'discharged',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '20 days',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1),
    'A',
    'General'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    '401',
    'Semi-Private',
    4,
    'allocated',
    NOW() - INTERVAL '5 days',
    NULL,
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1),
    'B',
    'General'
  )
ON CONFLICT DO NOTHING;

-- ===================================================
-- 6. SAMPLE DATA FOR APPOINTMENTS (Add more)
-- ===================================================

INSERT INTO public.appointments (
  patient_id, doctor_id, appointment_date, appointment_time, status, reason
)
VALUES 
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    'scheduled',
    'General Checkup'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    CURRENT_DATE + INTERVAL '5 days',
    '14:30:00',
    'scheduled',
    'Follow-up - Blood Pressure Monitoring'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    NOW() - INTERVAL '15 days',
    '11:00:00',
    'completed',
    'Initial Consultation'
  ),
  (
    'f3ca1b62-2885-44e3-823f-8e77aceecb76',
    (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
    NOW() - INTERVAL '5 days',
    '15:00:00',
    'completed',
    'Post-treatment Review'
  )
ON CONFLICT DO NOTHING;

-- ===================================================
-- 7. UPDATE PATIENT PROFILE WITH MORE DATA
-- ===================================================

UPDATE public.profiles
SET 
  full_name = 'Shubham "Deepak" Yadav',
  email = 'raoshubham192@gmail.com',
  phone = '+91-9876543210',
  blood_type = 'O+',
  date_of_birth = '1996-12-01',
  gender = 'Male',
  address = '123 Health Street, Medical City, MC 12345',
  emergency_contact_name = 'Rajesh Yadav',
  emergency_contact_phone = '+91-9876543211',
  allergies = 'Penicillin (rash), Shellfish',
  chronic_conditions = 'Type 2 Diabetes, Hypertension, High Cholesterol',
  insurance_provider = 'HealthFirst Insurance',
  insurance_id = 'HF-2024-098765',
  department = 'General Medicine'
WHERE id = 'f3ca1b62-2885-44e3-823f-8e77aceecb76';

-- ===================================================
-- 8. UPDATE RLS POLICIES FOR PROPER ACCESS CONTROL
-- ===================================================

-- Prescriptions: Users can view only their own, doctors can view all
DROP POLICY IF EXISTS "Users can view own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Staff can create prescriptions" ON public.prescriptions;

CREATE POLICY "Users can view own or assigned prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    auth.uid() = patient_id OR
    auth.uid() = doctor_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff', 'doctor', 'nurse')
    )
  );

CREATE POLICY "Doctors can create prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Doctors can update their prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (
    auth.uid() = doctor_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Lab Reports: Similar access control
DROP POLICY IF EXISTS "Users can view own lab reports" ON public.lab_reports;
DROP POLICY IF EXISTS "Staff can manage lab reports" ON public.lab_reports;

CREATE POLICY "Users can view own or assigned lab reports"
  ON public.lab_reports FOR SELECT
  USING (
    auth.uid() = patient_id OR
    auth.uid() = ordered_by OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff', 'doctor', 'lab_technician', 'nurse')
    )
  );

CREATE POLICY "Lab staff can create reports"
  ON public.lab_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'lab_technician', 'doctor')
    )
  );

CREATE POLICY "Lab staff can update reports"
  ON public.lab_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'lab_technician')
    )
  );

-- Medicine Requests: Patients can create, staff can view and update
DROP POLICY IF EXISTS "Users can view own medicine requests" ON public.medicine_requests;
DROP POLICY IF EXISTS "Users can create medicine requests" ON public.medicine_requests;

CREATE POLICY "Users can view own medicine requests"
  ON public.medicine_requests FOR SELECT
  USING (
    auth.uid() = patient_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff', 'pharmacist')
    )
  );

CREATE POLICY "Patients can create own medicine requests"
  ON public.medicine_requests FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Pharmacy staff can update requests"
  ON public.medicine_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'pharmacist')
    )
  );

-- ===================================================
-- 9. VERIFY DATA WAS INSERTED
-- ===================================================

SELECT 'Prescriptions' as data_type, COUNT(*) as count FROM public.prescriptions WHERE patient_id = 'f3ca1b62-2885-44e3-823f-8e77aceecb76'
UNION ALL
SELECT 'Lab Reports', COUNT(*) FROM public.lab_reports WHERE patient_id = 'f3ca1b62-2885-44e3-823f-8e77aceecb76'
UNION ALL
SELECT 'Appointments', COUNT(*) FROM public.appointments WHERE patient_id = 'f3ca1b62-2885-44e3-823f-8e77aceecb76'
UNION ALL
SELECT 'Medicine Requests', COUNT(*) FROM public.medicine_requests WHERE patient_id = 'f3ca1b62-2885-44e3-823f-8e77aceecb76'
UNION ALL
SELECT 'Room Allocations', COUNT(*) FROM public.room_allocations WHERE patient_id = 'f3ca1b62-2885-44e3-823f-8e77aceecb76'
UNION ALL
SELECT 'Medicines', COUNT(*) FROM public.medicines;
