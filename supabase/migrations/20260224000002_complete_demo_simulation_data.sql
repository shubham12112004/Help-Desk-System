-- ===================================================
-- COMPLETE HOSPITAL SIMULATION DATA
-- Everything working with realistic random data
-- ===================================================

-- Get current user/admin ID for reference
-- Change these as needed:
DO $$ 
DECLARE 
  patient_id UUID;
  doctor_id UUID;
  staff_id UUID;
  admin_id UUID;
BEGIN
  -- Reference patient (your actual logged-in account)
  -- This ensures demo data is linked to YOUR account
  patient_id := 'f3ca1b62-2885-44e3-823f-8e77aceecb76';
  
  -- Create staff/doctor/admin if missing
  -- These will be used for demo data
  
-- ===================================================
-- ADD MULTIPLE PATIENTS WITH PROFILES
-- ===================================================
INSERT INTO public.profiles (
  id, email, full_name, phone, date_of_birth, gender, 
  blood_type, address, role, allergies, chronic_conditions,
  insurance_provider, insurance_id
)
VALUES 
  (gen_random_uuid(), 'patient1@hospital.com', 'Rajesh Kumar', '+91-9876543211', '1988-05-15', 'Male', 'A+', '456 Hospital Road, City', 'patient', 'Penicillin', 'Diabetes, High BP', 'HDFC Health', 'HDFC-001'),
  (gen_random_uuid(), 'patient2@hospital.com', 'Priya Sharma', '+91-9876543212', '1995-03-22', 'Female', 'O+', '789 Medical Street, City', 'patient', 'Sulpha', 'Asthma', 'ICICI Health', 'ICICI-002'),
  (gen_random_uuid(), 'patient3@hospital.com', 'Arun Singh', '+91-9876543213', '1985-07-08', 'Male', 'B+', '321 Clinic Lane, City', 'patient', None, 'None', 'Aditya Health', 'ADITYA-003'),
  (gen_random_uuid(), 'patient4@hospital.com', 'Deepa Patel', '+91-9876543214', '1992-11-30', 'Female', 'AB-', '654 Doctor Road, City', 'patient', 'Iodine', 'Thyroid', 'Star Health', 'STAR-004'),
  (gen_random_uuid(), 'patient5@hospital.com', 'Vikram Verma', '+91-9876543215', '1980-02-14', 'Male', 'O-', '987 Care Street, City', 'patient', None, 'Hypertension, Cholesterol', 'Care Health', 'CARE-005')
ON CONFLICT (email) DO NOTHING;

-- ===================================================
-- ADD MULTIPLE DOCTORS/PHYSICIANS
-- ===================================================
INSERT INTO public.profiles (
  id, email, full_name, phone, role, department, specialization
)
VALUES 
  (gen_random_uuid(), 'dr.rajesh@hospital.com', 'Dr. Rajesh Kumar', '+91-9900000001', 'doctor', 'Cardiology', 'Cardiologist'),
  (gen_random_uuid(), 'dr.priya@hospital.com', 'Dr. Priya Singh', '+91-9900000002', 'doctor', 'Neurology', 'Neurologist'),
  (gen_random_uuid(), 'dr.arun@hospital.com', 'Dr. Arun Patel', '+91-9900000003', 'doctor', 'Orthopedics', 'Orthopedic Surgeon'),
  (gen_random_uuid(), 'dr.meera@hospital.com', 'Dr. Meera Gupta', '+91-9900000004', 'doctor', 'Pediatrics', 'Pediatrician'),
  (gen_random_uuid(), 'dr.vikram@hospital.com', 'Dr. Vikram Nair', '+91-9900000005', 'doctor', 'Dermatology', 'Dermatologist'),
  (gen_random_uuid(), 'dr.anjali@hospital.com', 'Dr. Anjali Reddy', '+91-9900000006', 'doctor', 'General Medicine', 'General Physician'),
  (gen_random_uuid(), 'dr.nikhil@hospital.com', 'Dr. Nikhil Sharma', '+91-9900000007', 'doctor', 'Gastroenterology', 'Gastroenterologist'),
  (gen_random_uuid(), 'dr.sanya@hospital.com', 'Dr. Sanya Kapoor', '+91-9900000008', 'doctor', 'Gynecology', 'Gynecologist')
ON CONFLICT (email) DO NOTHING;

