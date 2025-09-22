import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";

const CreateUser = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'client',
        phone: '',
        address: '',
        country: '',
        date_of_birth: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('superadmin.users.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    return (
        <>
            <Head title="Create User" />
            <div className="flex flex-row bg-[#081028] min-h-screen poppins">
                <div className="sm:w-full md:w-auto lg:w-auto">
                    <SideMenu />
                </div>

                <div className="flex-1 p-6 text-white">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Create User</h1>
                                <p className="text-gray-400">Add a new user to the system</p>
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

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white placeholder-gray-400"
                                        placeholder="Enter password"
                                        required
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#081028] border border-[#343B4F] rounded text-white placeholder-gray-400"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
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
                                        <option value="vendor">Vendor</option>
                                        <option value="freight">Freight User</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
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

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create User'}
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

export default CreateUser;
