import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Home, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WARD_TYPES = {
  general: { label: "General", color: "bg-blue-500", icon: "🏥" },
  icu: { label: "ICU", color: "bg-red-500", icon: "🚑" },
  vip: { label: "VIP", color: "bg-purple-500", icon: "👑" },
  emergency: { label: "Emergency", color: "bg-orange-500", icon: "🚨" }
};

export function RoomAllocationCard() {
  const { user } = useAuth();
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
        .select(`
          *,
          assigned_doctor:assigned_doctor_id(full_name, user_metadata -> 'specialization'),
          assigned_nurse:assigned_nurse_id(full_name)
        `)
        .eq('patient_id', user.id)
        .order('admission_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setRoomData(data);
        // Extract doctor and nurse info
        if (data.assigned_doctor) {
          setDoctorInfo(data.assigned_doctor);
        }
        if (data.assigned_nurse) {
          setNurseInfo(data.assigned_nurse);
        }
      }
    } catch (error) {
      console.error('Error loading room allocation:', error);
      toast.error('Failed to load room information');
    } finally {
      setLoading(false);
    }
  };

  const getWardColor = (wardType) => {
    return WARD_TYPES[wardType]?.color || 'bg-gray-500';
  };

  const getWardIcon = (wardType) => {
    return WARD_TYPES[wardType]?.icon || '🏥';
  };

  const getWardLabel = (wardType) => {
    return WARD_TYPES[wardType]?.label || wardType;
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
          <h3 className="text-lg font-semibold">Room Allocation</h3>
          <Badge variant="default" className={`${getWardColor(roomData.ward_type)} text-white`}>
            {getWardIcon(roomData.ward_type)} {getWardLabel(roomData.ward_type)}
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

      {/* Status */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
            {roomData.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Admitted on {formatDate(roomData.admission_date)}
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
                {doctorInfo.user_metadata?.specialization || 'General'}
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
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-foreground mb-1">Admission Details</p>
          <p className="text-muted-foreground">
            You were admitted on <span className="font-medium">{formatDate(roomData.admission_date)}</span> to <span className="font-medium">{getWardLabel(roomData.ward_type)}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={loadRoomAllocation}>
          Refresh
        </Button>
        <Button className="flex-1">Contact Doctor</Button>
      </div>
    </Card>
  );
}
