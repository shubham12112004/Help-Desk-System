import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, TrendingUp } from "lucide-react";

// Initialize Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

/**
 * AmbulanceMapView Component
 * Shows real-time map with patient location, ambulance location, and route
 * 
 * @param {Object} props
 * @param {number} props.userLat - Patient latitude
 * @param {number} props.userLng - Patient longitude
 * @param {number} props.ambulanceLat - Ambulance latitude  
 * @param {number} props.ambulanceLng - Ambulance longitude
 * @param {string} props.pickupLocation - Pickup address
 * @param {number} props.distanceKm - Distance in kilometers
 * @param {number} props.etaMinutes - Estimated time in minutes
 * @param {string} props.status - Request status
 */
export function AmbulanceMapView({
  userLat,
  userLng,
  ambulanceLat,
  ambulanceLng,
  pickupLocation,
  distanceKm,
  etaMinutes,
  status = "requested"
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const userMarker = useRef(null);
  const ambulanceMarker = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    if (!mapboxgl.accessToken) {
      console.error("Mapbox token not configured");
      return;
    }

    // Default center (India)
    const centerLng = userLng || 77.2090;
    const centerLat = userLat || 28.6139;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerLng, centerLat],
      zoom: 13
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

  // Update user marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLat || !userLng) return;

    // Remove old marker
    if (userMarker.current) {
      userMarker.current.remove();
    }

    // Create patient location marker (red)
    const el = document.createElement("div");
    el.className = "user-marker";
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.backgroundImage = "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2VmNDQ0NCIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMiIgZmlsbD0iI2VmNDQ0NCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IndoaXRlIi8+PC9zdmc+)";
    el.style.backgroundSize = "contain";
    el.style.cursor = "pointer";

    userMarker.current = new mapboxgl.Marker(el)
      .setLngLat([userLng, userLat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong style="color: #ef4444;">Patient Location</strong>
              <p style="margin: 4px 0 0; font-size: 12px;">${pickupLocation || "Pickup Location"}</p>
            </div>
          `)
      )
      .addTo(map.current);

    // Center map on user location
    map.current.flyTo({
      center: [userLng, userLat],
      zoom: 13,
      duration: 1000
    });
  }, [userLat, userLng, pickupLocation, mapLoaded]);

  // Update ambulance marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !ambulanceLat || !ambulanceLng) return;

    // Remove old marker
    if (ambulanceMarker.current) {
      ambulanceMarker.current.remove();
    }

    // Create ambulance marker (blue with pulse animation)
    const el = document.createElement("div");
    el.className = "ambulance-marker";
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.backgroundImage = "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzM4OTVmZiIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMiIgZmlsbD0iIzM4OTVmZiIvPjxwYXRoIGQ9Ik0xOCAxNEgxNlYxOEgxMlYyMEgxNlYyNEgxOFYyMEgyMlYxOEgxOFYxNFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+)";
    el.style.backgroundSize = "contain";
    el.style.cursor = "pointer";
    el.style.animation = "pulse 2s infinite";

    ambulanceMarker.current = new mapboxgl.Marker(el)
      .setLngLat([ambulanceLng, ambulanceLat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong style="color: #3b82f6;">🚑 Ambulance</strong>
              <p style="margin: 4px 0 0; font-size: 12px;">Status: ${status}</p>
              ${etaMinutes ? `<p style="margin: 4px 0 0; font-size: 12px;">ETA: ${etaMinutes} min</p>` : ""}
            </div>
          `)
      )
      .addTo(map.current);

    // If both markers exist, fit bounds to show both
    if (userLat && userLng && ambulanceLat && ambulanceLng) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([userLng, userLat]);
      bounds.extend([ambulanceLng, ambulanceLat]);
      
      map.current.fitBounds(bounds, {
        padding: 80,
        duration: 1000
      });
    }
  }, [ambulanceLat, ambulanceLng, status, etaMinutes, mapLoaded, userLat, userLng]);

  // Draw route line between user and ambulance
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLat || !userLng || !ambulanceLat || !ambulanceLng) return;

    const routeId = "ambulance-route";
    
    // Remove existing route
    if (map.current.getLayer(routeId)) {
      map.current.removeLayer(routeId);
    }
    if (map.current.getSource(routeId)) {
      map.current.removeSource(routeId);
    }

    // Add route line
    map.current.addSource(routeId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [userLng, userLat],
            [ambulanceLng, ambulanceLat]
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
        "line-width": 3,
        "line-dasharray": [2, 2]
      }
    });
  }, [userLat, userLng, ambulanceLat, ambulanceLng, mapLoaded]);

  const hasLocation = userLat && userLng;
  const hasAmbulanceLocation = ambulanceLat && ambulanceLng;

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="overflow-hidden">
        <div
          ref={mapContainer}
          className="w-full h-[400px] bg-muted"
        />
        
        {!mapboxgl.accessToken && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Map not configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add VITE_MAPBOX_TOKEN to .env file
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* User Location */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <MapPin className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Patient Location</p>
              <p className="text-sm font-semibold truncate mt-1">{pickupLocation || "Not set"}</p>
              {hasLocation && (
                <p className="text-xs text-muted-foreground mt-1">
                  {userLat.toFixed(4)}, {userLng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Distance */}
        {distanceKm && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Distance</p>
                <p className="text-sm font-semibold mt-1">{distanceKm.toFixed(1)} km</p>
              </div>
            </div>
          </Card>
        )}

        {/* ETA */}
        {etaMinutes && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">ETA</p>
                <p className="text-sm font-semibold mt-1">{etaMinutes} minutes</p>
              </div>
            </div>
          </Card>
        )}

        {/* Ambulance Status */}
        {hasAmbulanceLocation && (
          <Card className="p-4 md:col-span-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Navigation className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Ambulance Location</p>
                  <p className="text-sm font-semibold mt-1">
                    {ambulanceLat.toFixed(4)}, {ambulanceLng.toFixed(4)}
                  </p>
                </div>
              </div>
              <Badge variant={status === "arrived" ? "success" : "default"}>
                {status}
              </Badge>
            </div>
          </Card>
        )}
      </div>

      {/* Pulse animation for ambulance marker */}
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
