import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertCircle,
  RefreshCw,
  Filter,
  FileText,
  TrendingUp,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplet,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getAdmittedPatients, getCriticalCases, getPatientMedicalRecord } from '@/services/enhance-hospital';

const PatientMonitoringPanel = () => {
  const [patients, setPatients] = useState([]);
  const [criticalCases, setCriticalCases] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [departments] = useState([
    { id: 'all', name: 'All Departments' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'general', name: 'General Surgery' },
  ]);

  // Load data
  useEffect(() => {
    loadPatientData();
    
    // Real-time subscription
    const subscription = supabase
      .channel('patient-monitoring')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patient_medical_records'
      }, loadPatientData)
      .subscribe();

    return () => subscription.unsubscribe();
  }, [selectedDepartment, filterStatus]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Get admitted patients
      const dept = selectedDepartment === 'all' ? null : selectedDepartment;
      const status = filterStatus === 'all' ? null : filterStatus;
      
      const { data: admittedData, error: admittedError } = await getAdmittedPatients(dept, status);
      if (admittedError) throw admittedError;
      
      // Get critical cases
      const { data: criticalData, error: criticalError } = await getCriticalCases(dept);
      if (criticalError) throw criticalError;

      setPatients(admittedData || []);
      setCriticalCases(criticalData || []);
    } catch (error) {
      console.error('Load patient data error:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = async (patient) => {
    try {
      setSelectedPatient(patient);
      const { data, error } = await getPatientMedicalRecord(patient.patient_id);
      if (error) throw error;
      setMedicalRecord(data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load medical record');
    }
  };

  const filteredPatients = patients.filter(p => 
    !searchQuery || 
    p.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'observation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'stable':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Patient Monitoring</h2>
        </div>
        <Button onClick={loadPatientData} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Admitted</p>
              <p className="text-2xl font-bold">{patients.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Cases</p>
              <p className="text-2xl font-bold">{criticalCases.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stable Patients</p>
              <p className="text-2xl font-bold">
                {patients.filter(p => p.condition_status === 'stable').length}
              </p>
            </div>
            <Heart className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Under Observation</p>
              <p className="text-2xl font-bold">
                {patients.filter(p => p.condition_status === 'observation').length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Search Patient</label>
            <Input
              placeholder="Name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical</option>
              <option value="observation">Observation</option>
              <option value="stable">Stable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Critical Cases Alert */}
      {criticalCases.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">⚠️ Critical Cases Requiring Immediate Attention</h3>
              <p className="text-sm text-red-700 mt-1">
                {criticalCases.length} patient(s) need urgent care
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Patients List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Admitted Patients ({filteredPatients.length})</h3>
        
        {loading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading patient data...</p>
          </Card>
        ) : filteredPatients.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No patients found matching your filters
          </Card>
        ) : (
          filteredPatients.map(patient => (
            <Card key={patient.id} className="p-4 hover:shadow-md transition cursor-pointer" onClick={() => handleViewRecord(patient)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{patient.patient?.full_name}</p>
                      <p className="text-sm text-gray-500">{patient.patient?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(patient.condition_status)}`}>
                    {patient.condition_status.charAt(0).toUpperCase() + patient.condition_status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-500">{patient.department}</p>
                </div>
              </div>

              {/* Vital Signs */}
              {patient.vitals && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded">
                  {patient.vitals.bp && (
                    <div className="text-center">
                      <Wind className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-sm font-medium">{patient.vitals.bp}</p>
                      <p className="text-xs text-gray-500">BP</p>
                    </div>
                  )}
                  {patient.vitals.pulse && (
                    <div className="text-center">
                      <Heart className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-sm font-medium">{patient.vitals.pulse}</p>
                      <p className="text-xs text-gray-500">Pulse</p>
                    </div>
                  )}
                  {patient.vitals.temp && (
                    <div className="text-center">
                      <Thermometer className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-sm font-medium">{patient.vitals.temp}°F</p>
                      <p className="text-xs text-gray-500">Temp</p>
                    </div>
                  )}
                  {patient.vitals.oxygen && (
                    <div className="text-center">
                      <Droplet className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-sm font-medium">{patient.vitals.oxygen}%</p>
                      <p className="text-xs text-gray-500">O2</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-sm">
                <p className="text-gray-500">
                  Admitted: {new Date(patient.admission_date).toLocaleDateString()}
                </p>
                {patient.critical_alert && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                    🚨 ALERT
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Medical Record Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Record - {selectedPatient?.patient?.full_name}</DialogTitle>
            <DialogDescription>
              Complete medical information and history
            </DialogDescription>
          </DialogHeader>

          {medicalRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Age</h4>
                  <p className="text-lg">{medicalRecord.patient?.age} years</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Gender</h4>
                  <p className="text-lg">{medicalRecord.patient?.gender}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Blood Type</h4>
                  <p className="text-lg">{medicalRecord.blood_type || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Insurance</h4>
                  <p className="text-lg">{medicalRecord.insurance_provider || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600">Chief Complaint</h4>
                <p className="text-gray-700 mt-1">{medicalRecord.chief_complaint || 'N/A'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600">Medical History</h4>
                <p className="text-gray-700 mt-1">{medicalRecord.medical_history || 'N/A'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600">Allergies</h4>
                <p className="text-gray-700 mt-1">
                  {medicalRecord.allergies?.join(', ') || 'None recorded'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600">Current Medications</h4>
                <p className="text-gray-700 mt-1">
                  {medicalRecord.current_medications?.join(', ') || 'None recorded'}
                </p>
              </div>

              <div className="mt-6 flex gap-2">
                <Button onClick={() => setShowModal(false)}>Close</Button>
                <Button variant="outline">Export Record</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientMonitoringPanel;
