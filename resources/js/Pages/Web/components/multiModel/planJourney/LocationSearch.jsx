import React, { useState, useEffect, useRef } from "react";
import MapLocationPickerModal from "./MapLocationPickerModal";

const LocationSearch = ({
    value,
    onChange,
    onLocationSelect,
    placeholder = "Search location...",
    icon,
    downArrow,
    label,
    inputId
}) => {
    const [searchQuery, setSearchQuery] = useState(value || "");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [showRecent, setShowRecent] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    
    const searchTimeout = useRef(null);
    const abortControllerRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem(`recentSearches_${inputId}`);
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.warn('Error loading recent searches:', e);
            }
        }
        
        const savedFavorites = localStorage.getItem('favoriteLocations');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.warn('Error loading favorites:', e);
            }
        }
    }, [inputId]);

    useEffect(() => {
        if (value !== searchQuery) {
            setSearchQuery(value || "");
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setShowRecent(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const saveToRecent = (locationData) => {
        try {
            const recent = [
                locationData,
                ...recentSearches.filter(r => r.name !== locationData.name)
            ].slice(0, 5);
            setRecentSearches(recent);
            localStorage.setItem(`recentSearches_${inputId}`, JSON.stringify(recent));
        } catch (e) {
            console.warn('Error saving to recent:', e);
        }
    };

    const toggleFavorite = (locationData) => {
        try {
            const isFavorite = favorites.some(f => f.name === locationData.name);
            const newFavorites = isFavorite
                ? favorites.filter(f => f.name !== locationData.name)
                : [...favorites, locationData];
            
            setFavorites(newFavorites);
            localStorage.setItem('favoriteLocations', JSON.stringify(newFavorites));
        } catch (e) {
            console.warn('Error toggling favorite:', e);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        const locationData = {
                            name: data.display_name,
                            coordinates: { lat: latitude, lng: longitude },
                            address: data.address,
                        };

                        setSearchQuery(locationData.name);
                        onChange(locationData.name);

                        if (onLocationSelect) {
                            onLocationSelect(locationData);
                        }

                        saveToRecent(locationData);
                    }
                } catch (error) {
                    console.error('Error reverse geocoding:', error);
                    alert('Unable to get location name');
                } finally {
                    setGettingLocation(false);
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to get your current location');
                setGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const fetchSuggestions = async (query) => {
        if (query.length < 3) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setLoading(true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=lk`,
                { signal: abortControllerRef.current.signal }
            );

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Error fetching suggestions:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        onChange(query);
        setShowRecent(false);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (query.length >= 3) {
            searchTimeout.current = setTimeout(() => {
                fetchSuggestions(query);
            }, 600);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleInputFocus = () => {
        if (searchQuery.length < 3 && recentSearches.length > 0) {
            setShowRecent(true);
            setShowSuggestions(false);
        } else if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const locationData = {
            name: suggestion.display_name,
            coordinates: {
                lat: parseFloat(suggestion.lat),
                lng: parseFloat(suggestion.lon),
            },
            address: suggestion.address,
        };

        setSearchQuery(locationData.name);
        onChange(locationData.name);

        if (onLocationSelect) {
            onLocationSelect(locationData);
        }

        saveToRecent(locationData);
        setShowSuggestions(false);
        setShowRecent(false);
        setSuggestions([]);
    };

    const formatDisplayName = (displayName) => {
        const parts = displayName.split(",");
        return parts.length > 3 ? parts.slice(0, 3).join(", ") + "..." : displayName;
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            {label && (
                <label htmlFor={inputId} className="text-[16px]/[24px] font-[400] block mb-2">
                    {label}
                </label>
            )}
            
            <div className="w-full xl:h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3 relative">
                {icon && <img src={icon} alt="location icon" className="w-5 h-5" />}
                
                <input
                    type="text"
                    id={inputId}
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                />
                
                {gettingLocation && (
                    <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                )}
                
                {loading && !gettingLocation && (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                )}
                
                <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="flex items-center justify-center p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Select on map"
                >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </button>

                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="flex items-center justify-center p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Use current location"
                >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                
                {downArrow && !loading && !gettingLocation && (
                    <img
                        src={downArrow}
                        className="cursor-pointer w-4 h-4"
                        alt="dropdown"
                        onClick={() => {
                            if (suggestions.length > 0) {
                                setShowSuggestions(!showSuggestions);
                            } else if (recentSearches.length > 0) {
                                setShowRecent(!showRecent);
                            }
                        }}
                    />
                )}
            </div>

            {showRecent && (recentSearches.length > 0 || favorites.length > 0) && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#D1D5DC] rounded-[10px] shadow-lg max-h-[350px] overflow-y-auto">
                    {favorites.length > 0 && (
                        <div className="border-b border-gray-100">
                            <div className="px-4 py-2 bg-yellow-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-yellow-800">Favorites</span>
                                </div>
                            </div>
                            {favorites.map((fav, index) => (
                                <div
                                    key={`fav-${index}`}
                                    onClick={() => handleSuggestionClick({
                                        display_name: fav.name,
                                        lat: fav.coordinates.lat,
                                        lon: fav.coordinates.lng,
                                        address: fav.address
                                    })}
                                    className="px-4 py-3 hover:bg-yellow-50 cursor-pointer border-b border-gray-50"
                                >
                                    <div className="text-[12px] text-gray-700 truncate">{fav.name}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {recentSearches.length > 0 && (
                        <div>
                            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-700">Recent</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRecentSearches([]);
                                        localStorage.removeItem(`recentSearches_${inputId}`);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((recent, index) => (
                                <div
                                    key={`recent-${index}`}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div
                                            onClick={() => handleSuggestionClick({
                                                display_name: recent.name,
                                                lat: recent.coordinates.lat,
                                                lon: recent.coordinates.lng,
                                                address: recent.address
                                            })}
                                            className="flex-1"
                                        >
                                            <div className="text-[12px] text-gray-700 truncate">{recent.name}</div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(recent);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg
                                                className={`w-5 h-5 ${favorites.some(f => f.name === recent.name) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                                                fill={favorites.some(f => f.name === recent.name) ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#D1D5DC] rounded-[10px] shadow-lg max-h-[300px] overflow-y-auto">
                    {suggestions.map((suggestion, index) => {
                        const locationData = {
                            name: suggestion.display_name,
                            coordinates: {
                                lat: parseFloat(suggestion.lat),
                                lng: parseFloat(suggestion.lon),
                            },
                            address: suggestion.address,
                        };
                        const isFavorite = favorites.some(f => f.name === locationData.name);

                        return (
                            <div
                                key={`${suggestion.place_id}-${index}`}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 group"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="flex items-start gap-3 flex-1"
                                    >
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div className="flex-1">
                                            <div className="text-[14px] font-[500] text-gray-900">
                                                {suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || "Location"}
                                            </div>
                                            <div className="text-[12px] text-gray-500 mt-1">
                                                {formatDisplayName(suggestion.display_name)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(locationData);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg
                                            className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                                            fill={isFavorite ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showSuggestions && !loading && searchQuery.length >= 3 && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#D1D5DC] rounded-[10px] shadow-lg p-4">
                    <div className="text-[14px] text-gray-500 text-center">
                        No locations found. Try a different search term.
                    </div>
                </div>
            )}

            <MapLocationPickerModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onConfirm={(locationData) => {
                    setSearchQuery(locationData.name);
                    onChange(locationData.name);
                    if (onLocationSelect) {
                        onLocationSelect(locationData);
                    }
                    saveToRecent(locationData);
                    setIsMapOpen(false);
                }}
                initialLocation={null}
            />
        </div>
    );
};

export default LocationSearch;
