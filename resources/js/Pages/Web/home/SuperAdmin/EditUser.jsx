import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";

const EditUser = ({ user }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'client',
        status: user.status || 'verified',
        phone: user.phone || '',
        address: user.address || '',
        country: user.country || '',
        date_of_birth: user.date_of_birth || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting form with data:', data);
        put(route('superadmin.users.update', user.id), {
            onError: (errors) => {
                console.log('Update failed with errors:', errors);
            }
        });
    };

    return (
        <>
            <Head title="Edit User" />
            <div className="flex flex-row bg-[#081028] min-h-screen poppins">
                <div className="sm:w-full md:w-auto lg:w-auto">
                    <SideMenu />
                </div>

                <div className="flex-1 p-6 text-white">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Edit User</h1>
                                <p className="text-gray-400">Update user information</p>
                            </div>
                            <Link
                                href={route('superadmin.Users')}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                            >
                                Back to Users
                            </Link>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-[#0B1739] p-6 rounded-lg border border-[#343B4F]">
                        {/* Display any global errors */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded">
                                <h4 className="text-red-400 font-medium mb-2">Please fix the following errors:</h4>
                                <ul className="text-red-300 text-sm">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white placeholder-gray-400"
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white placeholder-gray-400"
                                        placeholder="Enter email address"
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        User Role *
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white"
                                        required
                                    >
                                        <option value="client">Client</option>
                                        <option value="vendor">Service Provider</option>
                                        <option value="freight">Freight User</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        User Status *
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white"
                                        required
                                    >
                                        <option value="verified">Verified</option>
                                        <option value="unverified">Unverified</option>
                                        <option value="blocked">Blocked</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white placeholder-gray-400"
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white placeholder-gray-400"
                                        placeholder="Enter country"
                                    />
                                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white"
                                    />
                                    {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white placeholder-gray-400"
                                    placeholder="Enter full address"
                                />
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                            </div>

                            {/* Current Status Info */}
                            <div className="bg-[#081028] p-4 rounded border border-[#343B4F]">
                                <h3 className="text-lg font-medium mb-2">Current Status</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-400">Role:</span>
                                        <span className="ml-2 text-sm font-medium capitalize">{data.role}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-400">Status:</span>
                                        <span className={`ml-2 text-sm font-medium capitalize ${
                                            data.status === 'verified' ? 'text-green-400' :
                                            data.status === 'unverified' ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                            {data.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update User'}
                                </button>
                                <Link
                                    href={route('superadmin.Users')}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditUser;
