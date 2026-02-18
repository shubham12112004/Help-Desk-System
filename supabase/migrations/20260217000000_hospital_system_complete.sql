-- =====================================================
-- HOSPITAL HELP DESK SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Created: 2026-02-17
-- Features: Roles, Tickets, Assignments, Comments, Attachments, 
--           Notifications, Appointments, Analytics, RLS Policies
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS AND TYPES
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('citizen', 'patient', 'staff', 'doctor', 'admin');

-- Ticket status workflow
CREATE TYPE ticket_status AS ENUM ('open', 'assigned', 'in_progress', 'pending_info', 'resolved', 'closed', 'cancelled');

-- Ticket priority
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');

-- Ticket category
CREATE TYPE ticket_category AS ENUM (
  'medical_inquiry',
  'appointment_request',
  'prescription_refill',
  'test_results',
  'billing',
  'insurance',
  'technical_support',
  'facility_issue',
  'complaint',
  'emergency',
  'other'
);

-- Appointment status
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'ticket_created',
  'ticket_assigned',
  'ticket_updated',
  'ticket_commented',
  'appointment_scheduled',
  'appointment_reminder',
  'sla_warning',
  'sla_breach',
  'system_alert'
);

-- =====================================================
-- TABLES
-- =====================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'citizen',
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  specialization TEXT, -- For doctors
  employee_id TEXT UNIQUE, -- For staff/doctors
  date_of_birth DATE,
  address TEXT,
  emergency_contact TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  
  -- Relationships
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- SLA tracking
  sla_due_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[],
  patient_mrn TEXT, -- Medical Record Number
  related_appointment_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  CONSTRAINT valid_status CHECK (status IN ('open', 'assigned', 'in_progress', 'pending_info', 'resolved', 'closed', 'cancelled'))
);

-- Create indexes for tickets
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_category ON public.tickets(category);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX idx_tickets_sla_due_at ON public.tickets(sla_due_at) WHERE status NOT IN ('closed', 'cancelled');

-- Ticket Comments
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes only visible to staff
  is_system_message BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id, created_at DESC);
CREATE INDEX idx_ticket_comments_user_id ON public.ticket_comments(user_id);

-- Ticket Attachments
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.ticket_comments(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_comment_id ON public.ticket_attachments(comment_id);

-- Ticket Activity Log
CREATE TABLE IF NOT EXISTS public.ticket_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_activity_log_ticket_id ON public.ticket_activity_log(ticket_id, created_at DESC);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_number TEXT UNIQUE NOT NULL,
  
  -- Relationships
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  related_ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  
  -- Schedule
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  
  -- Details
  reason TEXT NOT NULL,
  notes TEXT,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  
  -- Location
  room_number TEXT,
  department TEXT,
  
  -- Timestamps
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 480)
);

CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.ticket_comments(id) ON DELETE CASCADE,
  
  -- Metadata
  data JSONB,
  link TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_ticket_id ON public.notifications(ticket_id);

-- SLA Policies
CREATE TABLE IF NOT EXISTS public.sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category ticket_category,
  priority ticket_priority NOT NULL,
  
  -- Time limits in minutes
  first_response_minutes INTEGER NOT NULL,
  resolution_minutes INTEGER NOT NULL,
  
  -- Business hours
  applies_business_hours_only BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_sla_policy UNIQUE (category, priority)
);

-- Insert default SLA policies
INSERT INTO public.sla_policies (name, category, priority, first_response_minutes, resolution_minutes) VALUES
  ('Emergency Critical', 'emergency', 'critical', 5, 60),
  ('Emergency Urgent', 'emergency', 'urgent', 10, 120),
  ('Medical Critical', 'medical_inquiry', 'critical', 15, 240),
  ('Medical Urgent', 'medical_inquiry', 'urgent', 30, 480),
  ('Medical High', 'medical_inquiry', 'high', 60, 1440),
  ('Medical Medium', 'medical_inquiry', 'medium', 240, 2880),
  ('Appointment Urgent', 'appointment_request', 'urgent', 30, 240),
  ('Appointment High', 'appointment_request', 'high', 120, 1440),
  ('Default Critical', NULL, 'critical', 30, 480),
  ('Default Urgent', NULL, 'urgent', 60, 960),
  ('Default High', NULL, 'high', 240, 2880),
  ('Default Medium', NULL, 'medium', 480, 5760),
  ('Default Low', NULL, 'low', 1440, 10080)
