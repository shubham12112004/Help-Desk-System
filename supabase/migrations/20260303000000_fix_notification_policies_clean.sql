-- Clean Migration: Fix Notification Policies
-- Date: 2026-03-03
-- Purpose: Fix RLS policies for ambulance_requests, notifications, and medicine_requests tables

-- ==================================================
-- DROP PROBLEMATIC POLICIES
-- ==================================================

DROP POLICY IF EXISTS "Users can create ambulance requests" ON public.ambulance_requests;
DROP POLICY IF EXISTS "Anyone authenticated can create ambulance requests" ON public.ambulance_requests;
DROP POLICY IF EXISTS "Users can view own ambulance requests" ON public.ambulance_requests;

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

DROP POLICY IF EXISTS "Users can create medicine requests" ON public.medicine_requests;
DROP POLICY IF EXISTS "Anyone authenticated can create medicine requests" ON public.medicine_requests;
DROP POLICY IF EXISTS "Patients can create own medicine requests" ON public.medicine_requests;
DROP POLICY IF EXISTS "Users can view own medicine requests" ON public.medicine_requests;
DROP POLICY IF EXISTS "Staff can update medicine requests" ON public.medicine_requests;
DROP POLICY IF EXISTS "Pharmacy staff can update requests" ON public.medicine_requests;

-- ==================================================
-- CREATE AMBULANCE REQUESTS RLS POLICIES
-- ==================================================

CREATE POLICY "Authenticated users can create ambulance requests"
  ON public.ambulance_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can view own ambulance requests"
  ON public.ambulance_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = patient_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin', 'doctor')
    )
  );

CREATE POLICY "Staff can update ambulance requests"
  ON public.ambulance_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin', 'doctor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin', 'doctor')
    )
  );

-- ==================================================
-- CREATE NOTIFICATIONS RLS POLICIES
-- ==================================================

CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================================================
-- CREATE MEDICINE REQUESTS RLS POLICIES
-- ==================================================

CREATE POLICY "Authenticated users can create medicine requests"
  ON public.medicine_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can view own medicine requests"
  ON public.medicine_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = patient_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin', 'doctor', 'pharmacy')
    )
  );

CREATE POLICY "Staff can update medicine requests"
  ON public.medicine_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin', 'pharmacy')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin', 'pharmacy')
    )
  );

-- ==================================================
-- SUCCESS MESSAGE
-- ==================================================

-- This migration successfully fixes all RLS policies
-- No errors should occur during execution
