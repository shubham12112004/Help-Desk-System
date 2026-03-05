/**
 * MongoDB Backend API Service
 * Replaces Supabase database calls with Backend MongoDB API
 */

import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from './apiBaseUrl';

// API client with authentication
class MongoDBAPI {
  static async request(endpoint, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('User not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// =====================================================
// AMBULANCE SERVICES
// =====================================================

export async function requestAmbulance(request) {
  try {
    const response = await MongoDBAPI.post('/ambulance', {
      pickup_location: request.pickup_location,
      destination: request.destination || 'Hospital',
      emergency_type: request.emergency_type,
      contact_number: request.contact_number,
      user_latitude: request.user_latitude,
      user_longitude: request.user_longitude,
    });

    return { data: response.data, error: null };
  } catch (error) {
    console.error('Request ambulance error:', error);
    return { data: null, error };
  }
}

export async function getAmbulanceRequests(patientId) {
  try {
    const response = await MongoDBAPI.get('/ambulance/my-requests');
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get ambulance requests error:', error);
    return { data: [], error };
  }
}

export async function getAllAmbulanceRequests(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/ambulance?${queryParams}` : '/ambulance';
    const response = await MongoDBAPI.get(endpoint);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get all ambulance requests error:', error);
    return { data: [], error };
  }
}

export async function updateAmbulanceRequest(id, updates) {
  try {
    const response = await MongoDBAPI.put(`/ambulance/${id}`, updates);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Update ambulance request error:', error);
    return { data: null, error };
  }
}

// =====================================================
// MEDICINE SERVICES
// =====================================================

export async function createMedicineRequest(request) {
  try {
    const response = await MongoDBAPI.post('/medicine', request);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Create medicine request error:', error);
    return { data: null, error };
  }
}

export async function getMedicineRequests(patientId) {
  try {
    const response = await MongoDBAPI.get('/medicine/my-requests');
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get medicine requests error:', error);
    return { data: [], error };
  }
}

export async function getAllMedicineRequests(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/medicine?${queryParams}` : '/medicine';
    const response = await MongoDBAPI.get(endpoint);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get all medicine requests error:', error);
    return { data: [], error };
  }
}

export async function updateMedicineRequest(id, updates) {
  try {
    const response = await MongoDBAPI.put(`/medicine/${id}`, updates);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Update medicine request error:', error);
    return { data: null, error };
  }
}

// =====================================================
// APPOINTMENT SERVICES
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
    const response = await MongoDBAPI.post('/appointments', {
      department,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      time_slot: slot,
      reason,
    });

    return { data: response.data, error: null };
  } catch (error) {
    console.error('Create appointment error:', error);
    return { data: null, error };
  }
}

export async function getUpcomingAppointments(patientId) {
  try {
    const response = await MongoDBAPI.get('/appointments/my-appointments');
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get appointments error:', error);
    return { data: [], error };
  }
}

export async function getAllAppointments(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/appointments?${queryParams}` : '/appointments';
    const response = await MongoDBAPI.get(endpoint);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get all appointments error:', error);
    return { data: [], error };
  }
}

export async function cancelAppointment(appointmentId) {
  try {
    const response = await MongoDBAPI.delete(`/appointments/${appointmentId}`);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return { data: null, error };
  }
}

// =====================================================
// TOKEN QUEUE SERVICES
// =====================================================

export async function createToken(patientId, department) {
  try {
    const response = await MongoDBAPI.post('/hospital/tokens', { department });
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Create token error:', error);
    return { data: null, error };
  }
}

export async function getPatientTokens(patientId) {
  try {
    const response = await MongoDBAPI.get('/hospital/tokens');
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get tokens error:', error);
    return { data: [], error };
  }
}

// =====================================================
// ROOM ALLOCATION SERVICES
// =====================================================

export async function allocateRoom(allocation) {
  try {
    const response = await MongoDBAPI.post('/hospital/rooms', allocation);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Allocate room error:', error);
    return { data: null, error };
  }
}

export async function getPatientRoomAllocations(patientId) {
  try {
    const response = await MongoDBAPI.get('/hospital/rooms');
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get room allocations error:', error);
    return { data: [], error };
  }
}

// =====================================================
// MEDICAL RECORDS SERVICES
// =====================================================

export async function createMedicalRecord(record) {
  try {
    const response = await MongoDBAPI.post('/hospital/records', record);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Create medical record error:', error);
    return { data: null, error };
  }
}

export async function getPatientMedicalRecords(patientId, filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/hospital/records?${queryParams}` : '/hospital/records';
    const response = await MongoDBAPI.get(endpoint);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get medical records error:', error);
    return { data: [], error };
  }
}

// =====================================================
// BILLING SERVICES
// =====================================================

export async function createBill(bill) {
  try {
    const response = await MongoDBAPI.post('/hospital/bills', bill);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Create bill error:', error);
    return { data: null, error };
  }
}

export async function getPatientBills(patientId, filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/hospital/bills?${queryParams}` : '/hospital/bills';
    const response = await MongoDBAPI.get(endpoint);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Get bills error:', error);
    return { data: [], error };
  }
}

// =====================================================
// NOTIFICATION SERVICES (Keep using existing)
// =====================================================

export async function createNotification(userId, title, message, type, actionUrl) {
  try {
    // Use MongoDB API
    const response = await MongoDBAPI.post('/notifications', {
      type,
      message: `${title}: ${message}`,
    });
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Create notification error:', error);
    return { data: null, error };
  }
}

// Export all functions
export default MongoDBAPI;
