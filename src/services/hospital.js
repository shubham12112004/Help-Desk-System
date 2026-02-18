/**
 * Hospital Management Services
 * All API calls for hospital modules
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TOKEN QUEUE SERVICES
// =====================================================

export async function createToken(patientId, department) {
  try {
    // Get last token number for the day and department
    const today = new Date().toISOString().split('T')[0];
    const { data: lastToken } = await supabase
      .from('token_queue')
      .select('token_number')
      .eq('department', department)
      .gte('issue_date', today)
      .order('token_number', { ascending: false })
      .limit(1)
      .single();

    const tokenNumber = (lastToken?.token_number || 0) + 1;

    const { data, error } = await supabase
      .from('token_queue')
      .insert({
        patient_id: patientId,
        department,
        token_number: tokenNumber,
        status: 'waiting',
        estimated_wait_minutes: tokenNumber * 10 // Rough estimate
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create token error:', error);
    return { data: null, error };
  }
}

export async function getPatientTokens(patientId) {
  try {
    const { data, error } = await supabase
      .from('token_queue')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get patient tokens error:', error);
    return { data: null, error };
  }
}

export async function getCurrentToken(department) {
  try {
    const { data, error } = await supabase
      .from('token_queue')
      .select('*')
      .eq('department', department)
      .eq('status', 'in-progress')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get current token error:', error);
    return { data: null, error };
  }
}

// =====================================================
// ROOM ALLOCATION SERVICES
// =====================================================

export async function getPatientRoom(patientId) {
  try {
    const { data, error } = await supabase
      .from('room_allocations')
      .select(`
        *,
        assigned_doctor:assigned_doctor_id(id, user_metadata),
        assigned_nurse:assigned_nurse_id(id, user_metadata)
      `)
      .eq('patient_id', patientId)
      .eq('status', 'allocated')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get patient room error:', error);
    return { data: null, error };
  }
}

export async function createRoomAllocation(allocation) {
  try {
    const { data, error } = await supabase
      .from('room_allocations')
      .insert(allocation)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create room allocation error:', error);
    return { data: null, error };
  }
}

// =====================================================
// PRESCRIPTION & MEDICINE SERVICES
// =====================================================

export async function getActivePrescriptions(patientId) {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctor_id(id, user_metadata)
      `)
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('prescribed_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get prescriptions error:', error);
    return { data: null, error };
  }
}

export async function createMedicineRequest(request) {
  try {
    const { data, error } = await supabase
      .from('medicine_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;
    
    // Create notification
    await createNotification(
      request.patient_id,
      'Medicine Request',
      'Your pharmacy request has been submitted',
      'system_alert'
    );

    return { data, error: null };
  } catch (error) {
    console.error('Create medicine request error:', error);
    return { data: null, error };
  }
}

export async function getMedicineRequests(patientId) {
  try {
    const { data, error } = await supabase
      .from('medicine_requests')
      .select(`
        *,
        prescription:prescription_id(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get medicine requests error:', error);
    return { data: null, error };
  }
}

// =====================================================
// LAB REPORTS SERVICES
// =====================================================

export async function getLabReports(patientId) {
  try {
    const { data, error } = await supabase
      .from('lab_reports')
      .select(`
        *,
        ordered_by_user:ordered_by(id, user_metadata)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get lab reports error:', error);
    return { data: null, error };
  }
}

export async function uploadLabReport(reportId, file) {
  try {
    const fileName = `lab-reports/${reportId}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('ticket-attachments')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('lab_reports')
      .update({ 
        report_file_url: urlData.publicUrl,
        status: 'completed',
        result_date: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Upload lab report error:', error);
    return { data: null, error };
  }
}

// =====================================================
// APPOINTMENTS SERVICES
// =====================================================

export async function createAppointment(appointment) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;

    // Create notification
    await createNotification(
      appointment.patient_id,
      'Appointment Scheduled',
      `Your appointment is scheduled for ${appointment.appointment_date}`,
      'appointment_scheduled'
    );

    return { data, error: null };
  } catch (error) {
    console.error('Create appointment error:', error);
    return { data: null, error };
  }
}

export async function getUpcomingAppointments(patientId) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctor_id(id, user_metadata)
      `)
      .eq('patient_id', patientId)
      .in('status', ['scheduled', 'confirmed'])
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get appointments error:', error);
    return { data: null, error };
  }
}

export async function cancelAppointment(appointmentId) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
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

// =====================================================
// AMBULANCE SERVICES
// =====================================================

export async function requestAmbulance(request) {
  try {
    const { data, error } = await supabase
      .from('ambulance_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;

    // Create emergency notification
    await createNotification(
      request.patient_id,
      'Ambulance Request',
      'Your ambulance request has been submitted',
      'system_alert'
    );

    return { data, error: null };
  } catch (error) {
    console.error('Request ambulance error:', error);
    return { data: null, error };
  }
}

export async function getAmbulanceRequests(patientId) {
  try {
    const { data, error } = await supabase
      .from('ambulance_requests')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get ambulance requests error:', error);
    return { data: null, error };
  }
}

// =====================================================
// BILLING SERVICES
// =====================================================

export async function getPatientBills(patientId) {
  try {
    const { data, error } = await supabase
      .from('billing')
      .select('*')
      .eq('patient_id', patientId)
      .order('bill_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get bills error:', error);
    return { data: null, error };
  }
}

export async function makePayment(billId, amount, paymentMethod) {
  try {
    const { data: bill } = await supabase
      .from('billing')
      .select('amount, paid_amount')
      .eq('id', billId)
      .single();

    const newPaidAmount = (bill.paid_amount || 0) + amount;
    const status = newPaidAmount >= bill.amount ? 'paid' : 'partial';

    const { data, error } = await supabase
      .from('billing')
      .update({
        paid_amount: newPaidAmount,
        status,
        payment_method: paymentMethod
      })
      .eq('id', billId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Make payment error:', error);
    return { data: null, error };
  }
}

// =====================================================
// NOTIFICATIONS SERVICES
// =====================================================

export async function getNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { data: null, error };
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Mark notification read error:', error);
    return { data: null, error };
  }
}

export async function markAllNotificationsRead(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return { error };
  }
}

export async function createNotification(userId, title, message, type, actionUrl = null) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create notification error:', error);
    return { data: null, error };
  }
}

// =====================================================
// AI CHATBOT SERVICES
// =====================================================

export async function createChat(userId, title = 'New Chat') {
  try {
    const { data, error } = await supabase
      .from('ai_chats')
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create chat error:', error);
    return { data: null, error };
  }
}

export async function getChats(userId) {
  try {
    const { data, error } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get chats error:', error);
    return { data: null, error };
  }
}

export async function getChatMessages(chatId) {
  try {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get chat messages error:', error);
    return { data: null, error };
  }
}

export async function sendMessage(chatId, role, content) {
  try {
    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        chat_id: chatId,
        role,
        content
      })
      .select()
      .single();

    if (error) throw error;

    // Update chat updated_at
    await supabase
      .from('ai_chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return { data, error: null };
  } catch (error) {
    console.error('Send message error:', error);
    return { data: null, error };
  }
}

// =====================================================
// REALTIME SUBSCRIPTIONS
// =====================================================

export function subscribeToTokenQueue(department, callback) {
  return supabase
    .channel(`token-queue-${department}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'token_queue',
        filter: `department=eq.${department}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToNotifications(userId, callback) {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToMedicineRequests(patientId, callback) {
  return supabase
    .channel(`medicine-${patientId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'medicine_requests',
        filter: `patient_id=eq.${patientId}`
      },
      callback
    )
    .subscribe();
}
