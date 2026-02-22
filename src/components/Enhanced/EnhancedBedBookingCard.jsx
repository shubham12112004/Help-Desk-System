import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Users, Calendar, Check, AlertCircle, Loader2, 
  Plus, Filter, MapPin, Phone, Clock, Bed
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

const WARD_TYPES = [
  { value: 'general', label: '🏥 General Ward', color: 'from-blue-500 to-blue-600', icon: '🏥' },
  { value: 'icu', label: '🔴 ICU (Intensive Care)', color: 'from-red-500 to-red-600', icon: '🔴' },
  { value: 'vip', label: '👑 VIP Room', color: 'from-purple-500 to-purple-600', icon: '👑' },
  { value: 'emergency', label: '🚨 Emergency Ward', color: 'from-orange-500 to-orange-600', icon: '🚨' }
];

const ROOM_PREFERENCES = [
  { value: 'quiet', label: '🤫 Quiet Room', icon: '🤫' },
  { value: 'ground_floor', label: '🚪 Ground Floor', icon: '🚪' },
  { value: 'window', label: '🪟 Window View', icon: '🪟' },
  { value: 'private', label: '🔒 Private Room', icon: '🔒' }
];

export function EnhancedBedBookingCard() {
  const { user } = useAuth();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [selectedWardType, setSelectedWardType] = useState('general');
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  useEffect(() => {
    if (user) {
      loadCurrentRoom();
      loadAvailableBeds();
    }
  }, [user]);

  const loadCurrentRoom = async () => {
    try {
      const { data } = await supabase
        .from('room_allocations')
        .select(`
          *,
          assigned_doctor:assigned_doctor_id(id, full_name),
          assigned_nurse:assigned_nurse_id(id, full_name)
        `)
        .eq('patient_id', user.id)
        .eq('status', 'allocated')
        .order('admission_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setCurrentRoom(data);
      }
    } catch (error) {
      console.error('Error loading room:', error);
    }
  };

  const loadAvailableBeds = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('room_allocations')
        .select('*')
        .eq('status', 'available')
        .order('room_number', { ascending: true });

      if (data) {
        setAvailableBeds(data);
      }
    } catch (error) {
      console.error('Error loading beds:', error);
      toast.error('Failed to load available beds');
    } finally {
      setLoading(false);
    }
  };

  const handleBookBed = async (bedId) => {
    if (currentRoom) {
      toast.error('You already have a room allocated. Contact admin to change.');
      return;
    }

    setIsRequesting(true);
    try {
      const bed = availableBeds.find(b => b.id === bedId);
      const { data, error } = await supabase
        .from('room_allocations')
        .update({
          patient_id: user.id,
          status: 'allocated'
        })
        .eq('id', bedId)
        .select()
        .single();

      if (error) throw error;

      toast.success('🎉 Bed booked successfully!');
      setCurrentRoom(data);
      loadAvailableBeds();
      setShowAvailability(false);
    } catch (error) {
      console.error('Error booking bed:', error);
      toast.error('Failed to book bed');
    } finally {
      setIsRequesting(false);
    }
  };

  const togglePreference = (pref) => {
    setSelectedPreferences(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const getWardLabel = (wardType) => {
    return WARD_TYPES.find(w => w.value === wardType)?.label || wardType;
  };

  const getWardColor = (wardType) => {
    return WARD_TYPES.find(w => w.value === wardType)?.color || 'from-gray-500 to-gray-600';
  };

  const getWardIcon = (wardType) => {
    return WARD_TYPES.find(w => w.value === wardType)?.icon || '🏥';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredBeds = availableBeds.filter(bed => 
    selectedWardType ? bed.ward_type === selectedWardType : true
  );

  return (
    <div className="space-y-6">
      {/* Current Room Card */}
      {currentRoom ? (
        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-700 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">
                ✓ Room Allocated
              </h3>
              <p className="text-sm text-muted-foreground">Your current bed assignment</p>
            </div>
            <div className="text-4xl">{getWardIcon(currentRoom.ward_type)}</div>
          </div>

          {/* Room Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Room</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {currentRoom.room_number}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Bed</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {currentRoom.bed_number}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Ward Type</p>
              <Badge className={`bg-gradient-to-r ${getWardColor(currentRoom.ward_type)} text-white whitespace-nowrap`}>
                {getWardIcon(currentRoom.ward_type)} {currentRoom.ward_type}
              </Badge>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Since</p>
              <p className="text-sm font-semibold">{formatDate(currentRoom.admission_date)}</p>
            </div>
          </div>

          {/* Medical Team */}
          <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-green-200 dark:border-green-800 mb-6">
            <p className="text-sm font-semibold mb-3">👨‍⚕️ Medical Team</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentRoom.assigned_doctor && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    👨‍⚕️
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Doctor</p>
                    <p className="font-semibold text-sm">{currentRoom.assigned_doctor.full_name || 'Dr. Smith'}</p>
                  </div>
                </div>
              )}
              {currentRoom.assigned_nurse && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    👩‍⚕️
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Nurse</p>
                    <p className="font-semibold text-sm">{currentRoom.assigned_nurse.full_name || 'Nurse Sarah'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" size="lg">
              <Phone className="h-4 w-4 mr-2" />
              Contact Room Desk
            </Button>
            <Button variant="outline" className="flex-1">
              <MapPin className="h-4 w-4 mr-2" />
              View Location
            </Button>
          </div>
        </Card>
      ) : (
        /* No Room Card */
        <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-1">
                ⏳ No Room Allocated
              </h3>
              <p className="text-sm text-muted-foreground">You don't have a bed assignment yet</p>
            </div>
            <Home className="h-12 w-12 text-amber-600 dark:text-amber-400 opacity-50" />
          </div>

          <p className="text-sm mb-4">
            📍 Check available beds below or contact the hospital desk for immediate admission
          </p>

          <Dialog open={showAvailability} onOpenChange={setShowAvailability}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 w-full font-bold">
                <Plus className="h-5 w-5 mr-2" />
                View Available Beds
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  🛏️ Available Beds
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Ward Type Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Filter by Ward Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {WARD_TYPES.map((ward) => (
                      <button
                        key={ward.value}
                        onClick={() => setSelectedWardType(selectedWardType === ward.value ? '' : ward.value)}
                        className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                          selectedWardType === ward.value
                            ? `border-blue-500 bg-gradient-to-r ${ward.color} text-white shadow-lg`
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-blue-300'
                        }`}
                      >
                        {ward.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bed List */}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : filteredBeds.length > 0 ? (
                  <div className="space-y-3">
                    {filteredBeds.map((bed) => (
                      <Card key={bed.id} className="p-4 border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">
                              Room {bed.room_number} - Bed {bed.bed_number}
                            </h4>
                            <div className="flex gap-2 mt-2">
                              <Badge className={`bg-gradient-to-r ${getWardColor(bed.ward_type)} text-white`}>
                                {getWardIcon(bed.ward_type)} {bed.ward_type}
                              </Badge>
                              <Badge variant="outline">
                                <Check className="h-3 w-3 mr-1" />
                                Available
                              </Badge>
                            </div>
                          </div>
                          <Bed className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                        </div>

                        <Button
                          onClick={() => handleBookBed(bed.id)}
                          disabled={isRequesting}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-3"
                        >
                          {isRequesting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Booking...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Book This Bed
                            </>
                          )}
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-dashed">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h4 className="font-semibold mb-1">No Beds Available</h4>
                    <p className="text-sm text-muted-foreground">
                      No {selectedWardType || 'beds'} available right now. Please check back later or contact admin.
                    </p>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Home className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">General Ward</p>
              <p className="text-sm font-semibold mt-1">Standard rooms for regular patients</p>
              <p className="text-xs text-muted-foreground mt-1">4 beds available</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-1" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">ICU</p>
              <p className="text-sm font-semibold mt-1">Intensive care with 24/7 monitoring</p>
              <p className="text-xs text-muted-foreground mt-1">2 beds available</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <Bed className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">VIP Rooms</p>
              <p className="text-sm font-semibold mt-1">Premium private rooms with amenities</p>
              <p className="text-xs text-muted-foreground mt-1">1 bed available</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
