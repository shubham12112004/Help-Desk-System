import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Edit2,
  AlertCircle,
  RefreshCw,
  Clock,
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
  getAppointmentsForApproval,
  approveAppointment,
  rescheduleAppointment,
  cancelAppointment,
  checkDoubleBooking,
} from '@/services/enhance-hospital';
import { useAuth } from '@/hooks/useAuth';

const AppointmentManagement = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [view, setView] = useState('list');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newTime: '',
    reason: ''
  });
  const [cancelReason, setCancelReason] = useState('');

  // Load appointments
  useEffect(() => {
    loadAppointments();

    const subscription = supabase
      .channel('appointments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, loadAppointments)
      .subscribe();

    return () => subscription.unsubscribe();
  }, [filterStatus]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAppointmentsForApproval(filterStatus);

      if (error) throw error;
      setAppointments(data || []);
      setFilteredAppointments(data || []);
    } catch (error) {
      console.error('Load appointments error:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const { data, error } = await approveAppointment(appointmentId, user.id);

      if (error) throw error;

      toast.success('Appointment approved successfully');
      loadAppointments();
    } catch (error) {
      toast.error(error.message || 'Failed to approve appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.newDate || !rescheduleData.newTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      setLoading(true);

      // Check for double booking
      const { isDouble, error: bookingError } = await checkDoubleBooking(
        selectedAppointment.doctor_id,
        rescheduleData.newDate,
        rescheduleData.newTime,
        selectedAppointment.id
      );

      if (bookingError) throw bookingError;
      if (isDouble) {
        toast.error('Double booking detected - slot is already taken');
        return;
      }

      const { data, error } = await rescheduleAppointment(
        selectedAppointment.id,
        rescheduleData.newDate,
        rescheduleData.newTime,
        rescheduleData.reason
      );

      if (error) throw error;

      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setRescheduleData({ newDate: '', newTime: '', reason: '' });
      loadAppointments();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await cancelAppointment(selectedAppointment.id, cancelReason);

      if (error) throw error;

      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      loadAppointments();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Calendar view data
  const getCalendarData = () => {
    const calendar = {};
    appointments.forEach(apt => {
      const date = apt.appointment_date;
      if (!calendar[date]) calendar[date] = [];
      calendar[date].push(apt);
    });
    return calendar;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Appointment Management</h2>
        </div>
        <Button onClick={loadAppointments} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.approval_status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.approval_status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'cancelled').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
        >
          List View
        </Button>
        <Button
          variant={view === 'calendar' ? 'default' : 'outline'}
          onClick={() => setView('calendar')}
        >
          Calendar View
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['pending', 'approved', 'completed', 'cancelled'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-3">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </Card>
          ) : appointments.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No {filterStatus} appointments found
            </Card>
          ) : (
            appointments.map(appointment => (
              <Card key={appointment.id} className="p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.patient?.full_name}</p>
                        <p className="text-sm text-gray-500">Dr. {appointment.doctor?.full_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <p className="font-medium">{appointment.appointment_time}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Department:</span>
                        <p className="font-medium">{appointment.department?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium capitalize">{appointment.appointment_type || 'General'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm border inline-block ${getStatusColor(appointment.approval_status)}`}>
                      {appointment.approval_status.charAt(0).toUpperCase() + appointment.approval_status.slice(1)}
                    </span>

                    {appointment.approval_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveAppointment(appointment.id)}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowRescheduleModal(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowCancelModal(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {appointment.approval_status === 'approved' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowRescheduleModal(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowCancelModal(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {appointment.staff_notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Staff Notes:</p>
                    <p className="text-sm">{appointment.staff_notes}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(getCalendarData()).map(([date, dateAppointments]) => (
              <Card key={date} className="p-3">
                <h4 className="font-semibold text-sm mb-2">
                  {new Date(date).toLocaleDateString()}
                </h4>
                <div className="space-y-1">
                  {dateAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className={`p-2 rounded text-xs ${
                        apt.approval_status === 'pending' ? 'bg-yellow-50 border-l-2 border-yellow-500' : 'bg-green-50 border-l-2 border-green-500'
                      }`}
                    >
                      <p className="font-medium">{apt.appointment_time}</p>
                      <p>{apt.patient?.full_name}</p>
                      <p className="text-gray-600">Dr. {apt.doctor?.full_name}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select new date and time for the appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-semibold">{selectedAppointment.patient?.full_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium">New Date</label>
                <Input
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">New Time</label>
                <Input
                  type="time"
                  value={rescheduleData.newTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Reason for Reschedule</label>
                <Input
                  placeholder="Doctor unavailable, patient request, etc."
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleReschedule}
                  disabled={loading}
                  className="flex-1"
                >
                  Confirm Reschedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure? Please provide a reason for cancellation
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-semibold">{selectedAppointment.patient?.full_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Cancellation Reason</label>
                <Input
                  placeholder="Doctor unavailable, system error, patient request, etc."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Confirm Cancellation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                >
                  Keep Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentManagement;
