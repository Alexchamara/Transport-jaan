import React, { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBWjVf-wK6rdmSON8eOXJCgxq2MI10QasE";

const MapLocationPickerModal = ({ isOpen, onClose, onConfirm, initialLocation }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const apiKey = GOOGLE_MAPS_API_KEY.trim();
        if (!apiKey) {
            console.error("Google Maps API key missing");
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
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapLoaded(true);
        script.onerror = () => {
            console.error("Failed to load Google Maps script");
        };
        document.head.appendChild(script);
    }, [isOpen]);

    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !isOpen) return;

        if (!mapInstanceRef.current) {
            const defaultPos = { lat: 7.8731, lng: 80.7718 }; // Sri Lanka
            const map = new window.google.maps.Map(mapRef.current, {
                center: initialLocation?.coordinates || defaultPos,
                zoom: initialLocation?.coordinates ? 15 : 7.5,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            mapInstanceRef.current = map;

            const marker = new window.google.maps.Marker({
                position: initialLocation?.coordinates || defaultPos,
                map: map,
                draggable: true,
                animation: window.google.maps.Animation.DROP,
            });
            markerRef.current = marker;

            if (initialLocation?.coordinates) {
                setSelectedLocation(initialLocation);
            }

            window.google.maps.event.addListener(map, "click", (event) => {
                const newPos = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                };
                marker.setPosition(newPos);
                handleLocationChange(newPos);
            });

            window.google.maps.event.addListener(marker, "dragend", (event) => {
                const newPos = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                };
                handleLocationChange(newPos);
            });
        }
    }, [mapLoaded, isOpen, initialLocation]);

    const handleLocationChange = async (coordinates) => {
        setSelectedLocation({ coordinates, name: "Loading address..." });
        setIsFetchingAddress(true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json&addressdetails=1`
            );

            if (response.ok) {
                const data = await response.json();
                setSelectedLocation({
                    name: data.display_name,
                    coordinates: coordinates,
                    address: data.address,
                });
            } else {
                setSelectedLocation({
                    name: `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`,
                    coordinates: coordinates,
                });
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
            setSelectedLocation({
                name: `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`,
                coordinates: coordinates,
            });
        } finally {
            setIsFetchingAddress(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="relative flex w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#E3EAF5] px-6 py-4">
                    <h2 className="text-lg font-semibold text-[#0B1739]">Select Location on Map</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-[#6B7893] hover:bg-[#F3F6FB] hover:text-[#0B1739]"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4">
                    <p className="mb-3 text-sm text-[#5B6887]">
                        Click anywhere on the map or drag the pin to select a location.
                    </p>
                    <div
                        ref={mapRef}
                        className="h-[60vh] min-h-[300px] w-full rounded-xl border border-[#D6DEEB] bg-[#F3F6FB]"
                    >
                        {!mapLoaded && (
                            <div className="flex h-full w-full items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0955AC] border-t-transparent"></div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 rounded-lg border border-[#D6DEEB] bg-[#F9FBFF] p-3">
                        <p className="text-xs font-semibold text-[#0B1739]">Selected Location:</p>
                        <p className="mt-1 text-sm text-[#5B6887]">
                            {selectedLocation?.name || "No location selected"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#E3EAF5] px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-[#D6DEEB] px-5 py-2 text-sm font-semibold text-[#5B6887] hover:bg-[#F3F6FB]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (selectedLocation) {
                                onConfirm(selectedLocation);
                            }
                        }}
                        disabled={!selectedLocation || isFetchingAddress}
                        className={`rounded-lg bg-[#0955AC] px-5 py-2 text-sm font-semibold text-white transition ${
                            !selectedLocation || isFetchingAddress ? "cursor-not-allowed opacity-60" : "hover:bg-[#0a4b93]"
                        }`}
                    >
                        {isFetchingAddress ? "Loading..." : "Confirm Location"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapLocationPickerModal;
