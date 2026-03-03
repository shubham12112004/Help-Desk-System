/**
 * Enhanced Hospital Services
 * Extended services for advanced staff dashboard features
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// PATIENT MONITORING SERVICES
// =====================================================

export async function getAdmittedPatients(department = null, filter = 'all') {
  try {
    let query = supabase
      .from('patient_medical_records')
      .select(`
        id,
        patient_id,
        admission_date,
        department,
        condition_status,
        chief_complaint,
        assigned_doctor_id,
        critical_alert,
        vitals,
        patient:patient_id(id, full_name, email, phone, age, gender)
      `)
      .is('discharge_date', null);

    if (filter !== 'all') {
      query = query.eq('condition_status', filter);
    }

    if (department) {
      query = query.eq('department', department);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get admitted patients error:', error);
    return { data: null, error };
  }
}

export async function getCriticalCases(department = null) {
  try {
    let query = supabase
      .from('patient_medical_records')
      .select(`
        id,
        patient_id,
        admission_date,
        department,
        condition_status,
        chief_complaint,
        assigned_doctor_id,
        critical_alert,
        vitals,
        patient:patient_id(id, full_name, email, phone, age, gender)
      `)
      .eq('condition_status', 'critical')
      .is('discharge_date', null);

    if (department) {
      query = query.eq('department', department);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get critical cases error:', error);
    return { data: null, error };
  }
}

export async function getPatientMedicalRecord(patientId) {
  try {
    const { data, error } = await supabase
      .from('patient_medical_records')
      .select(`
        *,
        patient:patient_id(id, full_name, email, phone, age, gender, role, department),
        assigned_doctor:assigned_doctor_id(id, full_name, role, department),
        assigned_nurse:assigned_nurse_id(id, full_name, role, department)
      `)
      .eq('patient_id', patientId)
      .is('discharge_date', null)
      .order('admission_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get patient medical record error:', error);
    return { data: null, error };
  }
}

export async function updatePatientVitals(patientId, vitals) {
  try {
    // Get current medical record
    const { data: record } = await supabase
      .from('patient_medical_records')
      .select('id')
      .eq('patient_id', patientId)
      .is('discharge_date', null)
      .single();

    if (!record) {
      throw new Error('No active medical record found for patient');
    }

    const { data, error } = await supabase
      .from('patient_medical_records')
      .update({
        vitals: vitals,
        updated_at: new Date().toISOString()
      })
      .eq('id', record.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update vitals error:', error);
    return { data: null, error };
  }
}

// =====================================================
// ADVANCED TOKEN SYSTEM with OTP
// =====================================================

export async function generateOTPToken(patientId, department) {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create token with OTP
    const { data, error } = await supabase
      .from('token_queue')
      .insert({
        patient_id: patientId,
        department: department,
        status: 'waiting',
        otp_code: otp,
        otp_expiry: expiryTime.toISOString(),
        otp_verified: false,
        otp_attempts: 0
      })
      .select()
      .single();

    if (error) throw error;

    // In production, send OTP via SMS/Email
    console.log(`OTP for patient ${patientId}: ${otp} (Expires in 10 minutes)`);

    return { data, otp, expiryTime, error: null };
  } catch (error) {
    console.error('Generate OTP token error:', error);
    return { data: null, otp: null, error };
  }
}

export async function verifyOTPToken(tokenId, otp) {
  try {
    // Get token
    const { data: token, error: getError } = await supabase
      .from('token_queue')
      .select('*')
      .eq('id', tokenId)
      .single();

    if (getError) throw getError;

    // Check if OTP is expired
    if (new Date(token.otp_expiry) < new Date()) {
      throw new Error('OTP has expired');
    }

    // Check if OTP matches
    if (token.otp_code !== otp) {
      // Increment attempts
      const { error: updateError } = await supabase
        .from('token_queue')
        .update({ otp_attempts: (token.otp_attempts || 0) + 1 })
        .eq('id', tokenId);

      if (updateError) throw updateError;

      throw new Error('Invalid OTP');
    }

    // Verify OTP
    const { data, error } = await supabase
      .from('token_queue')
      .update({
        otp_verified: true,
        status: 'verified'
      })
      .eq('id', tokenId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { data: null, error };
  }
}

export async function startConsultation(tokenId) {
  try {
    const { data, error } = await supabase
      .from('token_queue')
      .update({
        status: 'in-progress',
        consultation_start_time: new Date().toISOString()
      })
      .eq('id', tokenId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Start consultation error:', error);
    return { data: null, error };
  }
}

export async function completeConsultation(tokenId) {
  try {
    const { data, error } = await supabase
      .from('token_queue')
      .update({
        status: 'completed',
        consultation_end_time: new Date().toISOString()
      })
      .eq('id', tokenId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Complete consultation error:', error);
    return { data: null, error };
  }
}

// =====================================================
// APPOINTMENT MANAGEMENT (Staff Control)
// =====================================================

export async function getAppointmentsForApproval(status = 'pending') {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id(id, full_name, email, phone),
        doctor:doctor_id(id, full_name, department),
        department:department_id(id, name)
      `)
      .eq('approval_status', status)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get appointments for approval error:', error);
    return { data: null, error };
  }
}

export async function approveAppointment(appointmentId, staffId) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        approval_status: 'approved',
        approved_by: staffId,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Approve appointment error:', error);
    return { data: null, error };
  }
}

export async function rescheduleAppointment(appointmentId, newDate, newTime, reason) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        reschedule_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    return { data: null, error };
  }
}

export async function cancelAppointment(appointmentId, reason) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return { data: null, error };
  }
}

export async function checkDoubleBooking(doctorId, date, time, excludeAppointmentId = null) {
  try {
    let query = supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .neq('status', 'cancelled');

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { isDouble: (data?.length || 0) > 0, error: null };
  } catch (error) {
    console.error('Check double booking error:', error);
    return { isDouble: false, error };
  }
}

// =====================================================
// BILLING CONTROL
// =====================================================

export async function createBill(patientId, medicalRecordId, items, staffId) {
  try {
    // Generate bill number
    const billNumber = `BL-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      const lineTotal = item.totalPrice ?? item.total_price ?? 0;
      subtotal += lineTotal;
    });

    const taxAmount = subtotal * 0.05; // 5% tax
    const totalAmount = subtotal + taxAmount;

    const description = items
      .map(item => `${item.name || item.type || 'Item'} x${item.quantity || 1}`)
      .join(', ');

    // Create bill
    const { data: billData, error: billError } = await supabase
      .from('billing')
      .insert({
        bill_number: billNumber,
        patient_id: patientId,
        description: description || 'Hospital services',
        amount: totalAmount,
        status: 'pending',
        bill_date: new Date().toISOString()
      })
      .select()
      .single();

    if (billError) throw billError;

    return { data: billData, error: null };
  } catch (error) {
    console.error('Create bill error:', error);
    return { data: null, error };
  }
}

export async function applyInsuranceDiscount(billId, discountAmount) {
  try {
    // Get bill
    const { data: bill, error: getError } = await supabase
      .from('billing')
      .select('*')
      .eq('id', billId)
      .single();

    if (getError) throw getError;

    const newAmount = Math.max(0, (bill.amount || 0) - discountAmount);
    const status = newAmount === 0 ? 'paid' : (bill.status || 'pending');

    const { data, error } = await supabase
      .from('billing')
      .update({
        amount: newAmount,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', billId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Apply insurance discount error:', error);
    return { data: null, error };
  }
}

export async function getBillDetails(billId) {
  try {
    const { data: bill, error: billError } = await supabase
      .from('billing')
      .select(`
        *,
        patient:patient_id(id, full_name, email, phone)
      `)
      .eq('id', billId)
      .single();

    if (billError) throw billError;
    return { data: bill, error: null };
  } catch (error) {
    console.error('Get bill details error:', error);
    return { data: null, error };
  }
}

// =====================================================
// AMBULANCE MANAGEMENT
// =====================================================

export async function getActiveAmbulanceRequests() {
  try {
    const { data, error } = await supabase
      .from('ambulance_requests')
      .select(`
        *,
        driver:assigned_driver_id(id, full_name, phone),
        ambulance:assigned_ambulance_id(id, registration_number, capacity)
      `)
      .in('status', ['pending', 'assigned', 'in_transit'])
      .order('priority', { ascending: false })
      .order('request_time', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get active ambulance requests error:', error);
    return { data: null, error };
  }
}

export async function assignAmbulanceAndDriver(requestId, ambulanceId, driverId) {
  try {
    const { data, error } = await supabase
      .from('ambulance_requests')
      .update({
        assigned_ambulance_id: ambulanceId,
        assigned_driver_id: driverId,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // Update ambulance status
    await supabase
      .from('ambulances')
      .update({ status: 'on_call' })
      .eq('id', ambulanceId);

    return { data, error: null };
  } catch (error) {
    console.error('Assign ambulance error:', error);
    return { data: null, error };
  }
}

export async function updateAmbulanceLocation(ambulanceId, lat, lng) {
  try {
    const { data, error } = await supabase
      .from('ambulances')
      .update({
        location_lat: lat,
        location_lng: lng,
        updated_at: new Date().toISOString()
      })
      .eq('id', ambulanceId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update ambulance location error:', error);
    return { data: null, error };
  }
}

export async function updateAmbulanceRequestStatus(requestId, status) {
  try {
    const updateData = {
      status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'arrived') {
      updateData.arrival_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('ambulance_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update ambulance request status error:', error);
    return { data: null, error };
  }
}

export async function getAvailableAmbulances() {
  try {
    const { data, error } = await supabase
      .from('ambulances')
      .select('*')
      .eq('status', 'available')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get available ambulances error:', error);
    return { data: null, error };
  }
}

// =====================================================
// ANALYTICS
// =====================================================

export async function getDailyAnalytics(date) {
  try {
    const { data, error } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('analytics_date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get daily analytics error:', error);
    return { data: null, error };
  }
}

export async function getRevenueAnalytics(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('daily_analytics')
      .select('analytics_date, total_revenue')
      .gte('analytics_date', startDate)
      .lte('analytics_date', endDate)
      .order('analytics_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    return { data: null, error };
  }
}

export async function getAppointmentAnalytics(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('daily_analytics')
      .select('analytics_date, total_appointments, completed_appointments, cancelled_appointments')
      .gte('analytics_date', startDate)
      .lte('analytics_date', endDate)
      .order('analytics_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get appointment analytics error:', error);
    return { data: null, error };
  }
}

export async function getTicketResolutionStats(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('daily_analytics')
      .select('analytics_date, ticket_resolution_rate')
      .gte('analytics_date', startDate)
      .lte('analytics_date', endDate)
      .order('analytics_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get ticket resolution stats error:', error);
    return { data: null, error };
  }
}

export default {
  // Patient Monitoring
  getAdmittedPatients,
  getCriticalCases,
  getPatientMedicalRecord,
  updatePatientVitals,

  // Token System
  generateOTPToken,
  verifyOTPToken,
  startConsultation,
  completeConsultation,

  // Appointments
  getAppointmentsForApproval,
  approveAppointment,
  rescheduleAppointment,
  cancelAppointment,
  checkDoubleBooking,

  // Billing
  createBill,
  applyInsuranceDiscount,
  getBillDetails,

  // Ambulance
  getActiveAmbulanceRequests,
  assignAmbulanceAndDriver,
  updateAmbulanceLocation,
  updateAmbulanceRequestStatus,
  getAvailableAmbulances,

  // Analytics
  getDailyAnalytics,
  getRevenueAnalytics,
  getAppointmentAnalytics,
  getTicketResolutionStats
};
