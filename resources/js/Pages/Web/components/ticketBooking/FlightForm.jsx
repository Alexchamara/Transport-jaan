import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";

// Sample airport/location data - same as FlightCard
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

// LocationDropdown component for FlightForm
const LocationDropdown = ({ label, name, value, onChange, placeholder, errors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [filteredLocations, setFilteredLocations] = useState([]);

    // Update search term when value prop changes
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onChange({ target: { name, value: term } });

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
        onChange({ target: { name, value: selectedValue } });
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
            <label className="block mb-1">{label}</label>
            <input
                type="text"
                name={name}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                className={`w-full border rounded-[8px] p-[16px] ${
                    errors ? 'border-red-500' : 'border-gray-300'
                }`}
                autoComplete="off"
                required
            />
            {errors && (
                <p className="text-red-500 text-xs mt-1">{errors}</p>
            )}
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

const FlightForm = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        special_requests: '',
        trip_type: '',
        departure_date: '',
        return_date: '',
        departure_airport: '',
        arriving_airport: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('flight-bookings.store'), {
            onSuccess: () => {
                reset();
                // The success message will be handled by the backend's session flash
            },
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <div className="p-20">
            <form
                onSubmit={handleSubmit}
                className="figtree flex flex-col justify-center items-center bg-white p-4 sm:p-6 rounded-[15px] w-full h-auto text-[#286BB6] text-[13px] font-[400]"
                style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
                    <div>
                        <label className="block mb-1">Your Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={handleInputChange}
                            placeholder="Enter your name"
                            className={`w-full border rounded-[8px] p-[16px] ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1">Your Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className={`w-full border rounded-[8px] p-[16px] ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
                    <div>
                        <label className="block mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={data.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            className={`w-full border rounded-[8px] p-[16px] ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1">Subject *</label>
                        <input
                            type="text"
                            name="subject"
                            value={data.subject}
                            onChange={handleInputChange}
                            placeholder="Enter subject"
                            className={`w-full border rounded-[8px] p-[16px] ${
                                errors.subject ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.subject && (
                            <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                        )}
                    </div>
                </div>

                <div className="w-full mb-4">
                    <label className="block mb-1">Special Requests</label>
                    <textarea
                        name="special_requests"
                        value={data.special_requests}
                        onChange={handleInputChange}
                        placeholder="Any special requests"
                        className={`w-full border rounded-[8px] p-[16px] ${
                            errors.special_requests ? 'border-red-500' : 'border-gray-300'
                        }`}
                        rows="3"
                    ></textarea>
                    {errors.special_requests && (
                        <p className="text-red-500 text-xs mt-1">{errors.special_requests}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
                    <div>
                        <label className="block mb-1">One way / Return *</label>
                        <select
                            name="trip_type"
                            value={data.trip_type}
                            onChange={handleInputChange}
                            className={`w-full border rounded-[8px] p-[16px] ${
                                errors.trip_type ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        >
                            <option value="">Select option</option>
                            <option value="oneway">One way</option>
                            <option value="return">Return</option>
                        </select>
                        {errors.trip_type && (
                            <p className="text-red-500 text-xs mt-1">{errors.trip_type}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1">Departure Date *</label>
                        <input
                            type="date"
                            name="departure_date"
                            value={data.departure_date}
                            onChange={handleInputChange}
                            className={`w-full border rounded-[8px] p-[16px] ${
                                errors.departure_date ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.departure_date && (
                            <p className="text-red-500 text-xs mt-1">{errors.departure_date}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
                    <div>
                        <label className="block mb-1">
                            Departure Airport *
                        </label>
                        <input
                            type="text"
                            name="departure_airport"
                            value={data.departure_airport}
                            onChange={handleInputChange}
                            placeholder="Enter departure airport"
                            className={`w-full border rounded-[8px] p-[16px] ${
                                errors.departure_airport ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.departure_airport && (
                            <p className="text-red-500 text-xs mt-1">{errors.departure_airport}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1">Arriving Airport *</label>
                        <input
                            type="text"
                            name="arriving_airport"
                            value={data.arriving_airport}
                            onChange={handleInputChange}
                            placeholder="Enter arriving airport"
                            className={`w-full border rounded-[8px] p-[16px] ${
                                errors.arriving_airport ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.arriving_airport && (
                            <p className="text-red-500 text-xs mt-1">{errors.arriving_airport}</p>
                        )}
                    </div>
                </div>

                <div className="w-full mb-6">
                    <label className="block mb-1">
                        Return Date {data.trip_type === 'return' && '*'}
                    </label>
                    <input
                        type="date"
                        name="return_date"
                        value={data.return_date}
                        onChange={handleInputChange}
                        className={`w-full border rounded-[8px] p-[16px] ${
                            errors.return_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required={data.trip_type === 'return'}
                    />
                    {errors.return_date && (
                        <p className="text-red-500 text-xs mt-1">{errors.return_date}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className={`bg-[#0955AC] text-white font-bold h-[56px] w-full rounded-[8px] hover:bg-[#07448a] transition-colors ${
                        processing ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                    {processing ? 'Processing...' : 'Submit Booking Request'}
                </button>
            </form>
        </div>
    );
};

export default FlightForm;