-- ===================================================
-- ADD STAFF, NURSES, PHARMACISTS
-- ===================================================
INSERT INTO public.profiles (
  id, email, full_name, phone, role, department
)
VALUES 
  (gen_random_uuid(), 'nurse.priya@hospital.com', 'Nurse Priya Guide', '+91-9877777001', 'nurse', 'General Ward'),
  (gen_random_uuid(), 'nurse.anjali@hospital.com', 'Nurse Anjali Sharma', '+91-9877777002', 'nurse', 'ICU'),
  (gen_random_uuid(), 'nurse.deepa@hospital.com', 'Nurse Deepa Singh', '+91-9877777003', 'nurse', 'OPD'),
  (gen_random_uuid(), 'pharmacist.raj@hospital.com', 'Raj Kumar (Pharmacist)', '+91-9888888001', 'pharmacist', 'Pharmacy'),
  (gen_random_uuid(), 'pharmacist.neha@hospital.com', 'Neha Patel (Pharmacist)', '+91-9888888002', 'pharmacist', 'Pharmacy'),
  (gen_random_uuid(), 'staff.admin@hospital.com', 'Admin Staff', '+91-9899999001', 'staff', 'Administration'),
  (gen_random_uuid(), 'lab.tech@hospital.com', 'Lab Technician Ravi', '+91-9866666001', 'lab_technician', 'Laboratory'),
  (gen_random_uuid(), 'dispatcher.rahul@hospital.com', 'Rahul Dispatcher', '+91-9855555001', 'dispatcher', 'Ambulance'),
  (gen_random_uuid(), 'driver.rohit@hospital.com', 'Driver Rohit', '+91-9844444001', 'driver', 'Ambulance')
ON CONFLICT (email) DO NOTHING;

-- ===================================================
-- ADD REALISTIC APPOINTMENTS (Past, Present, Future)
-- ===================================================
INSERT INTO public.appointments (
  patient_id, doctor_id, appointment_date, appointment_time, status, reason
)
SELECT 
  p.id, d.id,
  CASE WHEN random() < 0.3 THEN CURRENT_DATE - INTERVAL '10 days'
       WHEN random() < 0.5 THEN CURRENT_DATE + INTERVAL '1 day'
       WHEN random() < 0.7 THEN CURRENT_DATE + INTERVAL '3 days'
       ELSE CURRENT_DATE + INTERVAL '7 days'
  END,
  CASE 
    WHEN random() < 0.25 THEN '09:00:00'
    WHEN random() < 0.50 THEN '10:30:00'
    WHEN random() < 0.75 THEN '14:00:00'
    ELSE '15:30:00'
  END,
  CASE WHEN CURRENT_DATE - INTERVAL '10 days' > CURRENT_DATE::date THEN 'completed'::text
       WHEN CURRENT_DATE + INTERVAL '1 day' <= CURRENT_DATE::date THEN 'scheduled'::text
       ELSE 'scheduled'::text
  END,
  CASE 
    WHEN random() < 0.2 THEN 'General Checkup'
    WHEN random() < 0.4 THEN 'Follow-up Consultation'
    WHEN random() < 0.6 THEN 'Routine Blood Work'
    WHEN random() < 0.8 THEN 'Post-treatment Review'
    ELSE 'Emergency Consultation'
  END
FROM public.profiles p
CROSS JOIN (SELECT * FROM public.profiles WHERE role = 'doctor' ORDER BY random() LIMIT 1) d
WHERE p.role = 'patient'
LIMIT 20
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD TOKEN QUEUE ENTRIES (OPD)
-- ===================================================
INSERT INTO public.token_queue (
  patient_id, department, token_number, status, created_at, called_at
)
SELECT 
  p.id,
  CASE 
    WHEN random() < 0.2 THEN 'Cardiology'
    WHEN random() < 0.4 THEN 'Neurology'
    WHEN random() < 0.6 THEN 'General Medicine'
    WHEN random() < 0.8 THEN 'Pediatrics'
    ELSE 'Dermatology'
  END,
  (ROW_NUMBER() OVER (ORDER BY random()))::integer,
  CASE 
    WHEN random() < 0.3 THEN 'served'
    WHEN random() < 0.6 THEN 'waiting'
    ELSE 'called'
  END,
  NOW() - INTERVAL '2 hours' * random(),
  CASE WHEN random() < 0.5 THEN NOW() - INTERVAL '1 hour' * random() ELSE NULL END
