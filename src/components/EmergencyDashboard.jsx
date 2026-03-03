import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  Users,
  Truck,
  CheckCircle,
  RefreshCw,
  Navigation,
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
import {
  getActiveAmbulanceRequests,
  assignAmbulanceAndDriver,
  updateAmbulanceRequestStatus,
  getAvailableAmbulances,
} from '@/services/enhance-hospital';

const EmergencyDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    ambulanceId: '',
    driverId: ''
  });
  const [drivers, setDrivers] = useState([]);

  // Load data
  useEffect(() => {
    loadData();

    const subscription = supabase
      .channel('emergency-ambulance')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ambulance_requests'
      }, loadData)
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load ambulance requests
      const { data: requestData, error: requestError } = await getActiveAmbulanceRequests();
      if (requestError) throw requestError;
      setRequests(requestData || []);

      // Load available ambulances
      const { data: ambulanceData, error: ambulanceError } = await getAvailableAmbulances();
      if (ambulanceError) throw ambulanceError;
      setAmbulances(ambulanceData || []);

      // Load drivers
      const { data: driverData, error: driverError } = await supabase
        .from('auth.users')
        .select('id, full_name')
        .eq('role', 'driver')
        .eq('availability_status', 'available');

      if (!driverError) {
        setDrivers(driverData || []);
      }
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAmbulance = async () => {
    if (!assignmentData.ambulanceId || !assignmentData.driverId) {
      toast.error('Please select both ambulance and driver');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await assignAmbulanceAndDriver(
        selectedRequest.id,
        assignmentData.ambulanceId,
        assignmentData.driverId
      );

      if (error) throw error;

      toast.success('Ambulance and driver assigned successfully');
      setShowAssignModal(false);
      setAssignmentData({ ambulanceId: '', driverId: '' });
      loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      setLoading(true);
      const { data, error } = await updateAmbulanceRequestStatus(requestId, newStatus);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'arrived':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const inTransitRequests = requests.filter(r => r.status === 'in_transit');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Emergency Ambulance Dashboard</h2>
        </div>
        <Button onClick={loadData} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Critical Alert */}
      {pendingRequests.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-bold text-red-800">🚨 CRITICAL: {pendingRequests.length} Pending Request(s)</h3>
              <p className="text-sm text-red-700">Immediate ambulance assignment required</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold">{inTransitRequests.length}</p>
            </div>
            <Navigation className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Ambulances</p>
              <p className="text-2xl font-bold">{ambulances.length}</p>
            </div>
            <Truck className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Drivers</p>
              <p className="text-2xl font-bold">{drivers.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Pending Requests */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-red-600">⚠️ Pending Requests</h3>
        <div className="space-y-3">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading requests...</p>
            </Card>
          ) : pendingRequests.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No pending requests - All clear!
            </Card>
          ) : (
            pendingRequests.map(request => (
              <Card key={request.id} className="p-4 border-l-4 border-l-red-500 bg-red-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </div>
                      <p className="font-bold">Request #{request.id.slice(0, 8)}</p>
                      <span className="text-xs text-gray-600">
                        {new Date(request.request_time).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-600">Pickup</p>
                          <p className="font-semibold text-sm">{request.pickup_location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-600">Delivery</p>
                          <p className="font-semibold text-sm">{request.delivery_location}</p>
                        </div>
                      </div>
                    </div>

                    {request.patient_condition && (
                      <div className="mt-2 p-2 bg-white rounded border border-yellow-200">
                        <p className="text-xs text-gray-600">Patient Condition</p>
                        <p className="text-sm font-medium">{request.patient_condition}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowAssignModal(true);
                    }}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Assign Now
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* In Transit Requests */}
      <div>
        <h3 className="font-bold text-lg mb-3">🚑 In Transit</h3>
        <div className="space-y-3">
          {inTransitRequests.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No ambulances in transit
            </Card>
          ) : (
            inTransitRequests.map(request => (
              <Card key={request.id} className="p-4 border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.ambulance?.registration_number}</p>
                        <p className="text-sm text-gray-500">{request.driver?.full_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm mt-2">
                      <div>
                        <span className="text-gray-600">From:</span>
                        <p className="font-medium">{request.pickup_location.split(',')[0]}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">To:</span>
                        <p className="font-medium">{request.delivery_location.split(',')[0]}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">ETA:</span>
                        <p className="font-medium">
                          {new Date(request.estimated_arrival_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(request.id, 'arrived')}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Arrived
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Ambulance & Driver</DialogTitle>
            <DialogDescription>
              Select an available ambulance and driver for this request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-gray-600">Request Type</p>
                <p className="font-semibold">{selectedRequest.request_type}</p>
                <p className="text-sm text-gray-600 mt-2">Priority</p>
                <p className={`font-semibold px-2 py-1 rounded text-white w-fit ${getPriorityColor(selectedRequest.priority)}`}>
                  {selectedRequest.priority.toUpperCase()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Select Ambulance</label>
                <select
                  value={assignmentData.ambulanceId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, ambulanceId: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border rounded-md"
                >
                  <option value="">Choose ambulance...</option>
                  {ambulances.map(amb => (
                    <option key={amb.id} value={amb.id}>
                      {amb.registration_number} - {amb.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Select Driver</label>
                <select
                  value={assignmentData.driverId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, driverId: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border rounded-md"
                >
                  <option value="">Choose driver...</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAssignAmbulance}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Assign Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyDashboard;
