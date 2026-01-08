import React, { useEffect, useRef, useState, useCallback } from "react";

const MapComponent = ({ 
    startLocation, 
    endLocation, 
    stops = [], 
    onMapReady,
    onLocationUpdate,
    onRouteCalculated,
    showAlternatives = false,
    routePreference = 'balanced'
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routingControlRef = useRef(null);
    const markersRef = useRef([]);
    const routingTimeoutRef = useRef(null);
    const lastRouteRequestRef = useRef(0);
    const lastLocationHashRef = useRef('');
    const isUpdatingRouteRef = useRef(false);
    
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [routeInfo, setRouteInfo] = useState({
        totalDistance: 0,
        totalDuration: 0,
        segments: []
    });
    const [hasRoutingError, setHasRoutingError] = useState(false);

    // Load Leaflet libraries
    useEffect(() => {
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        if (!window.L) {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = () => {
                const routingScript = document.createElement("script");
                routingScript.src = "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js";
                routingScript.onload = () => setMapLoaded(true);
                document.head.appendChild(routingScript);

                const routingCSS = document.createElement("link");
                routingCSS.rel = "stylesheet";
                routingCSS.href = "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css";
                document.head.appendChild(routingCSS);
            };
            document.head.appendChild(script);
        } else if (window.L.Routing) {
            setMapLoaded(true);
        } else {
            const routingScript = document.createElement("script");
            routingScript.src = "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js";
            routingScript.onload = () => setMapLoaded(true);
            document.head.appendChild(routingScript);
        }

        const style = document.createElement('style');
        style.id = 'leaflet-custom-styles';
        style.innerHTML = `
            .leaflet-routing-container {
                display: none !important;
            }
            .leaflet-routing-alternatives-container {
                display: none !important;
            }
            .custom-popup .leaflet-popup-content-wrapper {
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
        `;
        if (!document.getElementById('leaflet-custom-styles')) {
            document.head.appendChild(style);
        }

        return () => {
            const existingStyle = document.getElementById('leaflet-custom-styles');
            if (existingStyle && existingStyle.parentNode) {
                existingStyle.parentNode.removeChild(existingStyle);
            }
        };
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

        try {
            const map = window.L.map(mapRef.current, {
                center: [7.8731, 80.7718],
                zoom: 8,
                zoomControl: true,
                maxZoom: 19,
                minZoom: 6,
                zoomAnimation: true,
                markerZoomAnimation: true,
            });

            window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            mapInstanceRef.current = map;

            map.whenReady(() => {
                setTimeout(() => {
                    map.invalidateSize();
                    setIsMapReady(true);
                    if (onMapReady) onMapReady(map);
                }, 200);
            });
        } catch (error) {
            console.error('Map initialization error:', error);
        }

        return () => {
            if (routingTimeoutRef.current) {
                clearTimeout(routingTimeoutRef.current);
                routingTimeoutRef.current = null;
            }

            if (routingControlRef.current && mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.removeControl(routingControlRef.current);
                } catch (e) {
                    console.warn('Error removing routing control:', e);
                }
                routingControlRef.current = null;
            }

            markersRef.current.forEach((marker) => {
                try {
                    if (marker && mapInstanceRef.current) {
                        mapInstanceRef.current.removeLayer(marker);
                    }
                } catch (e) {
                    console.warn('Error removing marker:', e);
                }
            });
            markersRef.current = [];

            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (e) {
                    console.warn('Error removing map:', e);
                }
                mapInstanceRef.current = null;
            }
        };
    }, [mapLoaded, onMapReady]);

    // Clear route and markers helper
    const clearRouteAndMarkers = useCallback(() => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;

        if (routingControlRef.current) {
            try {
                map.removeControl(routingControlRef.current);
            } catch (e) {
                console.warn('Error removing routing control:', e);
            }
            routingControlRef.current = null;
        }

        markersRef.current.forEach((marker) => {
            try {
                if (marker && marker._map) {
                    map.removeLayer(marker);
                }
            } catch (e) {
                console.warn('Error removing marker:', e);
            }
        });
        markersRef.current = [];
    }, []);

    // Update route effect
    useEffect(() => {
        if (!isMapReady || !mapInstanceRef.current) return;
        if (isUpdatingRouteRef.current) return;

        const locationHash = JSON.stringify({
            start: startLocation?.coordinates,
            end: endLocation?.coordinates,
            stops: stops?.map(s => s.coordinates)
        });

        if (lastLocationHashRef.current === locationHash) return;

        lastLocationHashRef.current = locationHash;

        if (routingTimeoutRef.current) {
            clearTimeout(routingTimeoutRef.current);
        }

        const now = Date.now();
        const timeSinceLastRequest = now - lastRouteRequestRef.current;
        const minDelay = 2000;

        const executeUpdate = () => {
            if (isUpdatingRouteRef.current) return;
            isUpdatingRouteRef.current = true;
            lastRouteRequestRef.current = Date.now();
            updateRoute();
        };

        if (timeSinceLastRequest < minDelay) {
            routingTimeoutRef.current = setTimeout(executeUpdate, minDelay - timeSinceLastRequest);
        } else {
            executeUpdate();
        }

        return () => {
            if (routingTimeoutRef.current) {
                clearTimeout(routingTimeoutRef.current);
            }
        };
    }, [isMapReady, startLocation, endLocation, stops]);

    // Update route function
    const updateRoute = useCallback(() => {
        if (!mapInstanceRef.current || hasRoutingError) {
            isUpdatingRouteRef.current = false;
            return;
        }

        const map = mapInstanceRef.current;
        clearRouteAndMarkers();

        try {
            if (startLocation?.coordinates && endLocation?.coordinates) {
                const waypoints = [
                    window.L.latLng(startLocation.coordinates.lat, startLocation.coordinates.lng)
                ];

                if (stops && stops.length > 0) {
                    stops.forEach((stop) => {
                        if (stop.coordinates) {
                            waypoints.push(window.L.latLng(stop.coordinates.lat, stop.coordinates.lng));
                        }
                    });
                }

                waypoints.push(window.L.latLng(endLocation.coordinates.lat, endLocation.coordinates.lng));

                const routingControl = window.L.Routing.control({
                    waypoints: waypoints,
                    routeWhileDragging: false,
                    addWaypoints: false,
                    draggableWaypoints: false,
                    fitSelectedRoutes: true,
                    showAlternatives: false,
                    lineOptions: {
                        styles: [{
                            color: "#0955AC",
                            opacity: 0.8,
                            weight: 6,
                        }],
                        extendToWaypoints: true,
                        missingRouteTolerance: 1
                    },
                    show: false,
                    router: window.L.Routing.osrmv1({
                        serviceUrl: 'https://router.project-osrm.org/route/v1',
                        profile: 'driving',
                        timeout: 30000,
                        suppressDemoServerWarning: true,
                    }),
                    createMarker: function (i, waypoint, n) {
                        let markerColor, label;

                        if (i === 0) {
                            markerColor = "#22C55E";
                            label = "S";
                        } else if (i === n - 1) {
                            markerColor = "#EF4444";
                            label = "E";
                        } else {
                            markerColor = "#0955AC";
                            label = i.toString();
                        }

                        const markerIcon = window.L.divIcon({
                            className: "custom-marker",
                            html: `
                                <div style="
                                    background-color: ${markerColor};
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 50% 50% 50% 0;
                                    transform: rotate(-45deg);
                                    border: 3px solid white;
                                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">
                                    <span style="
                                        transform: rotate(45deg);
                                        color: white;
                                        font-weight: bold;
                                        font-size: 14px;
                                    ">${label}</span>
                                </div>
                            `,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                        });

                        const marker = window.L.marker(waypoint.latLng, {
                            icon: markerIcon,
                            draggable: false,
                        });

                        const locationName = i === 0
                            ? startLocation.name
                            : i === n - 1
                            ? endLocation.name
                            : stops[i - 1]?.destination || `Stop ${i}`;

                        marker.bindPopup(`
                            <div style="min-width: 150px;">
                                <b style="color: ${markerColor}; font-size: 14px;">
                                    ${i === 0 ? "Start" : i === n - 1 ? "End" : `Stop ${i}`}
                                </b><br>
                                <span style="font-size: 12px; color: #666;">${locationName}</span>
                            </div>
                        `, {
                            maxWidth: 200,
                            className: 'custom-popup'
                        });

                        markersRef.current.push(marker);
                        return marker;
                    },
                });

                routingControl.on('routesfound', function(e) {
                    const routes = e.routes;
                    const mainRoute = routes[0];

                    const totalDistance = (mainRoute.summary.totalDistance / 1000).toFixed(2);
                    const totalDuration = Math.round(mainRoute.summary.totalTime / 60);

                    const segments = [];
                    const segmentDurations = [];
                    let currentSegmentDuration = 0;
                    let waypointIndex = 0;

                    for (let i = 0; i < mainRoute.instructions.length; i++) {
                        const instruction = mainRoute.instructions[i];

                        if (instruction.type === 'WaypointReached' && waypointIndex < mainRoute.waypoints.length - 1) {
                            segmentDurations.push(Math.round(currentSegmentDuration / 60));
                            currentSegmentDuration = 0;
                            waypointIndex++;
                        } else {
                            currentSegmentDuration += instruction.time || 0;
                        }

                        if (instruction.distance) {
                            segments.push({
                                distance: (instruction.distance / 1000).toFixed(2),
                                duration: Math.round(instruction.time / 60),
                                instruction: instruction.text
                            });
                        }
                    }

                    if (currentSegmentDuration > 0) {
                        segmentDurations.push(Math.round(currentSegmentDuration / 60));
                    }

                    setRouteInfo({
                        totalDistance: totalDistance,
                        totalDuration: totalDuration,
                        segments: segments
                    });

                    if (onRouteCalculated) {
                        onRouteCalculated(totalDuration, segmentDurations);
                    }

                    setHasRoutingError(false);
                    isUpdatingRouteRef.current = false;
                });

                routingControl.on('routingerror', function(e) {
                    console.error('Routing error:', e);
                    setHasRoutingError(true);
                    isUpdatingRouteRef.current = false;

                    if (routingControlRef.current && map) {
                        try {
                            map.removeControl(routingControlRef.current);
                            routingControlRef.current = null;
                        } catch (err) {
                            console.warn('Error removing failed routing control:', err);
                        }
                    }

                    const errorStatus = e?.error?.status || e?.error?.target?.status;
                    if (errorStatus === 429) {
                        try {
                            const errorPopup = window.L.popup({
                                closeButton: true,
                                closeOnClick: true
                            })
                            .setLatLng(map.getCenter())
                            .setContent(`
                                <div style="padding: 10px; max-width: 250px;">
                                    <strong style="color: #DC2626;">Routing Temporarily Unavailable</strong>
                                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
                                        Too many requests. Please wait before trying again.
                                    </p>
                                </div>
                            `)
                            .openOn(map);

                            setTimeout(() => {
                                try {
                                    map.closePopup(errorPopup);
                                } catch (err) {}
                                setHasRoutingError(false);
                            }, 5000);
                        } catch (popupError) {
                            console.warn('Error showing popup:', popupError);
                            setTimeout(() => setHasRoutingError(false), 5000);
                        }
                    } else {
                        setTimeout(() => setHasRoutingError(false), 3000);
                    }
                });

                routingControl.addTo(map);
                routingControlRef.current = routingControl;

            } else if (startLocation?.coordinates) {
                const startMarker = window.L.marker(
                    [startLocation.coordinates.lat, startLocation.coordinates.lng],
                    {
                        icon: window.L.divIcon({
                            className: "custom-marker",
                            html: `
                                <div style="
                                    background-color: #22C55E;
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 50% 50% 50% 0;
                                    transform: rotate(-45deg);
                                    border: 3px solid white;
                                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">
                                    <span style="
                                        transform: rotate(45deg);
                                        color: white;
                                        font-weight: bold;
                                        font-size: 14px;
                                    ">S</span>
                                </div>
                            `,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                        }),
                    }
                ).addTo(map);

                startMarker.bindPopup(`
                    <div style="min-width: 150px;">
                        <b style="color: #22C55E; font-size: 14px;">Start</b><br>
                        <span style="font-size: 12px; color: #666;">${startLocation.name}</span>
                    </div>
                `);

                markersRef.current.push(startMarker);
                map.setView([startLocation.coordinates.lat, startLocation.coordinates.lng], 13);
                isUpdatingRouteRef.current = false;

            } else if (endLocation?.coordinates) {
                const endMarker = window.L.marker(
                    [endLocation.coordinates.lat, endLocation.coordinates.lng],
                    {
                        icon: window.L.divIcon({
                            className: "custom-marker",
                            html: `
                                <div style="
                                    background-color: #EF4444;
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 50% 50% 50% 0;
                                    transform: rotate(-45deg);
                                    border: 3px solid white;
                                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">
                                    <span style="
                                        transform: rotate(45deg);
                                        color: white;
                                        font-weight: bold;
                                        font-size: 14px;
                                    ">E</span>
                                </div>
                            `,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                        }),
                    }
                ).addTo(map);

                endMarker.bindPopup(`
                    <div style="min-width: 150px;">
                        <b style="color: #EF4444; font-size: 14px;">End</b><br>
                        <span style="font-size: 12px; color: #666;">${endLocation.name}</span>
                    </div>
                `);

                markersRef.current.push(endMarker);
                map.setView([endLocation.coordinates.lat, endLocation.coordinates.lng], 13);
                isUpdatingRouteRef.current = false;
            } else {
                isUpdatingRouteRef.current = false;
            }

        } catch (error) {
            console.error('Error updating route:', error);
            isUpdatingRouteRef.current = false;
            setHasRoutingError(true);
            setTimeout(() => setHasRoutingError(false), 3000);
        }
    }, [startLocation, endLocation, stops, hasRoutingError, clearRouteAndMarkers, onRouteCalculated]);

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
