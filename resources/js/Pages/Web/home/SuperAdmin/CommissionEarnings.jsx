import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Download, Filter, X } from 'lucide-react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const CommissionEarnings = ({ earnings = [], adminSummary = {}, breakdown = [] }) => {
    const [filteredEarnings, setFilteredEarnings] = useState(earnings.data || []);
    const [filters, setFilters] = useState({
        serviceType: '',
        status: '',
        startDate: '',
        endDate: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const applyFilters = () => {
        let filtered = earnings.data || [];

        if (filters.serviceType) {
            filtered = filtered.filter(e => e.service_type === filters.serviceType);
        }
        if (filters.status) {
            filtered = filtered.filter(e => e.status === filters.status);
        }

        setFilteredEarnings(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            serviceType: '',
            status: '',
            startDate: '',
            endDate: '',
        });
    };

    const formatCurrency = (amount) => {
        return `LKR ${parseFloat(amount || 0).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: 'bg-green-600/20 text-green-400 border border-green-600',
            pending: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600',
            failed: 'bg-red-600/20 text-red-400 border border-red-600',
        };
        return statusConfig[status?.toLowerCase()] || 'bg-gray-600/20 text-gray-400 border border-gray-600';
    };

    const downloadReport = async () => {
        try {
            const response = await fetch('/superadmin/commission-earnings/export', {
                headers: {
                    'Accept': 'text/csv',
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `commission-earnings-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    return (
        <>
            <Head title="Commission Earnings" />

            <div className='flex flex-row bg-[#081028] min-h-screen poppins'>
                <div className='sm:w-full md:w-auto lg:w-auto'>
                    <SideMenu />
                </div>

                <div className='flex-1 p-8'>
                    <div className='max-w-7xl mx-auto'>
                        {/* Header */}
                        <div className='mb-8'>
                            <h1 className='text-3xl font-bold text-white mb-2'>Commission Earnings</h1>
                            <p className='text-gray-400'>Track admin and service provider commission earnings across all bookings</p>
                        </div>

                        {/* Summary Cards */}
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
                            <div className='bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                                <h3 className='text-sm font-medium text-gray-400 mb-2'>Total Bookings</h3>
                                <p className='text-2xl font-bold text-white'>{adminSummary?.count || 0}</p>
                            </div>

                            <div className='bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                                <h3 className='text-sm font-medium text-gray-400 mb-2'>Admin Total Earned</h3>
                                <p className='text-2xl font-bold text-green-400'>{formatCurrency(adminSummary?.total_earned || 0)}</p>
                            </div>

                            <div className='bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                                <h3 className='text-sm font-medium text-gray-400 mb-2'>Total Commission Generated</h3>
                                <p className='text-2xl font-bold text-blue-400'>{formatCurrency((adminSummary?.total_earned || 0) * 2)}</p>
                            </div>

                            <div className='bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                                <h3 className='text-sm font-medium text-gray-400 mb-2'>Service Types</h3>
                                <p className='text-2xl font-bold text-purple-400'>{breakdown?.length || 0}</p>
                            </div>
                        </div>

                        {/* Service Breakdown */}
                        {breakdown && breakdown.length > 0 && (
                            <div className='bg-[#0A1330] border border-gray-700 rounded-lg p-6 mb-8'>
                                <h2 className='text-xl font-semibold text-white mb-4'>Commission Breakdown by Service Type</h2>
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead>
                                            <tr className='border-b border-gray-700'>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Service Type</th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Bookings</th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Total Booking Amount</th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Avg Commission %</th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Total Commission</th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Admin Share</th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Service Provider Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {breakdown.map((item, index) => (
                                                <tr key={index} className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-[#081028]' : 'bg-[#0B1739]'}`}>
                                                    <td className='px-4 py-3 text-sm text-gray-300 capitalize'>{item.service_type}</td>
                                                    <td className='px-4 py-3 text-sm text-gray-300'>{item.bookings_count}</td>
                                                    <td className='px-4 py-3 text-sm text-gray-300'>{formatCurrency(item.total_booking_amount)}</td>
                                                    <td className='px-4 py-3 text-sm text-gray-300'>{parseFloat(item.avg_commission_rate || 0).toFixed(2)}%</td>
                                                    <td className='px-4 py-3 text-sm font-semibold text-blue-400'>{formatCurrency(item.total_commission)}</td>
                                                    <td className='px-4 py-3 text-sm font-semibold text-green-400'>{formatCurrency(item.admin_total)}</td>
                                                    <td className='px-4 py-3 text-sm font-semibold text-purple-400'>{formatCurrency(item.vendor_total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Filters and Actions */}
                        <div className='bg-[#0A1330] border border-gray-700 rounded-lg p-6 mb-8'>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-xl font-semibold text-white'>Commission Earnings List</h2>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className='flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors'
                                    >
                                        <Filter size={18} />
                                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                                    </button>
                                    <button
                                        onClick={downloadReport}
                                        className='flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors'
                                    >
                                        <Download size={18} />
                                        Export CSV
                                    </button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className='bg-[#081028] p-4 rounded-lg mb-4 border border-gray-700'>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>Service Type</label>
                                            <select
                                                name='serviceType'
                                                value={filters.serviceType}
                                                onChange={handleFilterChange}
                                                className='w-full px-3 py-2 bg-[#0A1330] border border-gray-600 text-white rounded-md focus:border-blue-500 focus:outline-none'
                                            >
                                                <option value=''>All Services</option>
                                                <option value='vehicle'>Vehicle</option>
                                                <option value='warehouse'>Warehouse</option>
                                                <option value='courier'>Courier</option>
                                                <option value='freight'>Freight</option>
                                                <option value='ticket'>Ticket</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>Status</label>
                                            <select
                                                name='status'
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className='w-full px-3 py-2 bg-[#0A1330] border border-gray-600 text-white rounded-md focus:border-blue-500 focus:outline-none'
                                            >
                                                <option value=''>All Status</option>
                                                <option value='paid'>Paid</option>
                                                <option value='pending'>Pending</option>
                                                <option value='failed'>Failed</option>
                                            </select>
                                        </div>

                                        <div className='flex items-end gap-2'>
                                            <button
                                                onClick={resetFilters}
                                                className='flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm'
                                            >
                                                Reset Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Earnings Table */}
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='border-b border-gray-700 bg-[#081028]'>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Booking ID</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Type</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Service</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Service Provider</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Booking Amount</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Commission %</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Admin Amount</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Service Provider Amount</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Status</th>
                                            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-300'>Paid Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEarnings && filteredEarnings.length > 0 ? (
                                            filteredEarnings.map((earning, index) => (
                                                <tr key={earning.id} className={`border-b border-gray-700 hover:bg-[#1E40AF]/20 transition-colors ${index % 2 === 0 ? 'bg-[#081028]' : 'bg-[#0A1330]'}`}>
                                                    <td className='px-4 py-3 text-sm text-white font-medium'>#{earning.booking_id}</td>
                                                    <td className='px-4 py-3 text-sm text-gray-300 capitalize'>{earning.booking_type}</td>
                                                    <td className='px-4 py-3 text-sm text-gray-300 capitalize'>{earning.service_type}</td>
                                                    <td className='px-4 py-3 text-sm text-gray-300'>{earning.vendor?.name || 'N/A'}</td>
                                                    <td className='px-4 py-3 text-sm text-gray-300'>{formatCurrency(earning.booking_amount)}</td>
                                                    <td className='px-4 py-3 text-sm text-gray-300'>{parseFloat(earning.commission_percentage).toFixed(2)}%</td>
                                                    <td className='px-4 py-3 text-sm font-semibold text-green-400'>{formatCurrency(earning.admin_amount)}</td>
                                                    <td className='px-4 py-3 text-sm font-semibold text-purple-400'>{formatCurrency(earning.vendor_amount)}</td>
                                                    <td className='px-4 py-3 text-sm'>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(earning.status)}`}>
                                                            {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className='px-4 py-3 text-sm text-gray-300'>{earning.paid_at ? formatDate(earning.paid_at) : 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan='10' className='px-4 py-8 text-center text-gray-400'>
                                                    No commission earnings found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Info */}
                        {earnings?.meta && (
                            <div className='flex justify-between items-center text-sm text-gray-400'>
                                <span>
                                    Showing {earnings.meta.from} to {earnings.meta.to} of {earnings.meta.total} earnings
                                </span>
                                {earnings.meta.last_page > 1 && (
                                    <div className='flex gap-2'>
                                        {earnings.meta.current_page > 1 && (
                                            <button className='px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm'>
                                                Previous
                                            </button>
                                        )}
                                        {earnings.meta.current_page < earnings.meta.last_page && (
                                            <button className='px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm'>
                                                Next
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommissionEarnings;
