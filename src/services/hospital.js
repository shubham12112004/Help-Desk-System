/**
 * Hospital Management Services
 * Hybrid architecture: MongoDB for data + Supabase for auth & storage
 */

// Import MongoDB backend API functions (already migrated)
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

// Keep Supabase for storage and realtime features
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from './apiBaseUrl';

// =====================================================
// ADDITIONAL HELPER FUNCTIONS (Supabase-based)
// =====================================================

export async function getCurrentToken(department) {
  try {
    const response = await fetch(`${API_BASE_URL}/hospital/tokens/current?department=${department}`, {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// =====================================================
// PRESCRIPTIONS
// =====================================================

export async function getActivePrescriptions(patientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/hospital/prescriptions?patient_id=${patientId}&status=active`, {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });
    const data = await response.json();
    return { data: data.data || [], error: null };
  } catch (error) {
    console.error('Get prescriptions error:', error);
    return { data: [], error };
  }
}

export async function updateMedicineRequestStatus(requestId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/medicine/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Update medicine request error:', error);
    return { data: null, error };
  }
}

export async function createRoomAllocation(allocation) {
  // Use the allocateRoom function from mongodbService
  return allocateRoom(allocation);
}

// =====================================================
// LAB REPORTS (Still using Supabase Storage)
// =====================================================

export async function getLabReports(patientId) {
  try {
    const { data, error } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get lab reports error:', error);
    return { data: null, error };
  }
}

export async function uploadLabReport(reportId, file) {
  try {
    const fileName = `${reportId}/${Date.now()}_${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('ticket-attachments')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('lab_reports')
      .update({ file_url: publicUrlData.publicUrl })
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
// PAYMENT & BILLING HELPERS
// =====================================================

export async function makePayment(billId, amount, paymentMethod) {
  try {
    const response = await fetch(`${API_BASE_URL}/hospital/bills/${billId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ amount, payment_method: paymentMethod }),
    });
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Make payment error:', error);
    return { data: null, error };
  }
}

// =====================================================
// NOTIFICATIONS API (Already in MongoDB)
// =====================================================

export async function getNotifications(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });
    const data = await response.json();
    return { data: data.data || [], error: null };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { data: [], error };
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Mark notification read error:', error);
    return { data: null, error };
  }
}

export async function markAllNotificationsRead(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return { data: null, error };
  }
}

// =====================================================
// AI CHAT SYSTEM (Still using Supabase)
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
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get chats error:', error);
    return { data: [], error };
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
    return { data: [], error };
  }
}

export async function sendMessage(chatId, role, content) {
  try {
    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        chat_id: chatId,
        role,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Send message error:', error);
    return { data: null, error };
  }
}

// =====================================================
// REALTIME SUBSCRIPTIONS (Using Supabase Realtime)
// =====================================================

export function subscribeToTokenQueue(department, callback) {
  const channel = supabase
    .channel(`token-queue-${department}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'token_queue',
        filter: `department=eq.${department}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

export function subscribeToNotifications(userId, callback) {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

export function subscribeToMedicineRequests(patientId, callback) {
  const channel = supabase
    .channel(`medicine-${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'medicine_requests',
        filter: `patient_id=eq.${patientId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}