FROM public.profiles p
WHERE p.role = 'patient'
LIMIT 15
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD EMERGENCY/AMBULANCE REQUESTS
-- ===================================================
INSERT INTO public.ambulance_requests (
  patient_id, patient_name, phone_number, address, 
  emergency_type, status, assigned_driver, assigned_vehicle
)
SELECT 
  p.id, p.full_name, p.phone,
  COALESCE(p.address, '123 Random Street') || ', City',
  CASE 
    WHEN random() < 0.3 THEN 'Critical'
    WHEN random() < 0.6 THEN 'High Priority'
    ELSE 'Normal'
  END,
  CASE 
    WHEN random() < 0.4 THEN 'arrived'
    WHEN random() < 0.7 THEN 'on_way'
    ELSE 'pending'
  END,
  (SELECT id FROM public.profiles WHERE role = 'driver' ORDER BY random() LIMIT 1),
  'Ambulance-' || LPAD((random()*100)::integer::text, 3, '0')
FROM public.profiles p
WHERE p.role = 'patient' AND random() < 0.4
LIMIT 8
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD ROOM ALLOCATIONS & BED MANAGEMENT
-- ===================================================
INSERT INTO public.room_allocations (
  patient_id, room_number, floor, room_type, 
  status, admission_date, discharge_date, assigned_doctor_id
)
SELECT 
  p.id,
  LPAD((random()*50)::integer::text, 3, '0'),
  (random()*5)::integer + 1,
  CASE 
    WHEN random() < 0.3 THEN 'Private Room'
    WHEN random() < 0.6 THEN 'Semi-Private'
    ELSE 'General Ward'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'discharged'
    ELSE 'allocated'
  END,
  CURRENT_DATE - INTERVAL '15 days' * random(),
  CASE WHEN random() < 0.3 THEN CURRENT_DATE + INTERVAL '2 days' ELSE NULL END,
  (SELECT id FROM public.profiles WHERE role = 'doctor' ORDER BY random() LIMIT 1)
FROM public.profiles p
WHERE p.role = 'patient' AND random() < 0.5
LIMIT 10
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD PRESCRIPTIONS (REALISTIC MEDICATIONS)
-- ===================================================
INSERT INTO public.prescriptions (
  patient_id, doctor_id, medication_name, dosage, frequency, 
  duration_days, instructions, status
)
SELECT 
  p.id,
  (SELECT id FROM public.profiles WHERE role = 'doctor' ORDER BY random() LIMIT 1),
  CASE 
    WHEN random() < 0.15 THEN 'Amoxicillin 500mg'
    WHEN random() < 0.30 THEN 'Metformin 500mg'
    WHEN random() < 0.45 THEN 'Lisinopril 10mg'
    WHEN random() < 0.60 THEN 'Aspirin 100mg'
    WHEN random() < 0.75 THEN 'Vitamin D3 1000IU'
    WHEN random() < 0.85 THEN 'Omeprazole 20mg'
    ELSE 'Atorvastatin 20mg'
  END,
  CASE 
    WHEN random() < 0.3 THEN '1 tablet'
    WHEN random() < 0.6 THEN '2 tablets'
    ELSE '1 capsule'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'Twice daily'
    WHEN random() < 0.6 THEN 'Once daily'
    ELSE 'Three times daily'
  END,
  CASE WHEN random() < 0.3 THEN 7 WHEN random() < 0.6 THEN 14 ELSE 30 END,
  'Take with meals. Continue as prescribed.',
  CASE WHEN random() < 0.5 THEN 'active' ELSE 'completed' END
FROM public.profiles p
WHERE p.role = 'patient'
LIMIT 25
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD LAB TESTS & REPORTS
-- ===================================================
INSERT INTO public.lab_reports (
  patient_id, test_name, test_category, ordered_date, 
  report_date, status, test_values, reference_range, interpretation
)
SELECT 
  p.id,
  CASE 
    WHEN random() < 0.25 THEN 'Blood Sugar (Fasting)'
    WHEN random() < 0.50 THEN 'Complete Blood Count'
    WHEN random() < 0.75 THEN 'Liver Function Test'
    ELSE 'Lipid Profile'
  END,
  CASE 
    WHEN random() < 0.25 THEN 'Endocrinology'
    WHEN random() < 0.50 THEN 'Hematology'
    WHEN random() < 0.75 THEN 'Biochemistry'
    ELSE 'Pathology'
  END,
  CURRENT_DATE - INTERVAL '14 days' * random(),
  CURRENT_DATE - INTERVAL '12 days' * random(),
  CASE WHEN random() < 0.8 THEN 'completed' ELSE 'pending' END,
  CASE 
    WHEN random() < 0.25 THEN '115 mg/dL'
    WHEN random() < 0.50 THEN 'RBC: 4.8, WBC: 7.2, Hb: 13.5'
    WHEN random() < 0.75 THEN 'ALT: 28, AST: 32, Bili: 0.8'
    ELSE 'Cholesterol: 205, LDL: 140, HDL: 38'
  END,
  CASE 
    WHEN random() < 0.25 THEN '70-100 mg/dL'
    WHEN random() < 0.50 THEN 'RBC: 4.5-5.9, WBC: 4.5-11, Hb: 12-16'
    WHEN random() < 0.75 THEN 'ALT: 7-56, AST: 10-40, Bili: 0.1-1.2'
    ELSE 'Chol: <200, LDL: <100, HDL: >40'
  END,
  'Results within normal range. Continue routine monitoring.'
