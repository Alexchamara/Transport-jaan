import { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';

const WAREHOUSE_TYPES = [
    { value: 'cold_storage', label: 'Cold Storage' },
    { value: 'dry', label: 'Dry Storage' },
    { value: 'bonded', label: 'Bonded Warehouse' },
    { value: 'open_yard', label: 'Open Yard' },
];

const PRICING_MODELS = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'monthly', label: 'Per Month' },
];

const AMENITIES = [
    'Forklift',
    '24/7 Access',
    'CCTV',
    'Security Guard',
    'Loading Dock',
    'Climate Control',
    'Fire Alarm',
    'Parking',
    'Office Space',
    'Restroom',
];


export default function WarehouseForm({ warehouse = null, onSubmit }) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: warehouse?.name ?? '',
        address: warehouse?.address ?? '',
        latitude: warehouse?.latitude ?? '',
        longitude: warehouse?.longitude ?? '',
        total_area: warehouse?.total_area ?? '',
        capacity: warehouse?.capacity ?? '',
        type: warehouse?.type ?? '',
        amenities: warehouse?.amenities ?? [],
        pricing_model: warehouse?.pricing_model ?? '',
        price: warehouse?.price ?? '',
        terms_conditions: warehouse?.terms_conditions ?? '',
        images: [],
        documents: [],
    });

    // Initialize map
    useEffect(() => {
        const loadMap = async () => {
            if (window.google && mapRef.current && !mapLoaded) {
                const map = new window.google.maps.Map(mapRef.current, {
                    center: { 
                        lat: data.latitude ? parseFloat(data.latitude) : 0,
                        lng: data.longitude ? parseFloat(data.longitude) : 0
                    },
                    zoom: 15,
                });

                const marker = new window.google.maps.Marker({
                    map,
                    draggable: true,
                    position: { 
                        lat: data.latitude ? parseFloat(data.latitude) : 0,
                        lng: data.longitude ? parseFloat(data.longitude) : 0
                    },
                });

                markerRef.current = marker;

                marker.addListener('dragend', () => {
                    const position = marker.getPosition();
                    setData({
                        ...data,
                        latitude: position.lat(),
                        longitude: position.lng(),
                    });
                });

                // Initialize the places autocomplete
                const input = document.getElementById('address-input');
                const autocomplete = new window.google.maps.places.Autocomplete(input);
                
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry) {
                        map.setCenter(place.geometry.location);
                        marker.setPosition(place.geometry.location);
                        setData({
                            ...data,
                            address: place.formatted_address,
                            latitude: place.geometry.location.lat(),
                            longitude: place.geometry.location.lng(),
                        });
                    }
                });

                setMapLoaded(true);
            }
        };

        loadMap();
    }, [mapRef.current, window.google]);

       const handleSubmit = (e) => {
        e.preventDefault();
        
        // Instead of creating a FormData object and calling onSubmit,
        // we'll use Inertia's built-in form handling
        
        // Convert amenities to JSON string for submission
        const formData = new FormData();
        
        // Add basic fields
        Object.keys(data).forEach(key => {
            if (key === 'amenities') {
                formData.append('amenities', JSON.stringify(data.amenities));
            } else if (key === 'images' || key === 'documents') {
                if (data[key] && data[key].length > 0) {
                    Array.from(data[key]).forEach((file, index) => {
                        formData.append(`${key}[${index}]`, file);
                    });
                }
            } else {
                formData.append(key, data[key]);
            }
        });
        
        // If we're updating an existing warehouse
        if (warehouse?.id) {
            formData.append('_method', 'PUT');
            onSubmit(formData, warehouse.id);
        } else {
            onSubmit(formData);
        }
    };

    const toggleAmenity = (amenity) => {
        const newAmenities = data.amenities.includes(amenity)
            ? data.amenities.filter(a => a !== amenity)
            : [...data.amenities, amenity];
        setData('amenities', newAmenities);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Warehouse Name
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Address
                    </label>
                    <input
                        id="address-input"
                        type="text"
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                    {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                </div>

                {/* Latitude and Longitude */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Latitude
                        </label>
                        <input
                            type="number"
                            value={data.latitude}
                            onChange={e => {
                                const lat = parseFloat(e.target.value);
                                setData('latitude', e.target.value);
                                if (markerRef.current && !isNaN(lat)) {
                                    const lng = markerRef.current.getPosition().lng();
                                    markerRef.current.setPosition({ lat, lng });
                                }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                            step="any"
                        />
                        {errors.latitude && (
                            <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Longitude
                        </label>
                        <input
                            type="number"
                            value={data.longitude}
                            onChange={e => {
                                const lng = parseFloat(e.target.value);
                                setData('longitude', e.target.value);
                                if (markerRef.current && !isNaN(lng)) {
                                    const lat = markerRef.current.getPosition().lat();
                                    markerRef.current.setPosition({ lat, lng });
                                }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                            step="any"
                        />
                        {errors.longitude && (
                            <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="h-64 rounded-lg overflow-hidden">
                <div ref={mapRef} className="w-full h-full" />
            </div>

            {/* Area and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Total Area (sq. ft.)
                    </label>
                    <input
                        type="number"
                        value={data.total_area}
                        onChange={e => setData('total_area', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        min="0"
                        step="0.01"
                    />
                    {errors.total_area && (
                        <p className="mt-1 text-sm text-red-600">{errors.total_area}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Capacity
                    </label>
                    <input
                        type="number"
                        value={data.capacity}
                        onChange={e => setData('capacity', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        min="0"
                    />
                    {errors.capacity && (
                        <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Warehouse Type
                    </label>
                    <select
                        value={data.type}
                        onChange={e => setData('type', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Type</option>
                        {WAREHOUSE_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && (
                        <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                    )}
                </div>
            </div>

            {/* Amenities */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {AMENITIES.map(amenity => (
                        <label key={amenity} className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={data.amenities.includes(amenity)}
                                onChange={() => toggleAmenity(amenity)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">{amenity}</span>
                        </label>
                    ))}
                </div>
                {errors.amenities && (
                    <p className="mt-1 text-sm text-red-600">{errors.amenities}</p>
                )}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Pricing Model
                    </label>
                    <select
                        value={data.pricing_model}
                        onChange={e => setData('pricing_model', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Pricing Model</option>
                        {PRICING_MODELS.map(model => (
                            <option key={model.value} value={model.value}>
                                {model.label}
                            </option>
                        ))}
                    </select>
                    {errors.pricing_model && (
                        <p className="mt-1 text-sm text-red-600">{errors.pricing_model}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Price
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            value={data.price}
                            onChange={e => setData('price', e.target.value)}
                            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                </div>
            </div>

            {/* Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Images
                    </label>
                    <input
                        type="file"
                        onChange={e => setData('images', e.target.files)}
                        className="mt-1 block w-full"
                        accept="image/*"
                        multiple
                    />
                    {errors.images && (
                        <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Documents
                    </label>
                    <input
                        type="file"
                        onChange={e => setData('documents', e.target.files)}
                        className="mt-1 block w-full"
                        accept=".pdf,.doc,.docx"
                        multiple
                    />
                    {errors.documents && (
                        <p className="mt-1 text-sm text-red-600">{errors.documents}</p>
                    )}
                </div>
            </div>

            {/* Terms and Conditions */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Terms and Conditions
                </label>
                <textarea
                    value={data.terms_conditions}
                    onChange={e => setData('terms_conditions', e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
                {errors.terms_conditions && (
                    <p className="mt-1 text-sm text-red-600">{errors.terms_conditions}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {processing ? 'Saving...' : (warehouse ? 'Update Warehouse' : 'Create Warehouse')}
                </button>
            </div>
        </form>
    );
} 