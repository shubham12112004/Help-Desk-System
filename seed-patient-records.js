/**
 * Seed Patient Medical Records Data
 * Run this script to populate the patient_medical_records table with demo data
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General', 'Emergency'];
const conditions = ['stable', 'observation', 'critical', 'improving'];

const complaints = [
  'Chest pain and shortness of breath',
  'Severe headache and dizziness',
  'High fever and cough',
  'Leg fracture from accident',
  'Abdominal pain',
  'General checkup and monitoring',
  'Chronic back pain',
  'Diabetes management',
  'Hypertension follow-up',
  'Post-surgery recovery'
];

const diagnoses = [
  'Acute Coronary Syndrome',
  'Possible Stroke',
  'Pneumonia',
  'Tibial Fracture',
  'Gastritis',
  'General health assessment',
  'Lumbar Strain',
  'Type 2 Diabetes',
  'Essential Hypertension',
  'Successful surgical recovery'
];

const treatments = [
  'Emergency cardiac monitoring, oxygen therapy, medications',
  'CT scan, neurological monitoring, observe for 48 hours',
  'Antibiotics, rest, respiratory support',
  'Surgery scheduled, pain management, immobilization',
  'Dietary management, antacids, monitoring',
  'Regular checkups, lifestyle counseling',
  'Physical therapy, pain management, rest',
  'Insulin therapy, dietary counseling, regular monitoring',
  'Antihypertensive medication, lifestyle modifications',
  'Post-op care, wound management, follow-up in 2 weeks'
];

async function seedPatientRecords() {
  console.log('🏥 Starting Patient Medical Records Seeding...\n');

  try {
    // First, create the table if it doesn't exist
    console.log('📋 Creating patient_medical_records table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.patient_medical_records (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      `
    });

    // Get patients
    const { data: patients, error: patientsError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('role', ['patient', 'citizen'])
      .limit(15);

    if (patientsError) {
      console.error('❌ Error fetching patients:', patientsError);
      return;
    }

    if (!patients || patients.length === 0) {
      console.log('⚠️  No patients found. Creating sample patient profiles first...');
      
      // Create some sample patients
      const samplePatients = [
        { email: 'patient1@example.com', full_name: 'John Doe', role: 'patient', phone: '+91 98765 43210' },
        { email: 'patient2@example.com', full_name: 'Jane Smith', role: 'patient', phone: '+91 98765 43211' },
        { email: 'patient3@example.com', full_name: 'Robert Johnson', role: 'patient', phone: '+91 98765 43212' },
        { email: 'patient4@example.com', full_name: 'Emily Davis', role: 'patient', phone: '+91 98765 43213' },
        { email: 'patient5@example.com', full_name: 'Michael Wilson', role: 'patient', phone: '+91 98765 43214' },
      ];

      for (const patient of samplePatients) {
        const { error } = await supabase.from('profiles').insert(patient);
        if (error && error.code !== '23505') { // 23505 is unique violation
          console.log('⚠️  Could not create patient:', patient.email, error.message);
        }
      }

      // Fetch again
      const { data: newPatients } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['patient', 'citizen'])
        .limit(15);
      
      patients.push(...(newPatients || []));
    }

    console.log(`✅ Found ${patients.length} patients\n`);

    // Get a doctor and nurse
    const { data: doctor } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['doctor', 'admin'])
      .limit(1)
      .single();

    const { data: nurse } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['nurse', 'staff', 'admin'])
      .limit(1)
      .single();

    console.log(`👨‍⚕️ Assigned Doctor: ${doctor?.full_name || 'Not found'}`);
    console.log(`👩‍⚕️ Assigned Nurse: ${nurse?.full_name || 'Not found'}\n`);

    // Create medical records
    const records = [];
    let criticalCount = 0;

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const daysAgo = i + 1;
      const conditionIndex = i % conditions.length;
      const isCritical = conditions[conditionIndex] === 'critical';
      
      if (isCritical) criticalCount++;

      const record = {
        patient_id: patient.id,
        admission_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        department: departments[i % departments.length],
        condition_status: conditions[conditionIndex],
        chief_complaint: complaints[i % complaints.length],
        diagnosis: diagnoses[i % diagnoses.length],
        treatment_plan: treatments[i % treatments.length],
        assigned_doctor_id: doctor?.id || null,
        assigned_nurse_id: nurse?.id || null,
        critical_alert: isCritical,
        vitals: {
          heart_rate: 60 + (i * 5) % 40,
          blood_pressure: `${100 + (i * 10) % 60}/${60 + (i * 5) % 40}`,
          temperature: 36.5 + (i * 0.3) % 3.5,
          oxygen_saturation: 90 + (i * 2) % 10,
          respiratory_rate: 12 + (i * 2) % 12,
          last_updated: new Date().toISOString()
        },
        notes: `Patient admitted through ${i % 3 === 0 ? 'Emergency' : i % 3 === 1 ? 'OPD' : 'Referral'}. ${isCritical ? '⚠️ CRITICAL - Requires immediate attention!' : 'Regular monitoring in progress.'}`
      };

      records.push(record);
    }

    // Insert records
    console.log(`📝 Inserting ${records.length} patient medical records...`);
    const { data: insertedRecords, error: insertError } = await supabase
      .from('patient_medical_records')
      .insert(records)
      .select();

    if (insertError) {
      console.error('❌ Error inserting records:', insertError);
      return;
    }

    console.log(`\n✅ Successfully created ${insertedRecords.length} patient medical records!`);
    console.log(`   - ${criticalCount} critical cases`);
    console.log(`   - ${records.length - criticalCount} non-critical cases`);
    console.log(`   - ${departments.length} departments covered\n`);

    // Display summary
    console.log('📊 Records Summary:');
    const statusCount = {};
    records.forEach(r => {
      statusCount[r.condition_status] = (statusCount[r.condition_status] || 0) + 1;
    });
    
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n🎉 Patient records seeding completed successfully!');
    console.log('💡 You can now view these records in the Admin Dashboard > Patient Monitoring Panel\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the seeder
seedPatientRecords();
