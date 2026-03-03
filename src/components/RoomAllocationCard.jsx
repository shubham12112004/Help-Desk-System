import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Home, Calendar, AlertCircle, Loader2, Stethoscope, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function RoomAllocationCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [nurseInfo, setNurseInfo] = useState(null);

  useEffect(() => {
    if (user) {
      loadRoomAllocation();
    }
  }, [user]);

  const loadRoomAllocation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('room_allocations')
        .select('*')
        .eq('patient_id', user.id)
        .order('admission_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRoomData(data);
        
        // Load doctor info if assigned
        if (data.assigned_doctor_id) {
          const { data: doctor } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.assigned_doctor_id)
            .single();
          if (doctor) setDoctorInfo(doctor);
        }
        
        // Load nurse info if assigned
        if (data.assigned_nurse_id) {
          const { data: nurse } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.assigned_nurse_id)
            .single();
          if (nurse) setNurseInfo(nurse);
        }
      }
    } catch (error) {
      console.error('Error loading room allocation:', error);
      toast.error('Failed to load room information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  if (!roomData) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Home className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-1">No Room Allocated</h3>
          <p className="text-sm text-muted-foreground">
            You are currently not admitted to the hospital
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Contact the hospital desk when you arrive for admission
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🏥 Room Allocation</h3>
          <Badge variant="default" className="bg-emerald-600 text-white">
            Allocated
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Room Number</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {roomData.room_number}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bed Number</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {roomData.bed_number}
          </p>
        </div>
      </div>

      {/* Admission Date */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Admission Date</p>
        </div>
        <p className="text-sm font-medium">
          {formatDate(roomData.admission_date)}
        </p>
      </div>

      {/* Doctor & Nurse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Doctor */}
        <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs font-semibold text-muted-foreground uppercase">Doctor</p>
          </div>
          {doctorInfo ? (
            <>
              <p className="font-semibold text-foreground">{doctorInfo.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {doctorInfo.department || 'General Medicine'}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Not assigned yet</p>
          )}
        </div>

        {/* Nurse */}
        <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <p className="text-xs font-semibold text-muted-foreground uppercase">Nurse</p>
          </div>
          {nurseInfo ? (
            <>
              <p className="font-semibold text-foreground">{nurseInfo.full_name}</p>
              <p className="text-xs text-muted-foreground">Healthcare Professional</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Not assigned yet</p>
          )}
        </div>
      </div>

      {/* Admission Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-foreground mb-1">Hospital Stay</p>
          <p className="text-muted-foreground">
            Admitted on <span className="font-medium">{formatDate(roomData.admission_date)}</span> in Room {roomData.room_number}, Bed {roomData.bed_number}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={loadRoomAllocation}>
          Refresh
        </Button>
        <Button 
          className="flex-1 gap-2"
          onClick={() => {
            if (doctorInfo) {
              navigate('/create', {
                state: {
                  prefilledData: {
                    title: `Contact Doctor - ${doctorInfo.full_name}`,
                    description: `I would like to speak with Dr. ${doctorInfo.full_name} regarding my treatment in Room ${roomData.room_number}, Bed ${roomData.bed_number}.`,
                    category: 'medical',
                    department: doctorInfo.department || 'general',
                    priority: 'high'
                  }
                }
              });
            } else {
              navigate('/create', {
                state: {
                  prefilledData: {
                    title: 'Contact Doctor - Medical Consultation',
                    description: `I am in Room ${roomData.room_number}, Bed ${roomData.bed_number} and would like to speak with my assigned doctor.`,
                    category: 'medical',
                    department: 'general',
                    priority: 'high'
                  }
                }
              });
            }
            toast.success('Redirecting to create support ticket...');
          }}
        >
          <MessageCircle className="h-4 w-4" />
          Contact Doctor
        </Button>
      </div>
    </Card>
  );
}
