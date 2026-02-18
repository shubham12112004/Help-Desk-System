-- =====================================================
-- COMPLETE HOSPITAL MANAGEMENT SYSTEM DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENHANCED PROFILES TABLE
-- =====================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS patient_id TEXT,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- =====================================================
-- 2. TOKEN QUEUE SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.token_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_number INTEGER NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in-progress', 'completed', 'cancelled')),
  estimated_wait_minutes INTEGER,
  current_token INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_queue_patient ON public.token_queue(patient_id);
CREATE INDEX idx_token_queue_status ON public.token_queue(status);
CREATE INDEX idx_token_queue_department ON public.token_queue(department);

-- =====================================================
-- 3. ROOM/BED ALLOCATION
-- =====================================================
CREATE TABLE IF NOT EXISTS public.room_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  bed_number TEXT NOT NULL,
  ward_type TEXT DEFAULT 'general' CHECK (ward_type IN ('general', 'icu', 'vip', 'emergency')),
  admission_date TIMESTAMPTZ DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  assigned_doctor_id UUID REFERENCES auth.users(id),
  assigned_nurse_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'allocated' CHECK (status IN ('allocated', 'waiting', 'discharged')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_room_allocations_patient ON public.room_allocations(patient_id);
CREATE INDEX idx_room_allocations_status ON public.room_allocations(status);

-- =====================================================
-- 4. PRESCRIPTIONS & MEDICINE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  schedule TEXT NOT NULL,
  days INTEGER NOT NULL,
  instructions TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  prescribed_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medicine_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  delivery_type TEXT DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'processing', 'ready', 'delivered')),
  delivery_address TEXT,
  request_date TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_medicine_requests_patient ON public.medicine_requests(patient_id);
CREATE INDEX idx_medicine_requests_status ON public.medicine_requests(delivery_status);

-- =====================================================
-- 5. LAB REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  ordered_by UUID REFERENCES auth.users(id),
  report_file_url TEXT,
  test_date TIMESTAMPTZ DEFAULT NOW(),
  result_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lab_reports_patient ON public.lab_reports(patient_id);
CREATE INDEX idx_lab_reports_status ON public.lab_reports(status);

-- =====================================================
-- 6. APPOINTMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  department TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  slot TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- =====================================================
-- 7. AMBULANCE REQUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ambulance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  emergency_type TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'assigned', 'dispatched', 'arrived', 'completed', 'cancelled')),
  ambulance_number TEXT,
  driver_name TEXT,
  driver_contact TEXT,
  estimated_arrival TIME,
  request_time TIMESTAMPTZ DEFAULT NOW(),
  completed_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ambulance_requests_patient ON public.ambulance_requests(patient_id);
CREATE INDEX idx_ambulance_requests_status ON public.ambulance_requests(status);

-- =====================================================
-- 8. BILLING
-- =====================================================
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  pending_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
  bill_date TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE,
  payment_method TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_patient ON public.billing(patient_id);
CREATE INDEX idx_billing_status ON public.billing(status);

-- =====================================================
-- 9. NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ticket', 'token', 'medicine', 'room', 'appointment', 'ambulance', 'billing', 'lab', 'emergency')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- =====================================================
-- 10. AI CHATBOT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES public.ai_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chats_user ON public.ai_chats(user_id);
CREATE INDEX idx_ai_messages_chat ON public.ai_messages(chat_id);
CREATE INDEX idx_ai_messages_created ON public.ai_messages(created_at);

-- =====================================================
-- 11. ENHANCED TICKETS TABLE
-- =====================================================
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS sub_department TEXT,
ADD COLUMN IF NOT EXISTS estimated_resolution_time TIMESTAMPTZ;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.token_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- TOKEN QUEUE POLICIES
DROP POLICY IF EXISTS "Users can view own tokens" ON public.token_queue;
CREATE POLICY "Users can view own tokens" ON public.token_queue
  FOR SELECT USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Staff can manage all tokens" ON public.token_queue;
CREATE POLICY "Staff can manage all tokens" ON public.token_queue
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Users can create own tokens" ON public.token_queue;
CREATE POLICY "Users can create own tokens" ON public.token_queue
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- ROOM ALLOCATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own room allocations" ON public.room_allocations;
CREATE POLICY "Users can view own room allocations" ON public.room_allocations
  FOR SELECT USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Staff can manage room allocations" ON public.room_allocations;
CREATE POLICY "Staff can manage room allocations" ON public.room_allocations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

