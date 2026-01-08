import React, { useEffect, useRef, useState } from "react";

const MapComponent = ({ 
    startLocation, 
    endLocation, 
    stops, 
    onMapReady,
    onLocationUpdate,
    showAlternatives = false,
    routePreference = 'balanced' // 'fastest', 'shortest', 'balanced'
}) => {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [routeInfo, setRouteInfo] = useState({
        totalDistance: 0,
        totalDuration: 0,
        segments: []
    });
    const [currentRoute, setCurrentRoute] = useState(null);
    const [alternativeRoutes, setAlternativeRoutes] = useState([]);
    const markersRef = useRef([]);
    const routingControlRef = useRef(null);

    useEffect(() => {
        // Load Leaflet CSS and JS
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href =
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        if (!window.L) {
            const script = document.createElement("script");
            script.src =
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = () => {
                // Load Leaflet Routing Machine after Leaflet is loaded
                const routingScript = document.createElement("script");
                routingScript.src =
                    "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js";
                routingScript.onload = () => setMapLoaded(true);
                document.head.appendChild(routingScript);

                const routingCSS = document.createElement("link");
                routingCSS.rel = "stylesheet";
                routingCSS.href =
                    "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css";
                document.head.appendChild(routingCSS);
            };
            document.head.appendChild(script);
        } else {
            setMapLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!mapLoaded || !mapRef.current) return;

        // Initialize map with advanced options
        const map = window.L.map(mapRef.current, {
            center: [7.8731, 80.7718], // Center of Sri Lanka
            zoom: 8,
            zoomControl: true,
            maxZoom: 19,
            minZoom: 6,
            wheelPxPerZoomLevel: 120,
            zoomAnimation: true,
            markerZoomAnimation: true,
        });

        // Add OpenStreetMap tiles
        window.L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }
        ).addTo(map);

        // Clear previous route and markers function
        const clearRouteAndMarkers = () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
            markersRef.current.forEach((marker) => map.removeLayer(marker));
            markersRef.current = [];
        };

        const updateRoute = async () => {
            clearRouteAndMarkers();

            // If we have both start and end locations, show the route
            if (
                startLocation?.coordinates &&
                endLocation?.coordinates
            ) {
                const waypoints = [
                    window.L.latLng(
                        startLocation.coordinates.lat,
                        startLocation.coordinates.lng
                    ),
                ];

                // Add stops as waypoints
                if (stops && stops.length > 0) {
                    stops.forEach((stop) => {
                        if (stop.coordinates) {
                            waypoints.push(
                                window.L.latLng(
                                    stop.coordinates.lat,
                                    stop.coordinates.lng
                                )
                            );
                        }
                    });
                }

                waypoints.push(
                    window.L.latLng(
                        endLocation.coordinates.lat,
                        endLocation.coordinates.lng
                    )
                );

                // Create routing control with advanced options
                routingControlRef.current = window.L.Routing.control({
                    waypoints: waypoints,
                    routeWhileDragging: true,
                    addWaypoints: false,
                    draggableWaypoints: true, // Enable dragging
                    fitSelectedRoutes: true,
                    showAlternatives: showAlternatives,
                    altLineOptions: {
                        styles: [
                            {
                                color: '#888888',
                                opacity: 0.5,
                                weight: 4,
                            }
                        ]
                    },
                    lineOptions: {
                        styles: [
                            {
                                color: "#0955AC",
                                opacity: 0.9,
                                weight: 7,
                                className: 'animated-route'
                            },
                        ],
                        extendToWaypoints: true,
                        missingRouteTolerance: 1
                    },
                    router: window.L.Routing.osrmv1({
                        serviceUrl: 'https://router.project-osrm.org/route/v1',
                        profile: routePreference === 'fastest' ? 'driving' : 'driving',
                        timeout: 30 * 1000
                    }),
                    createMarker: function (i, waypoint, n) {
                        let markerIcon;
                        let markerColor;
                        let label;

                        if (i === 0) {
                            // Start marker - Green
                            markerColor = "#22C55E";
                            label = "Start";
                        } else if (i === n - 1) {
                            // End marker - Red
                            markerColor = "#EF4444";
                            label = "End";
                        } else {
                            // Stop marker - Blue
                            markerColor = "#0955AC";
                            label = `Stop ${i}`;
                        }

                        markerIcon = window.L.divIcon({
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
                                    ">${i === 0 ? "S" : i === n - 1 ? "E" : i}</span>
                                </div>
                            `,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                        });

                        const marker = window.L.marker(waypoint.latLng, {
                            icon: markerIcon,
                            draggable: true,
                            autoPan: true
                        });

                        const locationName = i === 0
                            ? startLocation.name
                            : i === n - 1
                            ? endLocation.name
                            : stops[i - 1]?.destination || `Stop ${i}`;

                        marker.bindPopup(`
                            <div style="min-width: 150px;">
                                <b style="color: ${markerColor}; font-size: 14px;">${label}</b><br>
                                <span style="font-size: 12px; color: #666;">${locationName}</span><br>
                                <button onclick="window.dispatchEvent(new CustomEvent('removeWaypoint', {detail: ${i}}))" 
                                    style="margin-top: 8px; padding: 4px 8px; background: #EF4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                                    Remove
                                </button>
                            </div>
                        `, {
                            maxWidth: 200,
                            className: 'custom-popup'
                        });

                        // Handle marker drag
                        marker.on('dragend', function(e) {
                            const newLatLng = e.target.getLatLng();
                            if (onLocationUpdate) {
                                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLatLng.lat}&lon=${newLatLng.lng}`)
                                    .then(res => res.json())
                                    .then(data => {
                                        onLocationUpdate(i, {
                                            name: data.display_name,
                                            coordinates: {
                                                lat: newLatLng.lat,
                                                lng: newLatLng.lng
                                            }
                                        });
                                    });
                            }
                        });

                        markersRef.current.push(marker);
                        return marker;
                    },
                }).addTo(map);

                // Handle route found event
                routingControlRef.current.on('routesfound', function(e) {
                    const routes = e.routes;
                    const mainRoute = routes[0];
                    
                    // Calculate total distance and time
                    const totalDistance = (mainRoute.summary.totalDistance / 1000).toFixed(2); // km
                    const totalDuration = Math.round(mainRoute.summary.totalTime / 60); // minutes
                    
                    // Calculate segments
                    const segments = [];
                    for (let i = 0; i < mainRoute.coordinates.length - 1; i++) {
                        if (mainRoute.instructions[i]) {
                            segments.push({
                                distance: (mainRoute.instructions[i].distance / 1000).toFixed(2),
                                duration: Math.round(mainRoute.instructions[i].time / 60),
                                instruction: mainRoute.instructions[i].text
                            });
                        }
                    }
                    
                    setRouteInfo({
                        totalDistance: totalDistance,
                        totalDuration: totalDuration,
                        segments: segments
                    });
                    
                    setCurrentRoute(mainRoute);
                    
                    // Handle alternative routes
                    if (routes.length > 1) {
                        setAlternativeRoutes(routes.slice(1));
                    }
                });

                // Customize routing container
                const routingContainer = routingControlRef.current.getContainer();
                if (routingContainer) {
                    routingContainer.style.display = "none";
                }
            } else if (startLocation?.coordinates) {
                // Show only start marker
                const startMarker = window.L.marker([
                    startLocation.coordinates.lat,
                    startLocation.coordinates.lng,
                ], {
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
                }).addTo(map);
                startMarker.bindPopup(`
                    <div style="min-width: 150px;">
                        <b style="color: #22C55E; font-size: 14px;">Start</b><br>
                        <span style="font-size: 12px; color: #666;">${startLocation.name}</span>
                    </div>
                `, {
                    maxWidth: 200
                });
                startMarker.setOpacity(0.9);
                markersRef.current.push(startMarker);

                map.setView(
                    [
                        startLocation.coordinates.lat,
                        startLocation.coordinates.lng,
                    ],
                    13
                );
            } else if (endLocation?.coordinates) {
                // Show only end marker
                const endMarker = window.L.marker([
                    endLocation.coordinates.lat,
                    endLocation.coordinates.lng,
                ], {
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
                }).addTo(map);
                endMarker.bindPopup(`
                    <div style="min-width: 150px;">
                        <b style="color: #EF4444; font-size: 14px;">End</b><br>
                        <span style="font-size: 12px; color: #666;">${endLocation.name}</span>
                    </div>
                `, {
                    maxWidth: 200
                });
                endMarker.setOpacity(0.9);
                markersRef.current.push(endMarker);

                map.setView(
                    [endLocation.coordinates.lat, endLocation.coordinates.lng],
                    13
                );
            }
        };

        updateRoute();

        if (onMapReady) {
            onMapReady(map);
        }

        // Add custom styles for route animation
        const style = document.createElement('style');
        style.innerHTML = `
            .animated-route {
                animation: dash 20s linear infinite;
            }
            @keyframes dash {
                to {
                    stroke-dashoffset: -100;
                }
            }
            .custom-popup .leaflet-popup-content-wrapper {
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
        `;
        document.head.appendChild(style);

        return () => {
            clearRouteAndMarkers();
            map.remove();
            document.head.removeChild(style);
        };
    }, [mapLoaded, startLocation, endLocation, stops, showAlternatives, routePreference]);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapRef}
                className="w-full h-full rounded-[20px]"
                style={{ minHeight: "295px" }}
            />
            
            {/* Route Information Overlay */}
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
            
            {/* Drag Hint */}
            {markersRef.current.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-[1000] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                    <span>Drag markers to adjust route</span>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
