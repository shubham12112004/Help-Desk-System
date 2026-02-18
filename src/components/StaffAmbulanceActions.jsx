import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ambulance, MapPin, User, Phone, Clock, Navigation, Loader2, Crosshair } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * StaffAmbulanceActions Component
 * Allows staff to accept requests, assign ambulances, and update locations
 * 
 * @param {Object} props
 * @param {Object} props.request - Ambulance request object
 * @param {Function} props.onUpdate - Callback after update
 */
export function StaffAmbulanceActions({ request, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    status: request.status || 'assigned',
    ambulance_number: request.ambulance_number || '',
    driver_name: request.driver_name || '',
    driver_contact: request.driver_contact || '',
    ambulance_latitude: request.ambulance_latitude || null,
    ambulance_longitude: request.ambulance_longitude || null,
    eta_minutes: request.eta_minutes || '',
    distance_km: request.distance_km || ''
  });

  // Get current GPS location for ambulance
  const getAmbulanceLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          ambulance_latitude: position.coords.latitude,
          ambulance_longitude: position.coords.longitude
        }));
        setGettingLocation(false);
        toast.success('Ambulance location captured!');
        
        // Auto-calculate distance and ETA if user location available
        if (request.user_latitude && request.user_longitude) {
          calculateDistanceAndETA(
            request.user_latitude,
            request.user_longitude,
            position.coords.latitude,
            position.coords.longitude
          );
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
        toast.error('Failed to get location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Calculate distance using Haversine formula
  const calculateDistanceAndETA = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Estimate ETA (assuming 40 km/h average speed with traffic)
    const avgSpeed = 40;
    const eta = Math.ceil((distance / avgSpeed) * 60);
    
    setFormData(prev => ({
      ...prev,
      distance_km: distance.toFixed(2),
      eta_minutes: eta
    }));
    
    toast.success(`Distance: ${distance.toFixed(1)} km, ETA: ${eta} min`);
  };

  const handleUpdate = async () => {
    if (!formData.ambulance_number || !formData.driver_name) {
      toast.error('Please provide ambulance number and driver name');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        status: formData.status,
        ambulance_number: formData.ambulance_number,
        driver_name: formData.driver_name,
        driver_contact: formData.driver_contact,
        ambulance_latitude: formData.ambulance_latitude,
        ambulance_longitude: formData.ambulance_longitude,
        last_location_update: new Date().toISOString(),
        eta_minutes: formData.eta_minutes ? parseInt(formData.eta_minutes) : null,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null
      };

      const { error } = await supabase
        .from('ambulance_requests')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;

      toast.success(`Ambulance request updated to ${formData.status}`);
      setIsOpen(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating ambulance:', error);
      toast.error('Failed to update ambulance request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-red-100 dark:bg-red-900/30',
      assigned: 'bg-orange-100 dark:bg-orange-900/30',
      dispatched: 'bg-yellow-100 dark:bg-yellow-900/30',
      arrived: 'bg-green-100 dark:bg-green-900/30',
      completed: 'bg-gray-100 dark:bg-gray-900/30'
    };
    return colors[status] || colors.requested;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Ambulance className="h-4 w-4 mr-2" />
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ambulance className="h-5 w-5 text-primary" />
            Manage Ambulance Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient Info */}
          <Card className="p-4 bg-muted">
            <h4 className="font-semibold mb-3 text-sm">Patient Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Emergency Type</p>
                <p className="font-medium">{request.emergency_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pickup Location</p>
                <p className="font-medium">{request.pickup_location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="font-medium">{request.contact_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Request Time</p>
                <p className="font-medium">
                  {new Date(request.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            {request.user_latitude && request.user_longitude && (
              <div className="mt-3 p-2 bg-background rounded border">
                <p className="text-xs text-muted-foreground">Patient GPS:</p>
                <p className="text-xs font-mono">
                  {request.user_latitude.toFixed(6)}, {request.user_longitude.toFixed(6)}
                </p>
              </div>
            )}
          </Card>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="status" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested (Pending)</SelectItem>
                <SelectItem value="assigned">Assigned (Ambulance Ready)</SelectItem>
                <SelectItem value="dispatched">Dispatched (En Route)</SelectItem>
                <SelectItem value="arrived">Arrived (On Scene)</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ambulance Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ambulance_number">Ambulance Number *</Label>
              <div className="flex items-center gap-2 mt-2">
                <Ambulance className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="ambulance_number"
                  placeholder="e.g., AMB-1234"
                  value={formData.ambulance_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, ambulance_number: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="driver_name">Driver Name *</Label>
              <div className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="driver_name"
                  placeholder="Driver's full name"
                  value={formData.driver_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, driver_name: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Driver Contact */}
          <div>
            <Label htmlFor="driver_contact">Driver Contact</Label>
            <div className="flex items-center gap-2 mt-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input
                id="driver_contact"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.driver_contact}
                onChange={(e) => setFormData(prev => ({ ...prev, driver_contact: e.target.value }))}
              />
            </div>
          </div>

          {/* Ambulance Location */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Ambulance Location</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={getAmbulanceLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Crosshair className="h-4 w-4 mr-2" />
                )}
                {gettingLocation ? 'Getting Location...' : 'Get Current Location'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lat" className="text-xs">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.000001"
                  placeholder="28.123456"
                  value={formData.ambulance_latitude || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ambulance_latitude: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lng" className="text-xs">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.000001"
                  placeholder="77.123456"
                  value={formData.ambulance_longitude || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ambulance_longitude: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
            {formData.ambulance_latitude && formData.ambulance_longitude && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location set successfully
              </p>
            )}
          </div>

          {/* Distance and ETA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distance">Distance (km)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  placeholder="Auto-calculated"
                  value={formData.distance_km}
                  onChange={(e) => setFormData(prev => ({ ...prev, distance_km: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="eta">ETA (minutes)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="eta"
                  type="number"
                  placeholder="Auto-calculated"
                  value={formData.eta_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, eta_minutes: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Status Preview */}
          <div className={`p-4 rounded-lg ${getStatusColor(formData.status)}`}>
            <p className="text-sm font-medium">
              Status will be updated to: <span className="uppercase">{formData.status}</span>
            </p>
            {formData.ambulance_latitude && formData.ambulance_longitude && (
              <p className="text-xs mt-2">
                Location will be updated and visible on patient's map
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