-- PRESCRIPTIONS POLICIES
DROP POLICY IF EXISTS "Users can view own prescriptions" ON public.prescriptions;
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Doctors can create prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('doctor', 'staff', 'admin')
  ));

-- MEDICINE REQUESTS POLICIES
DROP POLICY IF EXISTS "Users can view own medicine requests" ON public.medicine_requests;
CREATE POLICY "Users can view own medicine requests" ON public.medicine_requests
  FOR SELECT USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Users can create medicine requests" ON public.medicine_requests;
CREATE POLICY "Users can create medicine requests" ON public.medicine_requests
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Staff can update medicine requests" ON public.medicine_requests;
CREATE POLICY "Staff can update medicine requests" ON public.medicine_requests
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

-- LAB REPORTS POLICIES
DROP POLICY IF EXISTS "Users can view own lab reports" ON public.lab_reports;
CREATE POLICY "Users can view own lab reports" ON public.lab_reports
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = ordered_by OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Staff can manage lab reports" ON public.lab_reports;
CREATE POLICY "Staff can manage lab reports" ON public.lab_reports
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

-- APPOINTMENTS POLICIES
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin', 'doctor')
  ));

-- AMBULANCE REQUESTS POLICIES
DROP POLICY IF EXISTS "Users can view own ambulance requests" ON public.ambulance_requests;
CREATE POLICY "Users can view own ambulance requests" ON public.ambulance_requests
  FOR SELECT USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Users can create ambulance requests" ON public.ambulance_requests;
CREATE POLICY "Users can create ambulance requests" ON public.ambulance_requests
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Staff can update ambulance requests" ON public.ambulance_requests;
CREATE POLICY "Staff can update ambulance requests" ON public.ambulance_requests
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

-- BILLING POLICIES
DROP POLICY IF EXISTS "Users can view own bills" ON public.billing;
CREATE POLICY "Users can view own bills" ON public.billing
  FOR SELECT USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  ));

DROP POLICY IF EXISTS "Staff can manage billing" ON public.billing;
CREATE POLICY "Staff can manage billing" ON public.billing
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id =auth.uid() AND role IN ('staff', 'admin')
  ));

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- AI CHAT POLICIES
DROP POLICY IF EXISTS "Users can view own chats" ON public.ai_chats;
CREATE POLICY "Users can view own chats" ON public.ai_chats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own chats" ON public.ai_chats;
CREATE POLICY "Users can create own chats" ON public.ai_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chats" ON public.ai_chats;
CREATE POLICY "Users can update own chats" ON public.ai_chats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_messages;
CREATE POLICY "Users can view own messages" ON public.ai_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.ai_chats WHERE id = chat_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can create messages" ON public.ai_messages;
CREATE POLICY "Users can create messages" ON public.ai_messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_chats WHERE id = chat_id AND user_id = auth.uid()
  ));

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.token_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_allocations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medicine_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_messages;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_token_queue_updated_at ON public.token_queue;
CREATE TRIGGER update_token_queue_updated_at BEFORE UPDATE ON public.token_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_room_allocations_updated_at ON public.room_allocations;
CREATE TRIGGER update_room_allocations_updated_at BEFORE UPDATE ON public.room_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lab_reports_updated_at ON public.lab_reports;
CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON public.lab_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ambulance_requests_updated_at ON public.ambulance_requests;
CREATE TRIGGER update_ambulance_requests_updated_at BEFORE UPDATE ON public.ambulance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_updated_at ON public.billing;
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON public.billing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_chats_updated_at ON public.ai_chats;
CREATE TRIGGER update_ai_chats_updated_at BEFORE UPDATE ON public.ai_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample departments for token queue
-- This is handled in the application code

COMMENT ON TABLE public.token_queue IS 'Patient token queue for OPD departments';
COMMENT ON TABLE public.room_allocations IS 'Hospital room and bed allocations';
COMMENT ON TABLE public.prescriptions IS 'Doctor prescriptions for patients';
COMMENT ON TABLE public.medicine_requests IS 'Patient pharmacy requests';
COMMENT ON TABLE public.lab_reports IS 'Patient laboratory test reports';
COMMENT ON TABLE public.appointments IS 'Doctor appointment bookings';
COMMENT ON TABLE public.ambulance_requests IS 'Emergency ambulance requests';
COMMENT ON TABLE public.billing IS 'Patient bills and payments';
COMMENT ON TABLE public.notifications IS 'User notifications for all activities';
COMMENT ON TABLE public.ai_chats IS 'AI chatbot conversation threads';
COMMENT ON TABLE public.ai_messages IS 'AI chatbot messages';
