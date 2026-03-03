import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, TrendingUp, ExternalLink } from "lucide-react";

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
  request,
  userLat,
  userLng,
  ambulanceLat,
  ambulanceLng,
  pickupLocation,
  distanceKm,
  etaMinutes,
  status = "requested"
}) {
  const resolvedUserLat = Number(request?.user_latitude ?? userLat);
  const resolvedUserLng = Number(request?.user_longitude ?? userLng);
  const resolvedAmbulanceLat = Number(request?.ambulance_latitude ?? ambulanceLat);
  const resolvedAmbulanceLng = Number(request?.ambulance_longitude ?? ambulanceLng);
  const resolvedPickupLocation = request?.pickup_location || pickupLocation;
  const resolvedStatus = request?.status || status;

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (![lat1, lon1, lat2, lon2].every((value) => Number.isFinite(value))) return null;
    const earthRadiusKm = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const resolvedDistanceKm =
    Number.isFinite(Number(request?.distance_km ?? distanceKm))
      ? Number(request?.distance_km ?? distanceKm)
      : calculateDistanceKm(resolvedUserLat, resolvedUserLng, resolvedAmbulanceLat, resolvedAmbulanceLng);

  const resolvedEtaMinutes =
    Number.isFinite(Number(request?.eta_minutes ?? etaMinutes))
      ? Number(request?.eta_minutes ?? etaMinutes)
      : resolvedDistanceKm
      ? Math.max(2, Math.round(resolvedDistanceKm * 3))
      : null;

  const [simulatedAmbulancePos, setSimulatedAmbulancePos] = useState(() => {
    if (Number.isFinite(resolvedAmbulanceLat) && Number.isFinite(resolvedAmbulanceLng)) {
      return { lat: resolvedAmbulanceLat, lng: resolvedAmbulanceLng };
    }
    if (Number.isFinite(resolvedUserLat) && Number.isFinite(resolvedUserLng)) {
      return {
        lat: resolvedUserLat + 0.018,
        lng: resolvedUserLng + 0.018,
      };
    }
    return null;
  });

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const userMarker = useRef(null);
  const ambulanceMarker = useRef(null);

  useEffect(() => {
    if (Number.isFinite(resolvedAmbulanceLat) && Number.isFinite(resolvedAmbulanceLng)) {
      setSimulatedAmbulancePos({ lat: resolvedAmbulanceLat, lng: resolvedAmbulanceLng });
      return;
    }

    if (Number.isFinite(resolvedUserLat) && Number.isFinite(resolvedUserLng)) {
      setSimulatedAmbulancePos((current) =>
        current || {
          lat: resolvedUserLat + 0.018,
          lng: resolvedUserLng + 0.018,
        }
      );
    }
  }, [resolvedAmbulanceLat, resolvedAmbulanceLng, resolvedUserLat, resolvedUserLng]);

  useEffect(() => {
    const isActiveTrip = ["assigned", "dispatched"].includes(String(resolvedStatus).toLowerCase());
    const hasPatient = Number.isFinite(resolvedUserLat) && Number.isFinite(resolvedUserLng);

    if (!isActiveTrip || !hasPatient || !simulatedAmbulancePos) {
      return;
    }

    const intervalId = setInterval(() => {
      setSimulatedAmbulancePos((current) => {
        if (!current) return current;

        const latDelta = resolvedUserLat - current.lat;
        const lngDelta = resolvedUserLng - current.lng;
        const distance = Math.sqrt(latDelta * latDelta + lngDelta * lngDelta);

        if (distance < 0.00035) {
          return { lat: resolvedUserLat, lng: resolvedUserLng };
        }

        const stepFactor = 0.18;
        return {
          lat: current.lat + latDelta * stepFactor,
          lng: current.lng + lngDelta * stepFactor,
        };
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [resolvedStatus, resolvedUserLat, resolvedUserLng, simulatedAmbulancePos]);

  const effectiveAmbulanceLat = Number.isFinite(resolvedAmbulanceLat)
    ? resolvedAmbulanceLat
    : simulatedAmbulancePos?.lat;
  const effectiveAmbulanceLng = Number.isFinite(resolvedAmbulanceLng)
    ? resolvedAmbulanceLng
    : simulatedAmbulancePos?.lng;

  const liveDistanceKm = calculateDistanceKm(
    resolvedUserLat,
    resolvedUserLng,
    effectiveAmbulanceLat,
    effectiveAmbulanceLng
  );

  const effectiveDistanceKm = Number.isFinite(liveDistanceKm)
    ? liveDistanceKm
    : resolvedDistanceKm;

  const effectiveEtaMinutes = Number.isFinite(effectiveDistanceKm)
    ? Math.max(1, Math.round(effectiveDistanceKm * 3))
    : resolvedEtaMinutes;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    if (!mapboxgl.accessToken) {
      console.error("Mapbox token not configured");
      return;
    }

    // Default center (India)
    const centerLng = resolvedUserLng || 77.2090;
    const centerLat = resolvedUserLat || 28.6139;

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
  }, [resolvedUserLat, resolvedUserLng]);

  // Update user marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !resolvedUserLat || !resolvedUserLng) return;

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
      .setLngLat([resolvedUserLng, resolvedUserLat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong style="color: #ef4444;">Patient Location</strong>
              <p style="margin: 4px 0 0; font-size: 12px;">${resolvedPickupLocation || "Pickup Location"}</p>
            </div>
          `)
      )
      .addTo(map.current);

    // Center map on user location
    map.current.flyTo({
      center: [resolvedUserLng, resolvedUserLat],
      zoom: 13,
      duration: 1000
    });
  }, [resolvedUserLat, resolvedUserLng, resolvedPickupLocation, mapLoaded]);

  // Update ambulance marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !effectiveAmbulanceLat || !effectiveAmbulanceLng) return;

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
      .setLngLat([effectiveAmbulanceLng, effectiveAmbulanceLat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong style="color: #3b82f6;">🚑 Ambulance</strong>
              <p style="margin: 4px 0 0; font-size: 12px;">Status: ${resolvedStatus}</p>
              ${effectiveEtaMinutes ? `<p style="margin: 4px 0 0; font-size: 12px;">ETA: ${effectiveEtaMinutes} min</p>` : ""}
            </div>
          `)
      )
      .addTo(map.current);

    // If both markers exist, fit bounds to show both
    if (resolvedUserLat && resolvedUserLng && effectiveAmbulanceLat && effectiveAmbulanceLng) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([resolvedUserLng, resolvedUserLat]);
      bounds.extend([effectiveAmbulanceLng, effectiveAmbulanceLat]);
      
      map.current.fitBounds(bounds, {
        padding: 80,
        duration: 1000
      });
    }
  }, [effectiveAmbulanceLat, effectiveAmbulanceLng, resolvedStatus, effectiveEtaMinutes, mapLoaded, resolvedUserLat, resolvedUserLng]);

  // Draw route line between user and ambulance
  useEffect(() => {
    if (!map.current || !mapLoaded || !resolvedUserLat || !resolvedUserLng || !effectiveAmbulanceLat || !effectiveAmbulanceLng) return;

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
            [resolvedUserLng, resolvedUserLat],
            [effectiveAmbulanceLng, effectiveAmbulanceLat]
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
  }, [resolvedUserLat, resolvedUserLng, effectiveAmbulanceLat, effectiveAmbulanceLng, mapLoaded]);

  const hasLocation = Number.isFinite(resolvedUserLat) && Number.isFinite(resolvedUserLng);
  const hasAmbulanceLocation = Number.isFinite(effectiveAmbulanceLat) && Number.isFinite(effectiveAmbulanceLng);
  const mapCenterLat = hasAmbulanceLocation ? (resolvedUserLat + effectiveAmbulanceLat) / 2 : resolvedUserLat;
  const mapCenterLng = hasAmbulanceLocation ? (resolvedUserLng + effectiveAmbulanceLng) / 2 : resolvedUserLng;
  const googleDirectionsUrl = hasAmbulanceLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${effectiveAmbulanceLat},${effectiveAmbulanceLng}&destination=${resolvedUserLat},${resolvedUserLng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${resolvedUserLat},${resolvedUserLng}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${resolvedUserLat}&mlon=${resolvedUserLng}#map=15/${resolvedUserLat}/${resolvedUserLng}`;
  const osmEmbedUrl = hasLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenterLng - 0.02}%2C${mapCenterLat - 0.02}%2C${mapCenterLng + 0.02}%2C${mapCenterLat + 0.02}&layer=mapnik&marker=${resolvedUserLat}%2C${resolvedUserLng}`
    : null;

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="overflow-hidden">
        {mapboxgl.accessToken ? (
          <div
            ref={mapContainer}
            className="w-full h-[320px] bg-muted"
          />
        ) : hasLocation ? (
          <iframe
            title="Ambulance OpenStreetMap View"
            src={osmEmbedUrl}
            className="w-full h-[320px] border-0"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-[320px] bg-muted flex items-center justify-center" />
        )}
        
        {!mapboxgl.accessToken && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Map token not configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Showing OpenStreetMap fallback instead
              </p>
            </div>
          </div>
        )}
      </Card>

      {hasLocation && (
        <div className="flex flex-wrap gap-2">
          <a href={googleDirectionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-accent">
            <Navigation className="h-4 w-4" />
            Open Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
          <a href={openStreetMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-accent">
            <MapPin className="h-4 w-4" />
            Open OpenStreetMap
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

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
              <p className="text-sm font-semibold truncate mt-1">{resolvedPickupLocation || "Not set"}</p>
              {hasLocation && (
                <p className="text-xs text-muted-foreground mt-1">
                  {resolvedUserLat.toFixed(4)}, {resolvedUserLng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Distance */}
        {effectiveDistanceKm && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Distance</p>
                <p className="text-sm font-semibold mt-1">{effectiveDistanceKm.toFixed(1)} km</p>
              </div>
            </div>
          </Card>
        )}

        {/* ETA */}
        {effectiveEtaMinutes && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">ETA</p>
                <p className="text-sm font-semibold mt-1">{effectiveEtaMinutes} minutes</p>
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
                    {effectiveAmbulanceLat.toFixed(4)}, {effectiveAmbulanceLng.toFixed(4)}
                  </p>
                </div>
              </div>
              <Badge variant={resolvedStatus === "arrived" ? "success" : "default"}>
                {resolvedStatus}
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