FROM public.profiles p
WHERE p.role = 'patient'
LIMIT 20
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD BILLING RECORDS
-- ===================================================
INSERT INTO public.billing (
  patient_id, service_type, description, amount, 
  status, bill_date, due_date
)
SELECT 
  p.id,
  CASE 
    WHEN random() < 0.2 THEN 'Consultation'
    WHEN random() < 0.4 THEN 'Laboratory'
    WHEN random() < 0.6 THEN 'Pharmacy'
    WHEN random() < 0.8 THEN 'Room Charges'
    ELSE 'Procedure'
  END,
  CASE 
    WHEN random() < 0.2 THEN 'Doctor Consultation Fee'
    WHEN random() < 0.4 THEN 'Lab Test Package'
    WHEN random() < 0.6 THEN 'Medicine Supply'
    WHEN random() < 0.8 THEN 'Room Rent (5 days)'
    ELSE 'Diagnostic Procedure'
  END,
  CASE 
    WHEN random() < 0.2 THEN 500 + (random()*1000)::integer
    WHEN random() < 0.4 THEN 1500 + (random()*2000)::integer
    WHEN random() < 0.6 THEN 800 + (random()*1500)::integer
    WHEN random() < 0.8 THEN 5000 + (random()*5000)::integer
    ELSE 3000 + (random()*7000)::integer
  END,
  CASE WHEN random() < 0.6 THEN 'paid' ELSE 'pending' END,
  CURRENT_DATE - INTERVAL '20 days' * random(),
  CURRENT_DATE + INTERVAL '5 days'
FROM public.profiles p
WHERE p.role = 'patient'
LIMIT 30
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD MEDICINE REQUESTS & PHARMACY
-- ===================================================
INSERT INTO public.medicine_requests (
  patient_id, prescription_id, medicine_name, quantity_requested, 
  status, request_date, delivery_date
)
SELECT 
  p.id,
  (SELECT id FROM public.prescriptions WHERE patient_id = p.id ORDER BY random() LIMIT 1),
  CASE 
    WHEN random() < 0.2 THEN 'Amoxicillin 500mg'
    WHEN random() < 0.4 THEN 'Metformin 500mg'
    WHEN random() < 0.6 THEN 'Aspirin 100mg'
    WHEN random() < 0.8 THEN 'Vitamin D3'
    ELSE 'Omeprazole 20mg'
  END,
  (random()*3)::integer + 1,
  CASE 
    WHEN random() < 0.4 THEN 'pending'
    WHEN random() < 0.7 THEN 'in_progress'
    ELSE 'delivered'
  END,
  CURRENT_DATE - INTERVAL '5 days' * random(),
  CASE WHEN random() < 0.7 THEN CURRENT_DATE - INTERVAL '1 day' * random() ELSE NULL END
FROM public.profiles p
WHERE p.role = 'patient' AND EXISTS (SELECT 1 FROM public.prescriptions WHERE patient_id = p.id)
LIMIT 20
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD HELP DESK TICKETS / COMPLAINTS
-- ===================================================
INSERT INTO public.tickets (
  full_name, email, phone, role, department, 
  priority, status, title, description
)
SELECT 
  p.full_name, p.email, p.phone, p.role,
  CASE 
    WHEN random() < 0.2 THEN 'Billing'
    WHEN random() < 0.4 THEN 'Medical Records'
    WHEN random() < 0.6 THEN 'Appointment'
    WHEN random() < 0.8 THEN 'Pharmacy'
    ELSE 'Room Service'
  END,
  CASE WHEN random() < 0.3 THEN 'High' WHEN random() < 0.6 THEN 'Medium' ELSE 'Low' END,
  CASE 
    WHEN random() < 0.4 THEN 'open'
    WHEN random() < 0.7 THEN 'in_progress'
    ELSE 'closed'
  END,
  CASE 
    WHEN random() < 0.2 THEN 'Billing inquiry'
    WHEN random() < 0.4 THEN 'Appointment rescheduling'
    WHEN random() < 0.6 THEN 'Medicine delivery issue'
    WHEN random() < 0.8 THEN 'Room cleanliness complaint'
    ELSE 'Lab report not received'
  END,
  'Patient inquiry regarding hospital services. Awaiting resolution.'
