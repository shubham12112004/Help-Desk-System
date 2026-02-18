import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ambulance, MapPin, Clock, Phone, User, Navigation, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StaffAmbulanceActions } from "@/components/StaffAmbulanceActions";

// Initialize Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

/**
 * AdminAmbulanceMonitor Component
 * Real-time dashboard for monitoring all ambulance requests and locations
 * Shows all active ambulances on a single map with status indicators
 */
export function AdminAmbulanceMonitor() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const markers = useRef({});

  // Load all ambulance requests
  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('ambulance_requests')
        .select(`
          *,
          patient:patient_id(id, email, raw_user_meta_data)
        `)
        .in('status', ['requested', 'assigned', 'dispatched', 'arrived'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load ambulance requests');
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    if (!mapboxgl.accessToken) {
      console.error("Mapbox token not configured");
      setLoading(false);
      return;
    }

    // Center on India
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.2090, 28.6139], // Delhi
      zoom: 5
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    
    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadRequests();
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-ambulances')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ambulance_requests'
        },
        (payload) => {
          console.log('Ambulance update:', payload);
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update map markers when requests change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear old markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add markers for each request
    requests.forEach(request => {
      // User/Patient marker (red)
      if (request.user_latitude && request.user_longitude) {
        const userEl = document.createElement("div");
        userEl.className = "user-marker";
        userEl.style.width = "30px";
        userEl.style.height = "30px";
        userEl.style.backgroundImage = "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMyIgZmlsbD0iI2VmNDQ0NCIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSI4IiBmaWxsPSIjZWY0NDQ0Ii8+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iNCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=)";
        userEl.style.backgroundSize = "contain";
        userEl.style.cursor = "pointer";

        const patientName = request.patient?.raw_user_meta_data?.full_name || request.patient?.email || "Patient";

        const userMarker = new mapboxgl.Marker(userEl)
          .setLngLat([request.user_longitude, request.user_latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px; min-width: 200px;">
                  <strong style="color: #ef4444;">👤 ${patientName}</strong>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Type:</strong> ${request.emergency_type}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Location:</strong> ${request.pickup_location}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${request.status}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Contact:</strong> ${request.contact_number}</p>
                </div>
              `)
          )
          .addTo(map.current);

        markers.current[`user-${request.id}`] = userMarker;

        userEl.addEventListener('click', () => {
          setSelectedRequest(request);
        });
      }

      // Ambulance marker (blue with pulse) - only if location available
      if (request.ambulance_latitude && request.ambulance_longitude) {
        const ambulanceEl = document.createElement("div");
        ambulanceEl.className = "ambulance-marker";
        ambulanceEl.style.width = "35px";
        ambulanceEl.style.height = "35px";
        ambulanceEl.style.backgroundImage = "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUiIGhlaWdodD0iMzUiIHZpZXdCb3g9IjAgMCAzNSAzNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNy41IiBjeT0iMTcuNSIgcj0iMTUiIGZpbGw9IiMzODk1ZmYiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iMTcuNSIgY3k9IjE3LjUiIHI9IjEwIiBmaWxsPSIjMzg5NWZmIi8+PHBhdGggZD0iTTE1IDEySDEzVjE1SDEwVjE3SDEzVjIwSDE1VjE3SDE4VjE1SDE1VjEyWiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=)";
        ambulanceEl.style.backgroundSize = "contain";
        ambulanceEl.style.cursor = "pointer";
        ambulanceEl.style.animation = "pulse 2s infinite";

        const ambulanceMarker = new mapboxgl.Marker(ambulanceEl)
          .setLngLat([request.ambulance_longitude, request.ambulance_latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px; min-width: 200px;">
                  <strong style="color: #3b82f6;">🚑 Ambulance #${request.ambulance_number || 'N/A'}</strong>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Driver:</strong> ${request.driver_name || 'Not assigned'}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${request.status}</p>
                  ${request.eta_minutes ? `<p style="margin: 4px 0; font-size: 12px;"><strong>ETA:</strong> ${request.eta_minutes} min</p>` : ''}
                  ${request.distance_km ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Distance:</strong> ${request.distance_km.toFixed(1)} km</p>` : ''}
                </div>
              `)
          )
          .addTo(map.current);

        markers.current[`ambulance-${request.id}`] = ambulanceMarker;

        ambulanceEl.addEventListener('click', () => {
          setSelectedRequest(request);
        });

        // Draw route if both locations available
        if (request.user_latitude && request.user_longitude) {
          const routeId = `route-${request.id}`;
          
          if (map.current.getLayer(routeId)) {
            map.current.removeLayer(routeId);
          }
          if (map.current.getSource(routeId)) {
            map.current.removeSource(routeId);
          }

          map.current.addSource(routeId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [request.user_longitude, request.user_latitude],
                  [request.ambulance_longitude, request.ambulance_latitude]
                ]
              }
            }
          });

          map.current.addLayer({
            id: routeId,
            type: "line",
            source: routeId,
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 2,
              "line-dasharray": [2, 2]
            }
          });
        }
      }
    });

    // Fit bounds to show all markers
    if (requests.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasCoords = false;

      requests.forEach(request => {
        if (request.user_latitude && request.user_longitude) {
          bounds.extend([request.user_longitude, request.user_latitude]);
          hasCoords = true;
        }
        if (request.ambulance_latitude && request.ambulance_longitude) {
          bounds.extend([request.ambulance_longitude, request.ambulance_latitude]);
          hasCoords = true;
        }
      });

      if (hasCoords) {
        map.current.fitBounds(bounds, {
          padding: 80,
          duration: 1000,
          maxZoom: 13
        });
      }
    }
  }, [requests, mapLoaded]);

  const getStatusBadge = (status) => {
    const variants = {
      requested: "destructive",
      assigned: "default",
      dispatched: "secondary",
      arrived: "success"
    };
    return variants[status] || "default";
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'text-red-600',
      assigned: 'text-orange-600',
      dispatched: 'text-yellow-600',
      arrived: 'text-green-600',
      completed: 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  if (!mapboxgl.accessToken) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">Mapbox Not Configured</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add VITE_MAPBOX_TOKEN to .env file
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ambulance Monitoring</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time tracking of all active ambulance requests
          </p>
        </div>
        <Button onClick={loadRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Ambulance className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requests.filter(r => r.status === 'requested').length}</p>
              <p className="text-xs text-muted-foreground">Requested</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Navigation className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requests.filter(r => r.status === 'assigned').length}</p>
              <p className="text-xs text-muted-foreground">Assigned</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requests.filter(r => r.status === 'dispatched').length}</p>
              <p className="text-xs text-muted-foreground">En Route</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Ambulance className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requests.filter(r => r.status === 'arrived').length}</p>
              <p className="text-xs text-muted-foreground">Arrived</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Map + Requests Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div
              ref={mapContainer}
              className="w-full h-[600px] bg-muted"
            />
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Active Requests</h3>
          
          {loading ? (
            <Card className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </Card>
          ) : requests.length === 0 ? (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <Ambulance className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active requests</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {requests.map(request => {
                const patientName = request.patient?.raw_user_meta_data?.full_name || request.patient?.email || "Unknown";
                
                return (
                  <Card
                    key={request.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedRequest?.id === request.id 
                        ? 'ring-2 ring-primary' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {patientName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.emergency_type}
                        </p>
                      </div>
                      <Badge variant={getStatusBadge(request.status)} className="text-xs">
                        {request.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {request.pickup_location}
                      </div>
                      {request.contact_number && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {request.contact_number}
                        </div>
                      )}
                      {request.ambulance_number && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Ambulance className="h-3 w-3" />
                          #{request.ambulance_number} - {request.driver_name || 'No driver'}
                        </div>
                      )}
                      {request.eta_minutes && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Clock className="h-3 w-3" />
                          ETA: {request.eta_minutes} min
                        </div>
                      )}
                    </div>
                    
                    {/* Staff Actions Button */}
                    <div className="mt-3">
                      <StaffAmbulanceActions
                        request={request}
                        onUpdate={loadRequests}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
