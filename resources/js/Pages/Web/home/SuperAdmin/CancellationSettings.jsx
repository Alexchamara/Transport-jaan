import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const CancellationSettings = ({ settings, flash }) => {
    const { data, setData, put, processing, errors } = useForm({
        warehouse_days: settings.warehouse || 0,
        vehicle_days: settings.vehicle || 0,
    });

    const dayOptions = [0, 1, 2, 3, 5, 7, 10, 14, 30];

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('superadmin.settings.cancellation.update'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Cancellation Settings" />
            
            <div className='flex flex-row bg-[#081028] min-h-screen poppins'>
                <div className='sm:w-full md:w-auto lg:w-auto'>
                    <SideMenu />
                </div>
                
                <div className='flex-1 p-8'>
                    <div className='max-w-4xl mx-auto'>
                        {/* Header */}
                        <div className='mb-8'>
                            <h1 className='text-3xl font-bold text-white mb-2'>Cancellation Settings</h1>
                            <p className='text-gray-400'>Configure cancellation policies for warehouse and vehicle bookings</p>
                        </div>

                        {/* Success Message */}
                        {flash?.success && (
                            <div className='mb-6 bg-green-600/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg'>
                                {flash.success}
                            </div>
                        )}

                        {/* Form */}
                        <div className='bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                            <form onSubmit={handleSubmit} className='space-y-6'>
                                {/* Warehouse Booking Cancellation */}
                                <div className='space-y-2'>
                                    <label htmlFor="warehouse_days" className='block text-sm font-medium text-gray-200'>
                                        Warehouse Booking Cancellation Days
                                    </label>
                                    <select
                                        id="warehouse_days"
                                        value={data.warehouse_days}
                                        onChange={(e) => setData('warehouse_days', parseInt(e.target.value))}
                                        className='w-full px-3 py-2 bg-[#081028] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    >
                                        {dayOptions.map((days) => (
                                            <option key={days} value={days}>
                                                {days === 0 ? 'Same Day Cancellation' : `${days} ${days === 1 ? 'Day' : 'Days'} Before`}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.warehouse_days && (
                                        <p className='text-red-400 text-sm'>{errors.warehouse_days}</p>
                                    )}
                                    <p className='text-xs text-gray-400'>
                                        Customers can cancel warehouse bookings up to {data.warehouse_days === 0 ? 'the same day' : `${data.warehouse_days} ${data.warehouse_days === 1 ? 'day' : 'days'} before`} the booking date.
                                    </p>
                                </div>

                                {/* Vehicle Booking Cancellation */}
                                <div className='space-y-2'>
                                    <label htmlFor="vehicle_days" className='block text-sm font-medium text-gray-200'>
                                        Vehicle Booking Cancellation Days
                                    </label>
                                    <select
                                        id="vehicle_days"
                                        value={data.vehicle_days}
                                        onChange={(e) => setData('vehicle_days', parseInt(e.target.value))}
                                        className='w-full px-3 py-2 bg-[#081028] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    >
                                        {dayOptions.map((days) => (
                                            <option key={days} value={days}>
                                                {days === 0 ? 'Same Day Cancellation' : `${days} ${days === 1 ? 'Day' : 'Days'} Before`}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.vehicle_days && (
                                        <p className='text-red-400 text-sm'>{errors.vehicle_days}</p>
                                    )}
                                    <p className='text-xs text-gray-400'>
                                        Customers can cancel vehicle bookings up to {data.vehicle_days === 0 ? 'the same day' : `${data.vehicle_days} ${data.vehicle_days === 1 ? 'day' : 'days'} before`} the booking date.
                                    </p>
                                </div>

                                {/* Divider */}
                                <hr className='border-gray-700' />

                                {/* Policy Information */}
                                <div className='bg-[#181A2A] border border-gray-600 rounded-lg p-4'>
                                    <h3 className='text-lg font-semibold text-white mb-3'>Current Cancellation Policies</h3>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div className='space-y-1'>
                                            <h4 className='text-sm font-medium text-blue-400'>Warehouse Bookings</h4>
                                            <p className='text-sm text-gray-300'>
                                                {data.warehouse_days === 0 
                                                    ? 'Same day cancellation allowed'
                                                    : `Must cancel ${data.warehouse_days} ${data.warehouse_days === 1 ? 'day' : 'days'} in advance`
                                                }
                                            </p>
                                        </div>
                                        <div className='space-y-1'>
                                            <h4 className='text-sm font-medium text-green-400'>Vehicle Bookings</h4>
                                            <p className='text-sm text-gray-300'>
                                                {data.vehicle_days === 0 
                                                    ? 'Same day cancellation allowed'
                                                    : `Must cancel ${data.vehicle_days} ${data.vehicle_days === 1 ? 'day' : 'days'} in advance`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className='flex justify-end'>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#081028] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                                    >
                                        {processing ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Usage Information */}
                        <div className='mt-8 bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                            <h3 className='text-lg font-semibold text-white mb-3'>How It Works</h3>
                            <div className='space-y-3 text-sm text-gray-300'>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>These settings control how far in advance customers must cancel their bookings to avoid penalties.</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Setting days to 0 allows same-day cancellations without restrictions.</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Changes take effect immediately for new bookings.</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Existing bookings will maintain their original cancellation policy.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CancellationSettings;