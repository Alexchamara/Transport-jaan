import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function CreateBooking({ auth }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        service_type: 'LCL',
        multimodal_preferences: [],
        origin: '',
        destination: '',
        preferred_pickup_date: '',
        total_volume: '',
        container_type: '',
        weight: '',
        package_count: '',
        packing_list: null,
        commercial_invoice: null,
    });

    const [originCoords, setOriginCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);

    transform((data) => ({
        ...data,
        origin: JSON.stringify({ address: data.origin, coordinates: originCoords }),
        destination: JSON.stringify({ address: data.destination, coordinates: destinationCoords }),
    }));

    function handleSubmit(e) {
        e.preventDefault();
        post(route('freight.booking.store'), {
            forceFormData: true,
        });
    }

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        let preferences = [...data.multimodal_preferences];
        if (checked) {
            preferences.push(value);
        } else {
            preferences = preferences.filter((item) => item !== value);
        }
        setData('multimodal_preferences', preferences);
    };

    // A simple mock for an autocomplete input
    const handleAddressChange = (e, field, setCoords) => {
        setData(field, e.target.value);
        // In a real app, you'd use a geocoding service here
        setCoords({ lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 });
    };


    return (
<>
            <Head title="New Freight Booking" />

            <div className="max-w-4xl mx-auto mt-10 bg-white p-8 shadow rounded">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Create a New Freight Booking
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Service Type Selection */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">1. Service Type Selection</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="service_type" className="block text-sm font-medium text-gray-700">Service Type</label>
                                <select
                                    id="service_type"
                                    name="service_type"
                                    value={data.service_type}
                                    onChange={(e) => setData('service_type', e.target.value)}
                                    className="mt-1 block w-full"
                                >
                                    <option value="LCL">LCL (Less than Container Load)</option>
                                    <option value="FCL">FCL (Full Container Load)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Multimodal Preferences</label>
                                <div className="mt-2 space-x-4">
                                    <label className="inline-flex items-center">
                                        <input type="checkbox" value="Road" onChange={handleCheckboxChange} className="form-checkbox" />
                                        <span className="ml-2">Road</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input type="checkbox" value="Train" onChange={handleCheckboxChange} className="form-checkbox" />
                                        <span className="ml-2">Train</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Origin & Destination */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">2. Origin & Destination</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Pickup Location (Origin)</label>
                                <input
                                    type="text"
                                    id="origin"
                                    value={data.origin}
                                    onChange={(e) => handleAddressChange(e, 'origin', setOriginCoords)}
                                    className="mt-1 block w-full"
                                    placeholder="Enter pickup address"
                                />
                                {errors.origin && <div className="text-red-500 text-xs mt-1">{errors.origin}</div>}
                            </div>
                            <div>
                                <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Drop-off Location (Destination)</label>
                                <input
                                    type="text"
                                    id="destination"
                                    value={data.destination}
                                    onChange={(e) => handleAddressChange(e, 'destination', setDestinationCoords)}
                                    className="mt-1 block w-full"
                                    placeholder="Enter drop-off address"
                                />
                                {errors.destination && <div className="text-red-500 text-xs mt-1">{errors.destination}</div>}
                            </div>
                            <div>
                                <label htmlFor="preferred_pickup_date" className="block text-sm font-medium text-gray-700">Preferred Pickup Date (Optional)</label>
                                <input
                                    type="date"
                                    id="preferred_pickup_date"
                                    value={data.preferred_pickup_date}
                                    onChange={(e) => setData('preferred_pickup_date', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cargo Details */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">3. Cargo Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.service_type === 'LCL' && (
                                <div>
                                    <label htmlFor="total_volume" className="block text-sm font-medium text-gray-700">Total Volume (CBM)</label>
                                    <input
                                        type="number"
                                        id="total_volume"
                                        value={data.total_volume}
                                        onChange={(e) => setData('total_volume', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    {errors.total_volume && <div className="text-red-500 text-xs mt-1">{errors.total_volume}</div>}
                                </div>
                            )}
                            {data.service_type === 'FCL' && (
                                <div>
                                    <label htmlFor="container_type" className="block text-sm font-medium text-gray-700">Container Type</label>
                                    <select
                                        id="container_type"
                                        value={data.container_type}
                                        onChange={(e) => setData('container_type', e.target.value)}
                                        className="mt-1 block w-full"
                                    >
                                        <option value="">Select a container type</option>
                                        <option value="20FT">20FT</option>
                                        <option value="40FT">40FT</option>
                                        <option value="40FT HC">40FT HC</option>
                                    </select>
                                    {errors.container_type && <div className="text-red-500 text-xs mt-1">{errors.container_type}</div>}
                                </div>
                            )}
                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <input
                                    type="number"
                                    id="weight"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.weight && <div className="text-red-500 text-xs mt-1">{errors.weight}</div>}
                            </div>
                            <div>
                                <label htmlFor="package_count" className="block text-sm font-medium text-gray-700">Number of Packages / Pallets (Optional)</label>
                                <input
                                    type="number"
                                    id="package_count"
                                    value={data.package_count}
                                    onChange={(e) => setData('package_count', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Uploads */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">4. Document Uploads</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="packing_list" className="block text-sm font-medium text-gray-700">Packing List</label>
                                <input
                                    type="file"
                                    id="packing_list"
                                    onChange={(e) => setData('packing_list', e.target.files[0])}
                                    className="mt-1 block w-full"
                                />
                                {errors.packing_list && <div className="text-red-500 text-xs mt-1">{errors.packing_list}</div>}
                            </div>
                            <div>
                                <label htmlFor="commercial_invoice" className="block text-sm font-medium text-gray-700">Commercial Invoice</label>
                                <input
                                    type="file"
                                    id="commercial_invoice"
                                    onChange={(e) => setData('commercial_invoice', e.target.files[0])}
                                    className="mt-1 block w-full"
                                />
                                {errors.commercial_invoice && <div className="text-red-500 text-xs mt-1">{errors.commercial_invoice}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