ON CONFLICT (category, priority) DO NOTHING;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON public.ticket_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sla_policies_updated_at BEFORE UPDATE ON public.sla_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- Function to generate appointment number
CREATE OR REPLACE FUNCTION generate_appointment_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.appointment_number := 'APT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('appointment_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS appointment_number_seq;

CREATE TRIGGER generate_appointment_number_trigger
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  WHEN (NEW.appointment_number IS NULL)
  EXECUTE FUNCTION generate_appointment_number();

-- Function to calculate SLA due date
CREATE OR REPLACE FUNCTION calculate_sla_due_date()
RETURNS TRIGGER AS $$
DECLARE
  sla_minutes INTEGER;
BEGIN
  -- Get SLA policy for this ticket
  SELECT resolution_minutes INTO sla_minutes
  FROM public.sla_policies
  WHERE 
    (category = NEW.category OR category IS NULL)
    AND priority = NEW.priority
    AND is_active = true
  ORDER BY category NULLS LAST
  LIMIT 1;
  
  IF sla_minutes IS NOT NULL THEN
    NEW.sla_due_at := NEW.created_at + (sla_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_sla_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sla_due_date();

-- Function to log ticket changes
CREATE OR REPLACE FUNCTION log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ticket_activity_log (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status_changed', OLD.status::TEXT, NEW.status::TEXT);
  END IF;
  
  -- Log priority changes
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO public.ticket_activity_log (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'priority_changed', OLD.priority::TEXT, NEW.priority::TEXT);
  END IF;
  
  -- Log assignment changes
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.ticket_activity_log (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'assigned', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT);
    
    -- Create notification for assignee
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, ticket_id, link)
      VALUES (
        NEW.assigned_to,
        'ticket_assigned',
        'New Ticket Assigned',
        'Ticket ' || NEW.ticket_number || ' has been assigned to you',
        NEW.id,
        '/tickets/' || NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_ticket_changes_trigger
  AFTER UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_changes();

-- Function to create comment notification
CREATE OR REPLACE FUNCTION notify_ticket_comment()
RETURNS TRIGGER AS $$
DECLARE
  ticket_record RECORD;
  user_to_notify UUID;
BEGIN
  -- Get ticket details
  SELECT * INTO ticket_record FROM public.tickets WHERE id = NEW.ticket_id;
  
  -- Notify ticket creator if comment is from someone else
  IF ticket_record.created_by != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, ticket_id, comment_id, link)
    VALUES (
      ticket_record.created_by,
      'ticket_commented',
      'New Comment on Your Ticket',
      'New comment on ticket ' || ticket_record.ticket_number,
      NEW.ticket_id,
      NEW.id,
      '/tickets/' || NEW.ticket_id
    );
  END IF;
  
  -- Notify assigned user if different from creator and commenter
  IF ticket_record.assigned_to IS NOT NULL 
     AND ticket_record.assigned_to != NEW.user_id 
     AND ticket_record.assigned_to != ticket_record.created_by THEN
    INSERT INTO public.notifications (user_id, type, title, message, ticket_id, comment_id, link)
    VALUES (
      ticket_record.assigned_to,
      'ticket_commented',
      'New Comment on Assigned Ticket',
      'New comment on ticket ' || ticket_record.ticket_number,
      NEW.ticket_id,
      NEW.id,
      '/tickets/' || NEW.ticket_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_ticket_comment_trigger
  AFTER INSERT ON public.ticket_comments
  FOR EACH ROW
  WHEN (NEW.is_system_message = false)
  EXECUTE FUNCTION notify_ticket_comment();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('staff', 'doctor', 'admin')
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tickets Policies
CREATE POLICY "Users can view their own tickets"
  ON public.tickets FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Staff can view assigned tickets"
  ON public.tickets FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('staff', 'doctor', 'admin')
    )
  );

CREATE POLICY "Users can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own tickets"
  ON public.tickets FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Staff can update assigned tickets"
  ON public.tickets FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('staff', 'doctor', 'admin')
    )
  );