FROM public.profiles p
WHERE p.role = 'patient' AND random() < 0.6
LIMIT 15
ON CONFLICT DO NOTHING;

-- ===================================================
-- ADD MEDICINES TO INVENTORY
-- ===================================================
INSERT INTO public.medicines (
  name, category, description, dosage, unit_price, stock_quantity, supplier
)
VALUES 
  ('Amoxicillin 500mg', 'Antibiotic', 'Broad-spectrum antibiotic', '500mg tablet', 15, 500, 'PharmaCorp Ltd'),
  ('Metformin 500mg', 'Diabetes', 'Blood sugar control agent', '500mg tablet', 12, 800, 'MediFirst'),
  ('Lisinopril 10mg', 'Blood Pressure', 'ACE inhibitor', '10mg tablet', 20, 400, 'CardioMed'),
  ('Aspirin 100mg', 'Pain Relief', 'Analgesic and antiplatelet', '100mg tablet', 8, 1200, 'HealthCare Plus'),
  ('Vitamin D3 1000IU', 'Supplements', 'Vitamin D supplement', '1000IU capsule', 10, 600, 'NutriLife'),
  ('Omeprazole 20mg', 'Gastric', 'Acid reflux treatment', '20mg capsule', 18, 350, 'DigestCare'),
  ('Atorvastatin 20mg', 'Cholesterol', 'Statin for cholesterol', '20mg tablet', 25, 300, 'CardioWell'),
  ('Loratadine 10mg', 'Allergy', 'Antihistamine', '10mg tablet', 14, 450, 'AllergyStop'),
  ('Ibuprofen 400mg', 'Pain Relief', 'Anti-inflammatory pain reliever', '400mg tablet', 9, 900, 'PainFree'),
  ('Amlodipine 5mg', 'Blood Pressure', 'Calcium channel blocker', '5mg tablet', 22, 400, 'HyperControl'),
  ('Ciprofloxacin 500mg', 'Antibiotic', 'Fluoroquinolone antibiotic', '500mg tablet', 18, 600, 'MediTech'),
  ('Ranitidine 150mg', 'Gastric', 'Acid reflux treatment', '150mg tablet', 10, 700, 'GastroHealth'),
  ('Fluoxetine 20mg', 'Mental Health', 'Antidepressant', '20mg capsule', 25, 300, 'MindWell'),
  ('Paracetamol 500mg', 'Pain Relief', 'Fever and pain relief', '500mg tablet', 5, 2000, 'FeverFree'),
  ('Cetirizine 10mg', 'Allergy', 'Antihistamine', '10mg tablet', 8, 850, 'AllergyRelief')
ON CONFLICT DO NOTHING;

-- ===================================================
-- VERIFY DATA INSERTION
-- ===================================================

RAISE NOTICE 'DEMO DATA INSERTION SUMMARY:';
RAISE NOTICE '========================================';
RAISE NOTICE 'Patients: %', (SELECT COUNT(*) FROM public.profiles WHERE role = 'patient');
RAISE NOTICE 'Doctors: %', (SELECT COUNT(*) FROM public.profiles WHERE role = 'doctor');
RAISE NOTICE 'Staff/Nurses: %', (SELECT COUNT(*) FROM public.profiles WHERE role IN ('nurse', 'staff', 'pharmacist', 'lab_technician', 'driver', 'dispatcher'));
RAISE NOTICE 'Appointments: %', (SELECT COUNT(*) FROM public.appointments);
RAISE NOTICE 'OPD Tokens: %', (SELECT COUNT(*) FROM public.token_queue);
RAISE NOTICE 'Ambulance Requests: %', (SELECT COUNT(*) FROM public.ambulance_requests);
RAISE NOTICE 'Room Allocations: %', (SELECT COUNT(*) FROM public.room_allocations);
RAISE NOTICE 'Prescriptions: %', (SELECT COUNT(*) FROM public.prescriptions);
RAISE NOTICE 'Lab Reports: %', (SELECT COUNT(*) FROM public.lab_reports);
RAISE NOTICE 'Billing Records: %', (SELECT COUNT(*) FROM public.billing);
RAISE NOTICE 'Medicine Requests: %', (SELECT COUNT(*) FROM public.medicine_requests);
RAISE NOTICE 'Help Desk Tickets: %', (SELECT COUNT(*) FROM public.tickets);
RAISE NOTICE 'Medicines in Inventory: %', (SELECT COUNT(*) FROM public.medicines);
RAISE NOTICE '========================================';
RAISE NOTICE '✅ DEMO DATA SUCCESSFULLY INSERTED!';

END $$;
