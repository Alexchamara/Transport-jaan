import React, { useState } from "react";
import { Link } from "@inertiajs/react";

// Sample airport/location data - you can replace this with API data
const locations = [
    // Major international airports
    { code: "BIA", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka" },
    { code: "RML", name: "Ratmalana Airport", city: "Colombo", country: "Sri Lanka" },
    { code: "HRI", name: "Mattala Rajapaksa International Airport", city: "Hambantota", country: "Sri Lanka" },
    { code: "ACJ", name: "Anuradhapura Airport", city: "Anuradhapura", country: "Sri Lanka" },
    { code: "JAF", name: "Jaffna Airport", city: "Jaffna", country: "Sri Lanka" },

    // International destinations
    { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE" },
    { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar" },
    { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
    { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
    { code: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia" },
    { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India" },
    { code: "BOM", name: "Chhatrapati Shivaji International Airport", city: "Mumbai", country: "India" },
    { code: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India" },
    { code: "LHR", name: "London Heathrow Airport", city: "London", country: "UK" },
    { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA" },
    { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA" },
    { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan" },
    { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
    { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong" },
    { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia" },
];

// LocationDropdown component
const LocationDropdown = ({ label, id, value, onChange, placeholder, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [filteredLocations, setFilteredLocations] = useState([]);

    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onChange(term);

        if (term.length > 0) {
            const filtered = locations.filter(location =>
                location.name.toLowerCase().includes(term.toLowerCase()) ||
                location.city.toLowerCase().includes(term.toLowerCase()) ||
                location.code.toLowerCase().includes(term.toLowerCase()) ||
                location.country.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredLocations(filtered);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleLocationSelect = (location) => {
        const selectedValue = `${location.name} (${location.code})`;
        setSearchTerm(selectedValue);
        onChange(selectedValue);
        setIsOpen(false);
    };

    const handleInputFocus = () => {
        if (searchTerm.length > 0) {
            const filtered = locations.filter(location =>
                location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.country.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLocations(filtered);
            setIsOpen(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding dropdown to allow for click events
        setTimeout(() => setIsOpen(false), 150);
    };

    return (
        <div className="relative">
            <label htmlFor={id} className="block mb-1">
                {label}
            </label>
            <input
                type="text"
                id={id}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                className={`appearance-none w-full border-[1px] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6] ${
                    error ? 'border-red-500' : 'border-[#0000001A]'
                }`}
                autoComplete="off"
                required
            />

            {/* Dropdown List */}
            {isOpen && filteredLocations.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredLocations.slice(0, 10).map((location, index) => (
                        <div
                            key={`${location.code}-${index}`}
                            onClick={() => handleLocationSelect(location)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-[#286BB6] text-sm">
                                        {location.name}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {location.city}, {location.country}
                                    </div>
                                </div>
                                <div className="text-[#0955AC] font-bold text-xs bg-blue-100 px-2 py-1 rounded">
                                    {location.code}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FlightCard = () => {
    const [formData, setFormData] = useState({
        pickupLocation: '',
        pickupDate: '',
        dropoffLocation: '',
        dropoffDate: ''
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.pickupLocation.trim()) {
            newErrors.pickupLocation = 'Pick-up location is required';
        }

        if (!formData.pickupDate.trim()) {
            newErrors.pickupDate = 'Pick-up date is required';
        }

        if (!formData.dropoffLocation.trim()) {
            newErrors.dropoffLocation = 'Drop-off location is required';
        }

        if (!formData.dropoffDate.trim()) {
            newErrors.dropoffDate = 'Drop-off date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartClick = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to first error field
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                document.getElementById(firstErrorField)?.focus();
            }
            return;
        }

        // If validation passes, navigate to flight booking
        window.location.href = '/flightBooking';
    };

    return (
        <div className="bg-white/95 rounded-[20px] shadow-xl ring-1 ring-[#0955AC]/15 overflow-hidden">
            {/* Header (UI only, no field changes) */}
            <div className="bg-[#0955AC] text-yellow-400 font-bold text-lg py-5 text-center">
                Find Your Flights
            </div>

            {/* Form body — inputs kept exactly as before */}
            <form
                // onSubmit={onSubmit}
                className="figtree flex flex-col justify-center items-center bg-white p-10 w-full h-auto text-[#286BB6] text-[13px] font-[400] space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 justify-between w-full gap-4">
                    {/* Pick-up Location */}
                    <div>
                        <LocationDropdown
                            label="Pick-up Location *"
                            id="pickupLocation"
                            value={formData.pickupLocation}
                            onChange={(value) => handleInputChange('pickupLocation', value)}
                            placeholder="Search departure airport"
                            error={errors.pickupLocation}
                        />
                        {errors.pickupLocation && (
                            <p className="text-red-500 text-xs mt-1">{errors.pickupLocation}</p>
                        )}
                    </div>

                    {/* Pick-up Date */}
                    <div>
                        <label htmlFor="pickupDate" className="block mb-1">
                            Pick-up Date *
                        </label>
                        <input
                            type="text"
                            id="pickupDate"
                            value={formData.pickupDate}
                            onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className={`w-full border-[1px] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6] ${
                                errors.pickupDate ? 'border-red-500' : 'border-[#0000001A]'
                            }`}
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => (e.target.type = "text")}
                            required
                        />
                        {errors.pickupDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 justify-between w-full gap-4">
                    {/* Drop-off Location */}
                    <div>
                        <LocationDropdown
                            label="Drop-off Location *"
                            id="dropoffLocation"
                            value={formData.dropoffLocation}
                            onChange={(value) => handleInputChange('dropoffLocation', value)}
                            placeholder="Search destination airport"
                            error={errors.dropoffLocation}
                        />
                        {errors.dropoffLocation && (
                            <p className="text-red-500 text-xs mt-1">{errors.dropoffLocation}</p>
                        )}
                    </div>

                    {/* Drop-off Date */}
                    <div>
                        <label htmlFor="dropoffDate" className="block mb-1">
                            Drop-off Date *
                        </label>
                        <input
                            type="text"
                            id="dropoffDate"
                            value={formData.dropoffDate}
                            onChange={(e) => handleInputChange('dropoffDate', e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className={`border-[1px] rounded-[8px] p-[16px] w-full leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6] ${
                                errors.dropoffDate ? 'border-red-500' : 'border-[#0000001A]'
                            }`}
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => (e.target.type = "text")}
                            required
                        />
                        {errors.dropoffDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.dropoffDate}</p>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    type="button"
                    onClick={handleStartClick}
                    className="bg-[#0955AC] text-white font-bold h-[56px] w-full rounded-[10px] focus:outline-none focus:shadow-outline cursor-pointer hover:bg-[#07448a] transition-colors flex justify-center items-center"
                >
                    Start
                </button>
            </form>
        </div>
    );
};

export default FlightCard;
