import React, { useEffect, useRef, useState, useCallback } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyBWjVf-wK6rdmSON8eOXJCgxq2MI10QasE"; // fallback only; prefer env

const MapComponent = ({
    startLocation,
    endLocation,
    stops = [],
    onMapReady,
    onLocationUpdate,
    onRouteCalculated,
    showAlternatives = false,
    routePreference = "balanced",
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const markersRef = useRef([]);
    const routingTimeoutRef = useRef(null);
    const lastRouteRequestRef = useRef(0);
    const lastLocationHashRef = useRef("");
    const isUpdatingRouteRef = useRef(false);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [routeInfo, setRouteInfo] = useState({
        totalDistance: 0,
        totalDuration: 0,
        segments: [],
    });
    const [hasRoutingError, setHasRoutingError] = useState(false);

    // Load Google Maps JavaScript API once
    useEffect(() => {
        const apiKey = (import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY || "").trim();

        if (!apiKey) {
            console.error("Google Maps API key missing: set VITE_GOOGLE_MAPS_API_KEY in .env");
            setHasRoutingError(true);
            return;
        }

        if (window.google && window.google.maps) {
            setMapLoaded(true);
            return;
        }

        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => setMapLoaded(true));
            return;
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapLoaded(true);
        script.onerror = () => {
            console.error("Failed to load Google Maps script");
            setHasRoutingError(true);
        };
        document.head.appendChild(script);
    }, []);

    // Initialize map once the API is ready
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 7.8731, lng: 80.7718 },
                zoom: 7.5,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                suppressMarkers: true,
                preserveViewport: true,
                polylineOptions: {
                    strokeColor: "#0955AC",
                    strokeOpacity: 0.85,
                    strokeWeight: 6,
                },
            });

            directionsRenderer.setMap(map);

            mapInstanceRef.current = map;
            directionsServiceRef.current = directionsService;
            directionsRendererRef.current = directionsRenderer;

            setIsMapReady(true);
            onMapReady?.(map);
        } catch (error) {
            console.error("Map initialization error:", error);
            setHasRoutingError(true);
        }

        return () => {
            if (routingTimeoutRef.current) {
                clearTimeout(routingTimeoutRef.current);
                routingTimeoutRef.current = null;
            }

            markersRef.current.forEach((marker) => marker?.setMap(null));
            markersRef.current = [];

            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null);
                directionsRendererRef.current = null;
            }

            directionsServiceRef.current = null;

            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, [mapLoaded, onMapReady]);

    const clearMarkers = useCallback(() => {
        markersRef.current.forEach((marker) => marker?.setMap(null));
        markersRef.current = [];
    }, []);

    const addMarker = useCallback((position, color, label, title) => {
        if (!mapInstanceRef.current || !window.google) return null;

        const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title,
            label: {
                text: label,
                color: "#FFFFFF",
                fontWeight: "700",
            },
            icon: {
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
                scale: 1.4,
                anchor: new window.google.maps.Point(12, 22),
            },
        });

        markersRef.current.push(marker);
        return marker;
    }, []);

    const renderSingleMarker = useCallback(() => {
        if (!mapInstanceRef.current) return;
        clearMarkers();

        if (startLocation?.coordinates) {
            const pos = {
                lat: startLocation.coordinates.lat,
                lng: startLocation.coordinates.lng,
            };
            addMarker(pos, "#22C55E", "S", startLocation.name || "Start");
            mapInstanceRef.current.setCenter(pos);
            mapInstanceRef.current.setZoom(13);
        } else if (endLocation?.coordinates) {
            const pos = {
                lat: endLocation.coordinates.lat,
                lng: endLocation.coordinates.lng,
            };
            addMarker(pos, "#EF4444", "E", endLocation.name || "End");
            mapInstanceRef.current.setCenter(pos);
            mapInstanceRef.current.setZoom(13);
        }

        isUpdatingRouteRef.current = false;
    }, [addMarker, clearMarkers, endLocation, startLocation]);

    const updateRoute = useCallback(() => {
        if (!mapInstanceRef.current || !directionsServiceRef.current) {
            isUpdatingRouteRef.current = false;
            return;
        }

        const hasStart = !!startLocation?.coordinates;
        const hasEnd = !!endLocation?.coordinates;

        if (!hasStart && !hasEnd) {
            clearMarkers();
            setRouteInfo({ totalDistance: 0, totalDuration: 0, segments: [] });
            isUpdatingRouteRef.current = false;
            return;
        }

        if (!(hasStart && hasEnd)) {
            directionsRendererRef.current?.set("directions", null);
            renderSingleMarker();
            setRouteInfo({ totalDistance: 0, totalDuration: 0, segments: [] });
            return;
        }

        clearMarkers();

        const request = {
            origin: {
                lat: startLocation.coordinates.lat,
                lng: startLocation.coordinates.lng,
            },
            destination: {
                lat: endLocation.coordinates.lat,
                lng: endLocation.coordinates.lng,
            },
            travelMode: window.google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: showAlternatives,
            waypoints: stops
                .filter((s) => s.coordinates)
                .map((stop) => ({
                    location: new window.google.maps.LatLng(
                        stop.coordinates.lat,
                        stop.coordinates.lng
                    ),
                    stopover: true,
                })),
            optimizeWaypoints: false,
        };

        // Preference hook retained for future use
        if (routePreference === "shortest") {
            request.drivingOptions = { departureTime: new Date() };
        }

        directionsServiceRef.current.route(request, (result, status) => {
            if (status !== window.google.maps.DirectionsStatus.OK || !result) {
                console.error("Routing error:", status);
                setHasRoutingError(true);
                directionsRendererRef.current?.set("directions", null);
                setTimeout(() => setHasRoutingError(false), 3000);
                isUpdatingRouteRef.current = false;
                return;
            }

            directionsRendererRef.current?.setDirections(result);

            const route = result.routes[0];
            const legs = route.legs || [];

            const totalDistance = legs.reduce(
                (sum, leg) => sum + (leg.distance?.value || 0),
                0
            );
            const totalDuration = legs.reduce(
                (sum, leg) => sum + (leg.duration?.value || 0),
                0
            );

            const segmentDurations = legs.map((leg) =>
                Math.round((leg.duration?.value || 0) / 60)
            );

            const bounds = new window.google.maps.LatLngBounds();
            route.overview_path?.forEach((latLng) => bounds.extend(latLng));

            // Build marker labels aligned with legs
            legs.forEach((leg, idx) => {
                if (idx === 0) {
                    addMarker(
                        leg.start_location,
                        "#22C55E",
                        "S",
                        startLocation?.name || "Start"
                    );
                }

                const isLast = idx === legs.length - 1;
                const label = isLast ? "E" : String(idx + 1);
                const color = isLast ? "#EF4444" : "#0955AC";
                const title = isLast
                    ? endLocation?.name || "End"
                    : stops[idx]?.destination || `Stop ${idx + 1}`;

                addMarker(leg.end_location, color, label, title);
            });

            if (!bounds.isEmpty()) {
                mapInstanceRef.current.fitBounds(bounds, 60);
            }

            setRouteInfo({
                totalDistance: (totalDistance / 1000).toFixed(2),
                totalDuration: Math.round(totalDuration / 60),
                segments: [],
            });

            onRouteCalculated?.(Math.round(totalDuration / 60), segmentDurations);
            setHasRoutingError(false);
            isUpdatingRouteRef.current = false;
        });
    }, [
        addMarker,
        clearMarkers,
        endLocation,
        renderSingleMarker,
        routePreference,
        showAlternatives,
        startLocation,
        stops,
        onRouteCalculated,
    ]);

    // Recalculate route when inputs change (throttled)
    useEffect(() => {
        if (!isMapReady || !mapInstanceRef.current) return;
        if (isUpdatingRouteRef.current) return;

        const locationHash = JSON.stringify({
            start: startLocation?.coordinates,
            end: endLocation?.coordinates,
            stops: stops?.map((s) => s.coordinates),
        });

        if (lastLocationHashRef.current === locationHash) return;
        lastLocationHashRef.current = locationHash;

        if (routingTimeoutRef.current) {
            clearTimeout(routingTimeoutRef.current);
        }

        const now = Date.now();
        const timeSinceLastRequest = now - lastRouteRequestRef.current;
        const minDelay = 1500;

        const executeUpdate = () => {
            if (isUpdatingRouteRef.current) return;
            isUpdatingRouteRef.current = true;
            lastRouteRequestRef.current = Date.now();
            updateRoute();
        };

        if (timeSinceLastRequest < minDelay) {
            routingTimeoutRef.current = setTimeout(
                executeUpdate,
                minDelay - timeSinceLastRequest
            );
        } else {
            executeUpdate();
        }

        return () => {
            if (routingTimeoutRef.current) {
                clearTimeout(routingTimeoutRef.current);
            }
        };
    }, [isMapReady, startLocation, endLocation, stops, updateRoute]);
    return (
        <div className="relative w-full h-full">
            <div
                ref={mapRef}
                className="w-full h-full rounded-[20px]"
                style={{ minHeight: "295px" }}
            />

            {!isMapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-[20px] z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading map...</p>
                    </div>
                </div>
            )}

            {routeInfo.totalDistance > 0 && (
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-[250px]">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                        <h3 className="font-bold text-sm text-gray-800">Route Info</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Distance:</span>
                            <span className="font-semibold text-blue-600">{routeInfo.totalDistance} km</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-semibold text-blue-600">
                                {Math.floor(routeInfo.totalDuration / 60)}h {routeInfo.totalDuration % 60}m
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {hasRoutingError && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg z-[1000] text-sm">
                    Unable to calculate route. Please try again.
                </div>
            )}
        </div>
    );
};

export default MapComponent;
