import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
// import AppLayout from '@/Layouts/AppLayout';

export default function Show({ auth, warehouse, previewPrice, previewDuration, dates }) {
    const [activeTab, setActiveTab] = useState('details');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        start_date: dates.start_date || '',
        end_date: dates.end_date || '',
        purpose: '',
        special_requirements: '',
        duration_unit: warehouse.pricing_model, // Default to warehouse's model
        quantity: 1
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('warehouses.book', warehouse.id));
    };

    const formatPriceDisplay = (pricingModel) => {
        const priceUnit = {
            hourly: '/hour',
            daily: '/day',
            monthly: '/month'
        };
        return `$${warehouse.price}${priceUnit[pricingModel]}`;
    };

    // Calculate price whenever relevant form fields change
    const [calculatedPrice, setCalculatedPrice] = useState(previewPrice);
    const [calculatedDuration, setCalculatedDuration] = useState(previewDuration);

    const calculatePrice = () => {
        if (!data.start_date || !data.end_date) return;

        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);

        // Calculate duration based on the selected unit
        let duration = 0;
        let durationText = '';

        switch (data.duration_unit) {
            case 'hourly':
                duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
                durationText = `${duration} ${duration === 1 ? 'hour' : 'hours'}`;
                break;
            case 'daily':
                duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                durationText = `${duration} ${duration === 1 ? 'day' : 'days'}`;
                break;
            case 'monthly':
                duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
                durationText = `${duration} ${duration === 1 ? 'month' : 'months'}`;
                break;
        }

        const price = duration * warehouse.price * data.quantity;

        setCalculatedDuration(durationText);
        setCalculatedPrice(price);
    };

    // Recalculate whenever form changes
    React.useEffect(() => {
        calculatePrice();
    }, [data.start_date, data.end_date, data.duration_unit, data.quantity]);

    return (
        <AppLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{warehouse.name}</h2>}
        >
            <Head title={warehouse.name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <nav className="mb-4">
                        <Link
                            href={route('warehouses.search')}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            ← Back to Search Results
                        </Link>
                    </nav>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="p-6">
                                <div className="mb-4">
                                    <div className="h-80 overflow-hidden bg-gray-200 mb-2 rounded">
                                        {warehouse.images && warehouse.images.length > 0 ? (
                                            <img
                                                src={`/storage/${warehouse.images[activeImageIndex]}`}
                                                alt={warehouse.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-500">
                                                No Image Available
                                            </div>
                                        )}
                                    </div>

                                    {warehouse.images && warehouse.images.length > 1 && (
                                        <div className="flex space-x-2 overflow-x-auto">
                                            {warehouse.images.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded ${index === activeImageIndex ? 'ring-2 ring-blue-500' : ''}`}
                                                >
                                                    <img
                                                        src={`/storage/${image}`}
                                                        alt={`${warehouse.name} image ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold mb-2">{warehouse.name}</h1>
                                    <p className="text-gray-600 mb-4">{warehouse.address}</p>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                            {warehouse.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-xl font-bold">
                                            {formatPriceDisplay(warehouse.pricing_model)}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <h3 className="text-gray-600 font-medium">Total Area</h3>
                                                <p>{warehouse.total_area} sq. ft.</p>
                                            </div>
                                            <div>
                                                <h3 className="text-gray-600 font-medium">Capacity</h3>
                                                <p>{warehouse.capacity}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-gray-600 font-medium">Vendor</h3>
                                                <p>{warehouse.vendor.company_name}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-gray-600 font-medium">Pricing Model</h3>
                                                <p>{warehouse.pricing_model.charAt(0).toUpperCase() + warehouse.pricing_model.slice(1)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium mb-2">Amenities</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {warehouse.amenities.map(amenity => (
                                                <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6">
                                <div className="mb-6">
                                    <div className="border-b border-gray-200">
                                        <nav className="flex -mb-px">
                                            <button
                                                onClick={() => setActiveTab('details')}
                                                className={`py-4 px-6 text-sm font-medium ${
                                                    activeTab === 'details'
                                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('booking')}
                                                className={`py-4 px-6 text-sm font-medium ${
                                                    activeTab === 'booking'
                                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                Book Now
                                            </button>
                                        </nav>
                                    </div>
                                </div>

                                {activeTab === 'details' ? (
                                    <div>
                                        <div className="prose max-w-none">
                                            <h3>Terms and Conditions</h3>
                                            <div className="text-sm">
                                                {warehouse.terms_conditions}
                                            </div>

                                            <h3 className="mt-6">Documents</h3>
                                            {warehouse.documents && warehouse.documents.length > 0 ? (
                                                <ul className="list-disc pl-5">
                                                    {warehouse.documents.map((doc, index) => (
                                                        <li key={index}>
                                                            <a
                                                                href={`/storage/${doc}`}
                                                                target="_blank"
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                Document {index + 1}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500">No documents available.</p>
                                            )}
                                        </div>

                                        <div className="mt-6">
                                            <button
                                                onClick={() => setActiveTab('booking')}
                                                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Book This Warehouse
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {!auth.user ? (
                                            <div className="text-center py-8">
                                                <p className="mb-4 text-gray-600">
                                                    You need to be logged in to book a warehouse.
                                                </p>
                                                <Link
                                                    href={route('login', { redirect: window.location.href })}
                                                    className="inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    Login to Continue
                                                </Link>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="rounded-md bg-yellow-50 p-4 mb-6">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                                                            <div className="mt-2 text-sm text-yellow-700">
                                                                <p>
                                                                    Booking requests are subject to approval by the vendor.
                                                                    You will be notified once your request is processed.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Booking Dates
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                                            <input
                                                                type="date"
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                                value={data.start_date}
                                                                onChange={e => setData('start_date', e.target.value)}
                                                                min={new Date().toISOString().split('T')[0]}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                                            <input
                                                                type="date"
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                                value={data.end_date}
                                                                onChange={e => setData('end_date', e.target.value)}
                                                                min={data.start_date || new Date().toISOString().split('T')[0]}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                                                    {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Duration Unit
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <label className="flex items-center p-3 rounded-md border cursor-pointer hover:bg-gray-50">
                                                            <input
                                                                type="radio"
                                                                name="duration_unit"
                                                                value="hourly"
                                                                checked={data.duration_unit === 'hourly'}
                                                                onChange={() => setData('duration_unit', 'hourly')}
                                                                className="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span>Hourly</span>
                                                        </label>
                                                        <label className="flex items-center p-3 rounded-md border cursor-pointer hover:bg-gray-50">
                                                            <input
                                                                type="radio"
                                                                name="duration_unit"
                                                                value="daily"
                                                                checked={data.duration_unit === 'daily'}
                                                                onChange={() => setData('duration_unit', 'daily')}
                                                                className="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span>Daily</span>
                                                        </label>
                                                        <label className="flex items-center p-3 rounded-md border cursor-pointer hover:bg-gray-50">
                                                            <input
                                                                type="radio"
                                                                name="duration_unit"
                                                                value="monthly"
                                                                checked={data.duration_unit === 'monthly'}
                                                                onChange={() => setData('duration_unit', 'monthly')}
                                                                className="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span>Monthly</span>
                                                        </label>
                                                    </div>
                                                    {errors.duration_unit && <p className="mt-1 text-sm text-red-600">{errors.duration_unit}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Quantity (space units)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                        value={data.quantity}
                                                        onChange={e => setData('quantity', parseInt(e.target.value) || 1)}
                                                    />
                                                    {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Purpose of Storage
                                                    </label>
                                                    <textarea
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                        rows="3"
                                                        value={data.purpose}
                                                        onChange={e => setData('purpose', e.target.value)}
                                                        placeholder="Describe why you need this warehouse space"
                                                        required
                                                    ></textarea>
                                                    {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Special Requirements (Optional)
                                                    </label>
                                                    <textarea
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                        rows="3"
                                                        value={data.special_requirements}
                                                        onChange={e => setData('special_requirements', e.target.value)}
                                                        placeholder="Any special requirements or additional information"
                                                    ></textarea>
                                                    {errors.special_requirements && <p className="mt-1 text-sm text-red-600">{errors.special_requirements}</p>}
                                                </div>

                                                {calculatedPrice !== null && (
                                                    <div className="rounded-md bg-blue-50 p-4">
                                                        <div className="flex">
                                                            <div className="ml-3">
                                                                <h3 className="text-sm font-medium text-blue-800">Price Estimate</h3>
                                                                <div className="mt-2 text-sm text-blue-700">
                                                                    <p>Duration: {calculatedDuration}</p>
                                                                    <p className="text-lg font-bold mt-1">Total: ${calculatedPrice.toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {errors.availability && (
                                                    <div className="rounded-md bg-red-50 p-4">
                                                        <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="ml-3">
                                                                <h3 className="text-sm font-medium text-red-800">Availability Error</h3>
                                                                <div className="mt-2 text-sm text-red-700">
                                                                    <p>{errors.availability}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        {processing ? "Processing..." : "Submit Booking Request"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
