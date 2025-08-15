import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

const Register = () => {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        business_type: '',
        registration_number: '',
        email: '',
        phone: '',
        location: '',
        service_types: [],
        vehicle_types: [],
        capacity_range: '',
        business_certificate: null,
        tax_document: null,
        logo: null,
        password: '',
        password_confirmation: '',
    });

    const serviceOptions = [
        'LCL',
        'FCL',
        'Road Transport',
        'Train Transport',
        'Customs Handling',
        'Warehousing'
    ];

    const vehicleOptions = [
        'Trucks',
        'Containers',
        'Vans',
        'Rail Containers'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('freight.register'));
    };

    const handleFileChange = (e, field) => {
        setData(field, e.target.files[0]);
    };

    return (
        <GuestLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-semibold mb-6">Freight Company Registration</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="business_name" value="Business Name" />
                                        <TextInput
                                            id="business_name"
                                            type="text"
                                            name="business_name"
                                            value={data.business_name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.business_name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="business_type" value="Business Type" />
                                        <TextInput
                                            id="business_type"
                                            type="text"
                                            name="business_type"
                                            value={data.business_type}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('business_type', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.business_type} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="registration_number" value="Registration Number" />
                                        <TextInput
                                            id="registration_number"
                                            type="text"
                                            name="registration_number"
                                            value={data.registration_number}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('registration_number', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.registration_number} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="email" value="Email" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="phone" value="Phone" />
                                        <TextInput
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={data.phone}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('phone', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="location" value="Location" />
                                        <TextInput
                                            id="location"
                                            type="text"
                                            name="location"
                                            value={data.location}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('location', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.location} className="mt-2" />
                                    </div>

                                    <div className="col-span-2">
                                        <InputLabel value="Service Types" />
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {serviceOptions.map((service) => (
                                                <label key={service} className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        value={service}
                                                        checked={data.service_types.includes(service)}
                                                        onChange={(e) => {
                                                            const newServices = e.target.checked
                                                                ? [...data.service_types, service]
                                                                : data.service_types.filter(s => s !== service);
                                                            setData('service_types', newServices);
                                                        }}
                                                    />
                                                    <span className="ml-2">{service}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <InputError message={errors.service_types} className="mt-2" />
                                    </div>

                                    <div className="col-span-2">
                                        <InputLabel value="Vehicle Types" />
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {vehicleOptions.map((vehicle) => (
                                                <label key={vehicle} className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        value={vehicle}
                                                        checked={data.vehicle_types.includes(vehicle)}
                                                        onChange={(e) => {
                                                            const newVehicles = e.target.checked
                                                                ? [...data.vehicle_types, vehicle]
                                                                : data.vehicle_types.filter(v => v !== vehicle);
                                                            setData('vehicle_types', newVehicles);
                                                        }}
                                                    />
                                                    <span className="ml-2">{vehicle}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <InputError message={errors.vehicle_types} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="capacity_range" value="Capacity Range" />
                                        <TextInput
                                            id="capacity_range"
                                            type="text"
                                            name="capacity_range"
                                            value={data.capacity_range}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('capacity_range', e.target.value)}
                                            placeholder="e.g., Up to 20 CBM, 40ft container"
                                        />
                                        <InputError message={errors.capacity_range} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password" value="Password" />
                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                        <TextInput
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.password_confirmation} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="business_certificate" value="Business Certificate" />
                                        <input
                                            type="file"
                                            id="business_certificate"
                                            name="business_certificate"
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleFileChange(e, 'business_certificate')}
                                            required
                                        />
                                        <InputError message={errors.business_certificate} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="tax_document" value="Tax Document" />
                                        <input
                                            type="file"
                                            id="tax_document"
                                            name="tax_document"
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleFileChange(e, 'tax_document')}
                                            required
                                        />
                                        <InputError message={errors.tax_document} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="logo" value="Company Logo" />
                                        <input
                                            type="file"
                                            id="logo"
                                            name="logo"
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleFileChange(e, 'logo')}
                                        />
                                        <InputError message={errors.logo} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Register
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default Register; 