-- Comments Policies
CREATE POLICY "Users can view comments on their tickets"
  ON public.ticket_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE id = ticket_id
      AND (created_by = auth.uid() OR assigned_to = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'doctor', 'admin')
    )
  );

CREATE POLICY "Users can create comments"
  ON public.ticket_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tickets
      WHERE id = ticket_id
      AND (created_by = auth.uid() OR assigned_to = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'doctor', 'admin')
    )
  );

-- Attachments Policies
CREATE POLICY "Users can view attachments on accessible tickets"
  ON public.ticket_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE id = ticket_id
      AND (created_by = auth.uid() OR assigned_to = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'doctor', 'admin')
    )
  );

CREATE POLICY "Users can upload attachments"
  ON public.ticket_attachments FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- Activity Log Policies
CREATE POLICY "Users can view activity on their tickets"
  ON public.ticket_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE id = ticket_id
      AND (created_by = auth.uid() OR assigned_to = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'doctor', 'admin')
    )
  );

-- Appointments Policies
CREATE POLICY "Patients can view their appointments"
  ON public.appointments FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their appointments"
  ON public.appointments FOR SELECT
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Patients can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Staff can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'doctor', 'admin')
    )
  );

CREATE POLICY "Patients can update their appointments"
  ON public.appointments FOR UPDATE
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can update their appointments"
  ON public.appointments FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- SLA Policies - Read only for most, admin can modify
CREATE POLICY "Everyone can view SLA policies"
  ON public.sla_policies FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage SLA policies"
  ON public.sla_policies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Ticket Statistics View
CREATE OR REPLACE VIEW ticket_statistics AS
SELECT
  COUNT(*) as total_tickets,
  COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
  COUNT(*) FILTER (WHERE status IN ('assigned', 'in_progress')) as active_tickets,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets,
  COUNT(*) FILTER (WHERE priority = 'critical') as critical_tickets,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_tickets,
  COUNT(*) FILTER (WHERE sla_due_at < NOW() AND status NOT IN ('closed', 'cancelled')) as overdue_tickets,
  AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at))/3600) as avg_resolution_hours
FROM public.tickets
WHERE created_at >= NOW() - INTERVAL '30 days';

-- User Performance View
CREATE OR REPLACE VIEW user_performance AS
SELECT
  p.id,
  p.full_name,
  p.role,
  COUNT(t.id) as assigned_tickets,
  COUNT(t.id) FILTER (WHERE t.status = 'resolved') as resolved_tickets,
  COUNT(t.id) FILTER (WHERE t.status = 'closed') as closed_tickets,
  AVG(EXTRACT(EPOCH FROM (COALESCE(t.resolved_at, NOW()) - t.created_at))/3600) as avg_resolution_hours,
  COUNT(t.id) FILTER (WHERE t.sla_due_at < NOW() AND t.status NOT IN ('closed', 'cancelled')) as overdue_tickets
FROM public.profiles p
LEFT JOIN public.tickets t ON t.assigned_to = p.id
WHERE p.role IN ('staff', 'doctor')
  AND (t.created_at IS NULL OR t.created_at >= NOW() - INTERVAL '30 days')
GROUP BY p.id, p.full_name, p.role;

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE ticket_number_seq TO authenticated;
GRANT USAGE ON SEQUENCE appointment_number_seq TO authenticated;

-- Grant access to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.tickets TO authenticated;
GRANT ALL ON public.ticket_comments TO authenticated;
GRANT ALL ON public.ticket_attachments TO authenticated;
GRANT ALL ON public.ticket_activity_log TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT SELECT ON public.sla_policies TO authenticated;
GRANT SELECT ON ticket_statistics TO authenticated;
GRANT SELECT ON user_performance TO authenticated;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

COMMENT ON TABLE public.profiles IS 'User profiles with role-based access';
COMMENT ON TABLE public.tickets IS 'Help desk tickets with SLA tracking';
COMMENT ON TABLE public.ticket_comments IS 'Comments and chat on tickets';
COMMENT ON TABLE public.ticket_attachments IS 'File attachments for tickets';
COMMENT ON TABLE public.appointments IS 'Patient appointments with doctors';
COMMENT ON TABLE public.notifications IS 'Real-time notifications for users';

-- =====================================================
-- COMPLETE!
-- =====================================================
