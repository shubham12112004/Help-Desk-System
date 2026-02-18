import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ambulance, AlertTriangle, Phone, MapPin, AlertCircle, Loader2, Clock, Navigation, Users, Crosshair } from "lucide-react";
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
  'Accident',
  'Chest Pain',
  'Difficulty Breathing',
  'Stroke Symptoms',
  'Severe Bleeding',
  'Unconscious',
  'Severe Injury',
  'Other Emergency'
];

export function AmbulanceCard() {
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

  useEffect(() => {
    if (user) {
      loadAmbulanceRequests();
      setupRealtimeSubscription();
    }
  }, [user]);

  // Setup realtime subscription for ambulance updates
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
          console.log('Ambulance update:', payload);
          loadAmbulanceRequests(); // Reload when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Get user's GPS location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setGettingLocation(false);
        toast.success('Location captured successfully!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
        toast.error('Failed to get location. Please enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const loadAmbulanceRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getAmbulanceRequests(user.id);
      if (data) {
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading ambulance requests:', error);
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
        destination: 'Hospital', // Default destination
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
      console.error('Error requesting ambulance:', error);
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

  const getStatusIcon = (status) => {
    const icons = {
      requested: '📍',
      assigned: '🚑',
      dispatched: '🚨',
      arrived: '✅',
      completed: '✔️'
    };
    return icons[status] || '📍';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
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

  return (
    <div className="space-y-6">
      {/* Emergency Ambulance Request */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Emergency Ambulance Service
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Request immediate ambulance assistance
            </p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white">
              <Ambulance className="h-4 w-4" />
              Request Ambulance Now
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Emergency Ambulance Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 border-t border-b border-red-200 my-4">
              {/* Emergency Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Emergency Type</label>
                <Select value={emergencyType} onValueChange={setEmergencyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select emergency type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMERGENCY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Your Location</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={getUserLocation}
                    disabled={gettingLocation}
                    className="h-7 text-xs"
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Crosshair className="h-3 w-3" />
                    )}
                    <span className="ml-1">
                      {gettingLocation ? 'Getting...' : 'Use GPS'}
                    </span>
                  </Button>
                </label>
                <Input
                  placeholder="e.g., Home address, workplace"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-red-200"
                />
                {userLat && userLng && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    GPS: {userLat.toFixed(4)}, {userLng.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium mb-2 block">Contact Number</label>
                <Input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-red-200"
                />
              </div>

              {/* Warning */}
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-300">
                  ⚠️ <span className="font-medium">For life-threatening emergencies, call 911 immediately!</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setEmergencyType('');
                  setLocation('');
                  setPhone('');
                }}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
                  onClick={handleRequestAmbulance}
                  disabled={isRequesting}
                >
                  {isRequesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Ambulance className="h-4 w-4" />
                      Request Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <p className="text-xs text-red-700 dark:text-red-300 mt-3 flex items-start gap-2">
          <Phone className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Emergency Hotline:</strong> +91 1234-567-890 (24/7)
          </span>
        </p>
      </Card>

      {/* Request History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Ambulance Request History
        </h3>

        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ambulance className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No Ambulance Requests</p>
            <p className="text-sm">Your ambulance requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(request => (
              <div
                key={request.id}
                className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-lg p-4 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="text-2xl">{getStatusIcon(request.status)}</span>
                      {request.emergency_type}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {request.pickup_location}
                    </p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-white dark:bg-slate-950 rounded border border-border text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Requested At</p>
                    <p className="font-medium">{formatDate(request.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ambulance #</p>
                    <p className="font-medium">{request.ambulance_number || 'Not assigned'}</p>
                  </div>
                </div>

                {/* Driver Info */}
                {request.driver_name && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800 mb-3">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-800 dark:text-green-300">
                          Driver: {request.driver_name}
                        </p>
                        {request.driver_phone && (
                          <p className="text-xs text-green-700 dark:text-green-400">
                            📞 {request.driver_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Map View for Active Requests */}
                {request.user_latitude && request.user_longitude && 
                 ['assigned', 'dispatched', 'arrived'].includes(request.status) && (
                  <div className="mt-3">
                    <AmbulanceMapView
                      userLat={request.user_latitude}
                      userLng={request.user_longitude}
                      ambulanceLat={request.ambulance_latitude}
                      ambulanceLng={request.ambulance_longitude}
                      pickupLocation={request.pickup_location}
                      distanceKm={request.distance_km}
                      etaMinutes={request.eta_minutes}
                      status={request.status}
                    />
                  </div>
                )}

                {/* Status Message */}
                {request.status === 'dispatched' && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      Ambulance is on the way. ETA: {request.eta_minutes || '~10'} minutes
                    </p>
                  </div>
                )}

                {request.status === 'arrived' && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                    <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-800 dark:text-green-300">
                      Ambulance has arrived at your location
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Important Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-800 dark:text-amber-300">
          ⚠️ <span className="font-medium">Important:</span> This is for non-critical emergencies. For life-threatening situations, call 911 immediately or visit the nearest emergency room.
        </p>
      </div>
    </div>
  );
}
