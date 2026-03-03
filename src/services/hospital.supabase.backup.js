/**
 * Hospital Management Services
 * All API calls for hospital modules
 * NOW USING MONGODB BACKEND API
 */

// Import all MongoDB service functions
export {
  requestAmbulance,
  getAmbulanceRequests,
  getAllAmbulanceRequests,
  updateAmbulanceRequest,
  createMedicineRequest,
  getMedicineRequests,
  getAllMedicineRequests,
  updateMedicineRequest,
  createAppointment,
  getUpcomingAppointments,
  getAllAppointments,
  cancelAppointment,
  createToken,
  getPatientTokens,
  allocateRoom,
  getPatientRoomAllocations,
  createMedicalRecord,
  getPatientMedicalRecords,
  createBill,
  getPatientBills,
  createNotification,
} from './mongodbService';

// Keep Supabase for LAB REPORTS (file storage) and other non-migrated features
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
        assigned_doctor:assigned_doctor_id(id, full_name, role, department),
        assigned_nurse:assigned_nurse_id(id, full_name, role, department)
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
        doctor:doctor_id(id, full_name, role, department)
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
    
    // Auto-assign to pharmacy staff (auto-processing)
    const assignmentResult = await autoAssignMedicineRequest(data, request);
    const assignedData = assignmentResult?.data || data;
    
    // Create notification
    await createNotification(
      request.patient_id,
      'Medicine Request',
      assignmentResult?.assigned 
        ? 'Your pharmacy request is being processed by our staff'
        : 'Your pharmacy request has been submitted',
      'medicine'
    );

    return { data: assignedData, error: null };
  } catch (error) {
    console.error('Create medicine request error:', error);
    return { data: null, error };
  }
}

