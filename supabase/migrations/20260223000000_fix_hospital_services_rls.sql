-- =====================================================
-- FIX HOSPITAL SERVICES RLS POLICIES
-- This migration fixes RLS policies to work without user_roles table
-- Uses profiles table role column instead
-- =====================================================

-- Drop existing policies that reference user_roles
DROP POLICY IF EXISTS "Staff can manage all tokens" ON public.token_queue;
DROP POLICY IF EXISTS "Staff can manage room allocations" ON public.room_allocations;
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Staff can update medicine requests" ON public.medicine_requests;
DROP POLICY IF EXISTS "Staff can manage lab reports" ON public.lab_reports;
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update ambulance requests" ON public.ambulance_requests;
DROP POLICY IF EXISTS "Staff can manage billing" ON public.billing;

-- TOKEN QUEUE: Staff can manage using profiles.role
CREATE POLICY "Staff can manage all tokens" ON public.token_queue
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor')
  ));

-- TOKEN QUEUE: Allow SELECT for viewing tokens
DROP POLICY IF EXISTS "Users can view own tokens" ON public.token_queue;
CREATE POLICY "Users can view own tokens" ON public.token_queue
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

-- ROOM ALLOCATIONS: Staff can manage
CREATE POLICY "Staff can manage room allocations" ON public.room_allocations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor')
  ));

-- PRESCRIPTIONS: Doctors and staff can create
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin')
  ));

-- MEDICINE REQUESTS: Staff can update
CREATE POLICY "Staff can update medicine requests" ON public.medicine_requests
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor')
  ));

-- LAB REPORTS: Staff can manage
CREATE POLICY "Staff can manage lab reports" ON public.lab_reports
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor')
  ));

-- APPOINTMENTS: Users and staff can update
CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (
    auth.uid() = patient_id OR 
    auth.uid() = doctor_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

-- AMBULANCE REQUESTS: Staff can update
CREATE POLICY "Staff can update ambulance requests" ON public.ambulance_requests
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor')
  ));

-- BILLING: Staff can manage
CREATE POLICY "Staff can manage billing" ON public.billing
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor')
  ));

-- Add missing policies for regular users

-- PRESCRIPTIONS: Patients can view own
DROP POLICY IF EXISTS "Users can view own prescriptions" ON public.prescriptions;
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    auth.uid() = doctor_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

-- MEDICINE REQUESTS: Patients can view own
DROP POLICY IF EXISTS "Users can view own medicine requests" ON public.medicine_requests;
CREATE POLICY "Users can view own medicine requests" ON public.medicine_requests
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

-- LAB REPORTS: Patients can view own
DROP POLICY IF EXISTS "Users can view own lab reports" ON public.lab_reports;
CREATE POLICY "Users can view own lab reports" ON public.lab_reports
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    auth.uid() = ordered_by OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

-- APPOINTMENTS: Patients can view own
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    auth.uid() = doctor_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

-- AMBULANCE REQUESTS: Patients can view own
DROP POLICY IF EXISTS "Users can view own ambulance requests" ON public.ambulance_requests;
CREATE POLICY "Users can view own ambulance requests" ON public.ambulance_requests
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

-- BILLING: Patients can view own
DROP POLICY IF EXISTS "Users can view own bills" ON public.billing;
CREATE POLICY "Users can view own bills" ON public.billing
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

-- ROOM ALLOCATIONS: Patients can view own
DROP POLICY IF EXISTS "Users can view own room allocations" ON public.room_allocations;
CREATE POLICY "Users can view own room allocations" ON public.room_allocations
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'doctor'))
  );

COMMENT ON POLICY "Users can create own tokens" ON public.token_queue IS 'Allows authenticated users to create their own tokens';
COMMENT ON POLICY "Users can create appointments" ON public.appointments IS 'Allows authenticated users to book appointments';
COMMENT ON POLICY "Users can create ambulance requests" ON public.ambulance_requests IS 'Allows authenticated users to request ambulances';
COMMENT ON POLICY "Users can create medicine requests" ON public.medicine_requests IS 'Allows authenticated users to request medicines';
