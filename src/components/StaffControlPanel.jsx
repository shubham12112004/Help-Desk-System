import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Users,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  PhoneOff,
  Zap,
  Map,
  BarChart3,
  Settings,
  Pill,
} from 'lucide-react';
import { PharmacyControl } from '@/components/PharmacyControl';

export default function StaffControlPanel() {
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [stats, setStats] = useState({ total: 0, admitted: 0, critical: 0, discharged: 0 });
  const [filter, setFilter] = useState('all');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('staff-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, loadDashboardData)
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch patients
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch appointments
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('*, patient:patient_id(id, full_name), doctor:assigned_doctor_id(full_name)')
        .order('appointment_date', { ascending: false });

      // Fetch emergency requests (ambulance requests)
      const { data: emergencyData } = await supabase
        .from('ambulance_requests')
        .select('*')
        .not('status', 'in', '(completed,cancelled)')
        .order('created_at', { ascending: false });

      // Fetch staff
      const { data: staffData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['doctor', 'staff', 'nurse'])
        .order('full_name');

      setPatients(patientData || []);
      setAppointments(appointmentData || []);
      setEmergencies(emergencyData || []);
      setStaff(staffData || []);

      // Calculate stats
      const admitted = patientData?.filter(p => p.admission_status === 'admitted').length || 0;
      const critical = patientData?.filter(p => p.admission_status === 'critical').length || 0;
      const discharged = patientData?.filter(p => p.admission_status === 'discharged').length || 0;

      setStats({
        total: patientData?.length || 0,
        admitted,
        critical,
        discharged,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleAssignStaff = async (patientId, staffId, role) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          [role === 'doctor' ? 'assigned_doctor_id' : 'assigned_nurse_id']: staffId,
        })
        .eq('id', patientId);

      if (error) throw error;
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} assigned successfully`);
      loadDashboardData();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Failed to assign staff');
    }
  };

  const handleUpdatePatientStatus = async (patientId, status) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ admission_status: status })
        .eq('id', patientId);

      if (error) throw error;
      toast.success(`Patient status updated to ${status}`);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleGenerateOTP = async (appointmentId) => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes

      const { error } = await supabase
        .from('appointments')
        .update({
          otp_code: otp,
          otp_expiry: expiryTime,
          otp_verified: false,
        })
        .eq('id', appointmentId);

      if (error) throw error;
      toast.success(`OTP Generated: ${otp} (Valid for 10 min)`);
      loadDashboardData();
    } catch (error) {
      console.error('Error generating OTP:', error);
      toast.error('Failed to generate OTP');
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) throw error;
      toast.success('Appointment marked as completed');
      loadDashboardData();
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Failed to complete appointment');
    }
  };

  const handleCloseEmergency = async (emergencyId) => {
    try {
      const { error } = await supabase
        .from('ambulance_requests')
        .update({ status: 'completed', completed_at: new Date() })
        .eq('id', emergencyId);

      if (error) throw error;
      toast.success('Emergency case closed');
      loadDashboardData();
    } catch (error) {
      console.error('Error closing emergency:', error);
      toast.error('Failed to close emergency');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            Hospital Staff Control Center
          </h1>
          <p className="text-blue-100">Real-time patient monitoring and staff management</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Admitted</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.admitted}</p>
            </div>
            <Activity className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Critical</p>
              <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Discharged</p>
              <p className="text-3xl font-bold text-green-600">{stats.discharged}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-8 py-4 border-b border-gray-700">
        <div className="flex gap-4 overflow-x-auto">
          {['patients', 'appointments', 'pharmacy', 'emergencies', 'staff'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="grid gap-6">
            <div className="flex gap-2 mb-4">
              {['all', 'admitted', 'critical', 'discharged'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {patients
                .filter((p) => filter === 'all' || p.admission_status === filter)
                .map((patient) => (
                  <div key={patient.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Patient Name</p>
                        <p className="text-lg font-bold text-gray-900">{patient.full_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Admission Status</p>
                        <select
                          value={patient.admission_status}
                          onChange={(e) => handleUpdatePatientStatus(patient.id, e.target.value)}
                          className="mt-1 px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium"
                        >
                          <option value="admitted">Admitted</option>
                          <option value="critical">Critical</option>
                          <option value="recovering">Recovering</option>
                          <option value="discharged">Discharged</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Ward</p>
                        <p className="text-lg font-bold text-gray-900">{patient.ward_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Contact</p>
                        <p className="text-lg font-bold text-gray-900">{patient.phone_number || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-gray-600 text-sm mb-2">Assign Doctor</p>
                        <select
                          onChange={(e) => handleAssignStaff(patient.id, e.target.value, 'doctor')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select Doctor</option>
                          {staff
                            .filter((s) => s.role === 'doctor')
                            .map((doctor) => (
                              <option key={doctor.id} value={doctor.id}>
                                {doctor.full_name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-2">Assign Nurse</p>
                        <select
                          onChange={(e) => handleAssignStaff(patient.id, e.target.value, 'nurse')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select Nurse</option>
                          {staff
                            .filter((s) => s.role === 'staff' || s.role === 'nurse')
                            .map((nurse) => (
                              <option key={nurse.id} value={nurse.id}>
                                {nurse.full_name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="grid gap-4">
            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No appointments scheduled</p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Patient</p>
                      <p className="text-lg font-bold text-gray-900">{appointment.patient?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Doctor</p>
                      <p className="text-lg font-bold text-gray-900">{appointment.doctor?.full_name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Time</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(appointment.appointment_date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <p className={`text-lg font-bold ${
                        appointment.status === 'completed' ? 'text-green-600' :
                        appointment.status === 'cancelled' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {appointment.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleGenerateOTP(appointment.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Generate OTP
                    </button>
                    <button
                      onClick={() => handleCompleteAppointment(appointment.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  </div>

                  {appointment.otp_code && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">OTP: <span className="font-bold text-lg">{appointment.otp_code}</span></p>
                      <p className="text-xs text-gray-500">Expires at {new Date(appointment.otp_expiry).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Pharmacy Tab */}
        {activeTab === 'pharmacy' && (
          <div>
            <PharmacyControl />
          </div>
        )}

        {/* Emergencies Tab */}
        {activeTab === 'emergencies' && (
          <div className="grid gap-4">
            {emergencies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <PhoneOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active emergencies</p>
              </div>
            ) : (
              emergencies.map((emergency) => (
                <div key={emergency.id} className="bg-red-50 rounded-lg border-2 border-red-600 p-6 hover:shadow-lg transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Patient Name</p>
                      <p className="text-lg font-bold text-red-600">{emergency.patient_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Location</p>
                      <p className="text-lg font-bold text-gray-900">{emergency.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <p className="text-lg font-bold text-red-600">⚠️ {emergency.status.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div className="flex-1 flex items-center gap-2 p-2 bg-white rounded-lg">
                      <Map className="w-4 h-4 text-gray-600" />
                      <p className="text-sm"><strong>Lat:</strong> {emergency.latitude?.toFixed(4)}</p>
                      <p className="text-sm"><strong>Lng:</strong> {emergency.longitude?.toFixed(4)}</p>
                    </div>
                    <button
                      onClick={() => handleCloseEmergency(emergency.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
                    >
                      Close Case
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center col-span-full">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No staff members found</p>
              </div>
            ) : (
              staff.map((member) => (
                <div key={member.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all">
                  <div className="mb-4">
                    <p className="text-lg font-bold text-gray-900">{member.full_name}</p>
                    <p className="text-sm text-blue-600 font-medium capitalize">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>

                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-bold text-gray-900">{member.department || 'General'}</p>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    <p>Joined: {new Date(member.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
