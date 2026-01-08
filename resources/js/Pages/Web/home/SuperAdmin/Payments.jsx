import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const Payments = ({ bookingPayments = [], airVehiclePayments = [], seaVehiclePayments = [] }) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: 'bg-green-600 text-white',
            pending: 'bg-yellow-600 text-white',
            cancelled: 'bg-red-600 text-white',
            failed: 'bg-red-600 text-white'
        };
        return statusConfig[status?.toLowerCase()] || 'bg-gray-600 text-white';
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    const PaymentTable = ({ title, payments, emptyMessage = "No payments found" }) => (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
            <div className="bg-[#0A1330] border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1E40AF] text-white">
                                <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">ID</th>
                                <th className="px-4 py-3 text-left font-semibold">Method</th>
                                <th className="px-4 py-3 text-left font-semibold">Amount Paid</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-left font-semibold rounded-tr-lg">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments && payments.length > 0 ? (
                                payments.map((payment, index) => (
                                    <tr 
                                        key={payment.id} 
                                        className={`${index % 2 === 0 ? 'bg-[#081028]' : 'bg-[#0A1330]'} hover:bg-[#1E40AF]/20 transition-colors duration-200 border-b border-gray-600`}
                                    >
                                        <td className="px-4 py-3 text-white">{payment.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{payment.method || 'N/A'}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">
                                            ${typeof payment.amount_paid === 'number' ? payment.amount_paid.toFixed(2) : parseFloat(payment.amount_paid || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                                                {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">
                                            {formatDate(payment.created_at)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Payments - SuperAdmin" />
            
            <div className='flex flex-row bg-[#081028] min-h-screen poppins'>
                <div className='sm:w-full md:w-auto lg:w-auto'>
                    <SideMenu />
                </div>
                
                <div className='flex-1 p-8'>
                    <div className='max-w-7xl mx-auto'>
                        {/* Header */}
                        <div className='mb-8'>
                            <h1 className='text-3xl font-bold text-white mb-2'>Payments</h1>
                            <p className='text-gray-400'>View and manage all payment transactions across booking types</p>
                        </div>

                        {/* Payment Tables */}
                        <div id="payments-section" className="space-y-8">
                            <PaymentTable 
                                title="Booking Payments" 
                                payments={bookingPayments}
                                emptyMessage="No booking payments found"
                            />
                            
                            <PaymentTable 
                                title="Air Vehicle Payments" 
                                payments={airVehiclePayments}
                                emptyMessage="No air vehicle payments found"
                            />
                            
                            <PaymentTable 
                                title="Sea Vehicle Payments" 
                                payments={seaVehiclePayments}
                                emptyMessage="No sea vehicle payments found"
                            />
                        </div>

                        {/* Usage Information */}
                        <div className='mt-8 bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                            <h3 className='text-lg font-semibold text-white mb-3'>Payment Statistics</h3>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-medium text-blue-400'>Booking Payments</h4>
                                    <p className='text-sm text-gray-300'>
                                        Total: {bookingPayments?.length || 0} transactions
                                    </p>
                                </div>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-medium text-green-400'>Air Vehicle Payments</h4>
                                    <p className='text-sm text-gray-300'>
                                        Total: {airVehiclePayments?.length || 0} transactions
                                    </p>
                                </div>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-medium text-purple-400'>Sea Vehicle Payments</h4>
                                    <p className='text-sm text-gray-300'>
                                        Total: {seaVehiclePayments?.length || 0} transactions
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Payments;