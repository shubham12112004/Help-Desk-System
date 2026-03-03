/**
 * Create Patient Medical Records Table via API
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTableAndSeedData() {
  console.log('🏥 Creating patient_medical_records table and seeding data...\n');

  // SQL to create table and insert data
  const sql = `
-- Create table
CREATE TABLE IF NOT EXISTS public.patient_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  department TEXT NOT NULL,
  condition_status TEXT DEFAULT 'stable',
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_patient_id ON public.patient_medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_department ON public.patient_medical_records(department);
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_condition_status ON public.patient_medical_records(condition_status);

-- Enable RLS
ALTER TABLE public.patient_medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone authenticated can view patient medical records" ON public.patient_medical_records;
CREATE POLICY "Anyone authenticated can view patient medical records"
  ON public.patient_medical_records FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can manage patient medical records" ON public.patient_medical_records;
CREATE POLICY "Staff can manage patient medical records"
  ON public.patient_medical_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff', 'doctor', 'nurse')
    )
  );
`;

  try {
    // Execute the SQL using the REST API approach
    console.log('📝 Executing SQL to create table...');
    
    // Note: This approach requires having SQL execution enabled
    // If this doesn't work, the user will need to run the SQL in Supabase Dashboard
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    console.log('⚠️  Direct SQL execution may not be available via API.');
    console.log('📋 Please run the setup-patient-records.sql file in Supabase Dashboard:\n');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Open and run: setup-patient-records.sql\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\n📋 Alternative: Run setup-patient-records.sql in Supabase Dashboard');
  }
}

createTableAndSeedData();
