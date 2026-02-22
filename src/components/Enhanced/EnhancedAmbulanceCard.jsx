import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, Phone, MapPin, AlertCircle, Loader2, Clock, 
  Navigation, Users, Crosshair, Zap, Heart, Wind, Droplet,
  Eye, EyeOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { requestAmbulance, getAmbulanceRequests } from "@/services/hospital";
import { AmbulanceMapView } from "@/components/AmbulanceMapView";
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

const EMERGENCY_TYPES = [
  { value: 'accident', label: '🚗 Accident/Trauma', icon: '🚗', color: 'from-red-500 to-red-600' },
  { value: 'chest_pain', label: '❤️ Chest Pain', icon: '❤️', color: 'from-red-500 to-pink-600' },
  { value: 'breathing', label: '💨 Difficulty Breathing', icon: '💨', color: 'from-orange-500 to-red-600' },
  { value: 'stroke', label: '🧠 Stroke Symptoms', icon: '🧠', color: 'from-purple-500 to-red-600' },
  { value: 'bleeding', label: '🩸 Severe Bleeding', icon: '🩸', color: 'from-red-600 to-red-700' },
  { value: 'unconscious', label: '😵 Unconscious', icon: '😵', color: 'from-gray-600 to-red-600' },
  { value: 'injury', label: '⚠️ Severe Injury', icon: '⚠️', color: 'from-yellow-500 to-red-600' },
  { value: 'other', label: '🆘 Other Emergency', icon: '🆘', color: 'from-blue-500 to-red-600' }
];

export function EnhancedAmbulanceCard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (user) {
      loadAmbulanceRequests();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('ambulance-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ambulance_requests',
          filter: `patient_id=eq.${user.id}`
        },
        (payload) => {
          loadAmbulanceRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setGettingLocation(false);
        toast.success('📍 Location captured successfully!');
      },
      (error) => {
        setGettingLocation(false);
        toast.error('Failed to get GPS location. Please enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const loadAmbulanceRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getAmbulanceRequests(user.id);
      if (data) setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load ambulance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAmbulance = async () => {
    if (!emergencyType || !location) {
      toast.error('Please provide emergency type and location');
      return;
    }

    setIsRequesting(true);
    try {
      const { data, error } = await requestAmbulance({
        patient_id: user.id,
        pickup_location: location,
        destination: 'Hospital',
        emergency_type: emergencyType,
        contact_number: phone || '+91 000-000-0000',
        user_latitude: userLat,
        user_longitude: userLng
      });

      if (error) {
        toast.error('Failed to request ambulance');
        return;
      }

      toast.success('🚑 Ambulance requested! ETA will be provided shortly.');
      setEmergencyType('');
      setLocation('');
      setPhone('');
      setUserLat(null);
      setUserLng(null);
      loadAmbulanceRequests();
    } catch (error) {
      console.error('Error requesting:', error);
      toast.error('Failed to request ambulance');
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      assigned: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
      dispatched: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      arrived: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'
    };
    return colors[status] || colors.requested;
  };

  const statusSequence = ['requested', 'assigned', 'dispatched', 'arrived', 'completed'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="flex flex-col items-center justify-center gap-3 h-64">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 dark:text-red-400" />
          <p className="text-sm text-muted-foreground">Loading ambulance services...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Request Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
            <Zap className="h-5 w-5 mr-2" />
            🚑 EMERGENCY AMBULANCE REQUEST
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">
              🚑 Emergency Ambulance Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Emergency Type Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                What's the emergency? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {EMERGENCY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setEmergencyType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                      emergencyType === type.value
                        ? `border-red-500 bg-gradient-to-r ${type.color} text-white shadow-lg`
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-red-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Your Location <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your address or GPS will capture it"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={getUserLocation}
                  disabled={gettingLocation}
                  variant="outline"
                  className="flex-1"
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting GPS...
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-4 w-4 mr-2" />
                      Use GPS Location
                    </>
                  )}
                </Button>
                {userLat && userLng && (
                  <div className="flex-1 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-2 text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    ✓ GPS Captured
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Contact Number
              </label>
              <Input
                placeholder="+91 98765-43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Request Button */}
            <Button
              onClick={handleRequestAmbulance}
              disabled={isRequesting || !emergencyType || !location}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 font-bold text-lg"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Requesting Ambulance...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  REQUEST NOW
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Requests */}
      {requests.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4">📍 Your Ambulance Requests</h3>
          <div className="space-y-4">
            {requests.map((request) => {
              const statusIndex = statusSequence.indexOf(request.status);
              return (
                <Card key={request.id} className="p-6 overflow-hidden border-l-4 border-l-red-600 hover:shadow-lg transition-shadow">
                  {/* Status Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Status Progress</h4>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {statusSequence.map((status, idx) => (
                        <div key={status} className="flex-1">
                          <div className={`h-2 rounded-full transition-all ${
                            idx <= statusIndex 
                              ? 'bg-red-600' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`} />
                          <p className="text-xs text-center mt-1 capitalize">{status}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Emergency Type</p>
                      <p className="font-semibold">{request.emergency_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Location</p>
                      <p className="font-semibold text-sm line-clamp-1">{request.pickup_location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Time</p>
                      <p className="font-semibold text-sm">{formatDate(request.created_at)}</p>
                    </div>
                  </div>

                  {/* Driver Info (if assigned) */}
                  {request.status !== 'requested' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-muted-foreground uppercase mb-2">Driver Information</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Driver Name</p>
                          <p className="text-sm text-muted-foreground">License: XX-12-3456</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Driver
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Map Button */}
                  {request.status !== 'requested' && (
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowMap(true);
                      }}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Map View Modal */}
      {showMap && selectedRequest && (
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="sm:max-w-[900px] h-[600px]">
            <DialogHeader>
              <DialogTitle>🗺️ Ambulance Tracking</DialogTitle>
            </DialogHeader>
            <AmbulanceMapView request={selectedRequest} />
          </DialogContent>
        </Dialog>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <Card className="p-12 text-center border-dashed bg-gray-50 dark:bg-gray-900/50">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <h3 className="font-semibold mb-1">No Ambulance Requests</h3>
          <p className="text-sm text-muted-foreground">
            Click the emergency button above to request an ambulance
          </p>
        </Card>
      )}
    </div>
  );
}