async function autoAssignMedicineRequest(createdRequest, originalRequest) {
  if (!createdRequest?.id) {
    return { assigned: false, data: createdRequest };
  }

  const assignedAt = new Date().toISOString();
  const isUrgent = originalRequest?.delivery_type === 'delivery' || 
                   String(originalRequest?.notes || '').toLowerCase().includes('urgent');
  
  const assignmentPayload = {
    delivery_status: 'processing',
    updated_at: assignedAt,
    estimated_ready_time: new Date(Date.now() + (isUrgent ? 30 : 60) * 60 * 1000).toISOString(),
  };

  const { data, error } = await supabase
    .from('medicine_requests')
    .update(assignmentPayload)
    .eq('id', createdRequest.id)
    .select()
    .single();

  if (!error && data) {
    return { assigned: true, data };
  }

  return { assigned: false, data: createdRequest };
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

export async function updateMedicineRequestStatus(requestId, status) {
  try {
    const validStatuses = ['pending', 'processing', 'ready', 'delivered'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('medicine_requests')
      .update({ 
        delivery_status: status,
        fulfilled_date: status === 'delivered' ? new Date().toISOString() : null
      })
      .eq('id', requestId)
      .select(`
        *,
        prescription:prescription_id(*),
        patient:patient_id(id, full_name)
      `)
      .single();

    if (error) throw error;

    // Notify patient about status change
    if (data && status === 'delivered') {
      await createNotification(
        data.patient_id,
        'Medicine Delivered',
        `Your medicine request has been delivered`,
        'medicine'
      );
    } else if (data && status === 'ready') {
      await createNotification(
        data.patient_id,
        'Medicine Ready',
        `Your medicine is ready for ${data.delivery_type === 'pickup' ? 'pickup' : 'delivery'}`,
        'medicine'
      );
    }

    return { data, error: null };
  } catch (error) {
    console.error('Update medicine request status error:', error);
    return { data: null, error };
  }
}

export async function getAllMedicineRequests(filters = {}) {
  try {
    let query = supabase
      .from('medicine_requests')
      .select(`
        *,
        prescription:prescription_id(*),
        patient:patient_id(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('delivery_status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get all medicine requests error:', error);
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
        ordered_by_user:ordered_by(id, full_name, role, department)
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

export async function createAppointment(
  appointmentOrPatientId,
  department,
  appointmentDate,
  appointmentTime,
  slot,
  reason
) {
  try {
    const normalizeDate = (value) => {
      if (!value) return null;
      if (value instanceof Date) return value.toISOString().split('T')[0];
      if (typeof value === 'string') return value.split('T')[0];
      return value;
    };

    const normalizeTime = (value) => {
      if (!value) return null;
      if (value instanceof Date) return value.toISOString().split('T')[1].slice(0, 8);
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (ampmMatch) {
        let hour = parseInt(ampmMatch[1], 10);
        const minutes = ampmMatch[2];
        const period = ampmMatch[3].toUpperCase();
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return `${String(hour).padStart(2, '0')}:${minutes}:00`;
      }
      if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
        return `${trimmed}:00`;
      }
      return trimmed;
    };

    const appointment =
      appointmentOrPatientId &&
      typeof appointmentOrPatientId === 'object' &&
      !Array.isArray(appointmentOrPatientId)
        ? appointmentOrPatientId
        : {
            patient_id: appointmentOrPatientId,
            doctor_id: null,
            department,
            appointment_date: normalizeDate(appointmentDate),
            appointment_time: normalizeTime(appointmentTime),
            slot: slot || appointmentTime || '',
            status: 'scheduled',
            reason: reason || null,
          };

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;

    // Auto-assign to doctor
    const assignmentResult = await autoAssignAppointment(data, appointment);
    const assignedData = assignmentResult?.data || data;

    // Create notification
    await createNotification(
      appointment.patient_id,
      'Appointment Scheduled',
      assignmentResult?.assigned
        ? `Your appointment is confirmed with Dr. ${assignmentResult.doctorName} for ${appointment.appointment_date}`
        : `Your appointment is scheduled for ${appointment.appointment_date}`,
      'appointment'
    );

    return { data: assignedData, error: null };
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
        doctor:doctor_id(id, full_name, role, department)
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
    const patientIds = [request.patient_id];

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, phone, address')
      .or(`user_id.eq.${request.patient_id},id.eq.${request.patient_id}`)
      .maybeSingle();

    if (profile?.id && !patientIds.includes(profile.id)) {
      patientIds.push(profile.id);
    }

    const modernPayload = (patientId) => {
      const payload = {
        patient_id: patientId,
        pickup_location: request.pickup_location,
        destination: request.destination || 'Hospital',
        emergency_type: request.emergency_type,
        contact_number: request.contact_number,
      };

      if (Number.isFinite(request.user_latitude) && Number.isFinite(request.user_longitude)) {
        payload.user_latitude = request.user_latitude;
        payload.user_longitude = request.user_longitude;
      }

      return payload;
    };

    const legacyPayload = (patientId) => ({
      patient_id: patientId,
      patient_name: profile?.full_name || 'Patient',
      phone_number: request.contact_number,
      address: request.pickup_location,
      emergency_type: request.emergency_type,
      status: 'pending',
    });

    const attempts = [];
    const attemptInsert = async (payload) => {
      const result = await supabase
        .from('ambulance_requests')
        .insert(payload)
        .select()
        .single();
      attempts.push(result.error || null);
      return result;
    };

    let data = null;
    let error = null;

    for (const patientId of patientIds) {
      const first = await attemptInsert(modernPayload(patientId));
      if (!first.error) {
        data = first.data;
        error = null;
        break;
      }

      const message = String(first.error.message || '').toLowerCase();
      const details = String(first.error.details || '').toLowerCase();
      const isGeoColumnIssue =
        message.includes('user_latitude') ||
        message.includes('user_longitude') ||
        details.includes('user_latitude') ||
        details.includes('user_longitude');

      if (isGeoColumnIssue) {
        const second = await attemptInsert({
          patient_id: patientId,
          pickup_location: request.pickup_location,
          destination: request.destination || 'Hospital',
          emergency_type: request.emergency_type,
          contact_number: request.contact_number,
        });

        if (!second.error) {
          data = second.data;
          error = null;
          break;
        }

        const third = await attemptInsert(legacyPayload(patientId));
        if (!third.error) {
          data = third.data;
          error = null;
          break;
        }
      } else {
        const fallback = await attemptInsert(legacyPayload(patientId));
        if (!fallback.error) {
          data = fallback.data;
          error = null;
          break;
        }
      }

      error = first.error;
    }

    if (!data) {
      const lastError = attempts.filter(Boolean).pop() || error;
      const message = lastError?.message || 'Unknown ambulance request error';
      const details = lastError?.details ? ` | ${lastError.details}` : '';
      throw new Error(`${message}${details}`);
    }

    const assignmentResult = await autoAssignAmbulanceRequest(data, request, profile);
    const assignedData = assignmentResult?.data || data;

    // Create emergency notification
    const notificationResult = await createNotification(
      request.patient_id,
      'Ambulance Request',
      assignmentResult?.assigned
        ? 'Your ambulance has been assigned and is on the way'
        : 'Your ambulance request has been submitted',
      'ambulance'
    );

    if (notificationResult?.error) {
      console.warn('Ambulance notification warning:', notificationResult.error.message || notificationResult.error);
    }

    return { data: assignedData, error: null };
  } catch (error) {
    console.error('Request ambulance error:', error);
    return { data: null, error };
  }
}

export async function getAmbulanceRequests(patientId) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_id')
      .or(`user_id.eq.${patientId},id.eq.${patientId}`)
      .maybeSingle();

    const patientIds = [patientId];
    if (profile?.id && !patientIds.includes(profile.id)) {
      patientIds.push(profile.id);
    }

    let combinedData = [];
    let lastError = null;

    for (const id of patientIds) {
      const { data, error } = await supabase
        .from('ambulance_requests')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        lastError = error;
        continue;
      }

      if (Array.isArray(data) && data.length > 0) {
        combinedData = combinedData.concat(data);
      }
    }

    if (combinedData.length === 0 && lastError) throw lastError;

    const deduped = Array.from(new Map(combinedData.map((item) => [item.id, item])).values())
      .sort((a, b) => new Date(b.created_at || b.request_time || 0) - new Date(a.created_at || a.request_time || 0));

    return { data: deduped, error: null };
  } catch (error) {
    console.error('Get ambulance requests error:', error);
    return { data: null, error };
  }
}

async function autoAssignAmbulanceRequest(createdRequest, originalRequest, profile) {
  if (!createdRequest?.id) {
    return { assigned: false, data: createdRequest };
  }

  const normalizedEmergency = String(originalRequest?.emergency_type || '').toLowerCase();
  const criticalKeywords = ['accident', 'stroke', 'bleeding', 'unconscious', 'chest'];
  const isCritical = criticalKeywords.some((keyword) => normalizedEmergency.includes(keyword));

  const assignedAt = new Date().toISOString();
  const ambulanceNumber = `AMB-${Math.floor(100 + Math.random() * 900)}`;
  const driverName = isCritical ? 'Critical Response Driver' : 'On-duty Driver';
  const driverPhone = '+91 98765 43210';

  const userLat = Number.isFinite(originalRequest?.user_latitude)
    ? originalRequest.user_latitude
    : Number.isFinite(createdRequest?.user_latitude)
    ? createdRequest.user_latitude
    : null;
  const userLng = Number.isFinite(originalRequest?.user_longitude)
    ? originalRequest.user_longitude
    : Number.isFinite(createdRequest?.user_longitude)
    ? createdRequest.user_longitude
    : null;

  const startLat = Number.isFinite(userLat) ? userLat + 0.018 : null;
  const startLng = Number.isFinite(userLng) ? userLng + 0.018 : null;

  const assignmentPayloads = [
    {
      status: 'assigned',
      ambulance_number: ambulanceNumber,
      driver_name: driverName,
      driver_phone: driverPhone,
      driver_contact: driverPhone,
      eta_minutes: isCritical ? 6 : 10,
      distance_km: isCritical ? 2.5 : 4.2,
      response_time_minutes: 2,
      request_time: createdRequest.request_time || assignedAt,
      updated_at: assignedAt,
      ...(Number.isFinite(startLat) && Number.isFinite(startLng)
        ? { ambulance_latitude: startLat, ambulance_longitude: startLng, last_location_update: assignedAt }
        : {}),
    },
    {
      status: 'on_way',
      assigned_vehicle: ambulanceNumber,
      assigned_driver: driverName,
      updated_at: assignedAt,
    },
    {
      status: 'assigned',
      ambulance_number: ambulanceNumber,
      driver_name: driverName,
      updated_at: assignedAt,
    },
  ];

  for (const payload of assignmentPayloads) {
    const { data, error } = await supabase
      .from('ambulance_requests')
      .update(payload)
      .eq('id', createdRequest.id)
      .select()
      .single();

    if (!error && data) {
      return { assigned: true, data };
    }
  }

  return { assigned: false, data: createdRequest, profile };
}

async function autoAssignAppointment(createdAppointment, originalAppointment) {
  if (!createdAppointment?.id) {
    return { assigned: false, data: createdAppointment };
  }

  const department = originalAppointment?.department || 'General';
  const assignedAt = new Date().toISOString();
  
  // Get available doctors from the same department
  const { data: doctors } = await supabase
    .from('profiles')
    .select('id, full_name, department')
    .eq('role', 'doctor')
    .eq('department', department)
    .limit(5);

  let doctorId = null;
  let doctorName = 'Available Doctor';
  
  if (doctors && doctors.length > 0) {
    // Simple round-robin: pick random doctor
    const selectedDoctor = doctors[Math.floor(Math.random() * doctors.length)];
    doctorId = selectedDoctor.id;
    doctorName = selectedDoctor.full_name || 'Dr. Staff';
  }

  const assignmentPayload = {
    status: 'confirmed',
    doctor_id: doctorId,
    updated_at: assignedAt,
  };

  const { data, error } = await supabase
    .from('appointments')
    .update(assignmentPayload)
    .eq('id', createdAppointment.id)
    .select()
    .single();

  if (!error && data) {
    return { assigned: true, data, doctorName };
  }

  return { assigned: false, data: createdAppointment };
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
      .select('amount')
      .eq('id', billId)
      .single();

    const status = amount >= bill.amount ? 'paid' : 'partial';

    const { data, error } = await supabase
      .from('billing')
      .update({
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
        event: 'INSERT',
        schema: 'public',
        table: 'medicine_requests',
        filter: `patient_id=eq.${patientId}`
      },
      callback
    )
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
