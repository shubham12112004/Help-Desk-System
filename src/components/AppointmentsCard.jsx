import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, AlertCircle, Loader2, User, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  createAppointment, 
  getUpcomingAppointments,
  cancelAppointment 
} from "@/services/hospital";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Psychiatry'
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];

export function AppointmentsCard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(null);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await getUpcomingAppointments(user.id);
      if (data) {
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDept || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsBooking(true);
    try {
      const appointmentDateTime = `${selectedDate}T${convertTo24Hour(selectedTime)}`;
      
      const { data, error } = await createAppointment(
        user.id,
        selectedDept,
        new Date(appointmentDateTime),
        selectedTime,
        selectedTime,
        reason || 'Routine checkup'
      );

      if (error) {
        toast.error('Failed to book appointment');
        return;
      }

      toast.success('Appointment booked successfully!');
      setSelectedDept('');
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      loadAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const convertTo24Hour = (time) => {
    const [hours, period] = time.split(' ');
    const [hour] = hours.split(':');
    let hour24 = parseInt(hour);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${String(hour24).padStart(2, '0')}:00`;
  };

  const handleCancelAppointment = async (appointmentId) => {
    setIsCancelling(appointmentId);
    try {
      const { error } = await cancelAppointment(appointmentId);

      if (error) {
        toast.error('Failed to cancel appointment');
        return;
      }

      toast.success('Appointment cancelled successfully');
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setIsCancelling(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
    };
    return colors[status] || colors.scheduled;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Book New Appointment */}
      <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-semibold">Book Appointment</h3>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 mb-4">
              <Plus className="h-4 w-4" />
              Schedule New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book Doctor Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Department Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Appointment Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Time Slot</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm font-medium mb-2 block">Reason for Visit (Optional)</label>
                <Input
                  placeholder="e.g., Regular checkup, Follow-up"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setSelectedDept('');
                  setSelectedDate('');
                  setSelectedTime('');
                  setReason('');
                }}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={handleBookAppointment}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Book Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <p className="text-sm text-muted-foreground">
          💡 Book appointments with specialist doctors. You'll receive confirmation and reminders.
        </p>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Upcoming Appointments ({appointments.length})
        </h3>

        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No Scheduled Appointments</p>
            <p className="text-sm">Book your first appointment with a doctor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(appointment => (
              <div
                key={appointment.id}
                className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-lg p-4 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {appointment.department}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.slot_type || 'Regular Consultation'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-white dark:bg-slate-950 rounded border border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">
                        {formatDate(appointment.appointment_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">
                        {appointment.appointment_time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded mb-3">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Doctor will be assigned upon confirmation
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleCancelAppointment(appointment.id)}
                    disabled={isCancelling === appointment.id}
                  >
                    {isCancelling === appointment.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        Cancel
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
