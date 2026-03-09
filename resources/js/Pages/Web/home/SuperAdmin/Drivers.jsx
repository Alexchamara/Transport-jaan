import React, { useState, useEffect, useCallback } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import { usePage, router, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const Drivers = ({ drivers, counts, filters, pagination, vehicleTypes }) => {
    const { flash } = usePage().props;

    const [searchTerm, setSearchTerm]         = useState(filters?.search || '');
    const [statusFilter, setStatusFilter]     = useState(filters?.status || 'all');
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState(filters?.vehicle_type || 'all');
    const [perPage, setPerPage]               = useState(filters?.per_page || 10);
    const [showFlash, setShowFlash]           = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const performSearch = useCallback(() => {
        router.get('/superadmin/users/drivers', {
            search:       searchTerm,
            status:       statusFilter,
            vehicle_type: vehicleTypeFilter,
            per_page:     perPage,
        }, {
            preserveState:  true,
            preserveScroll: true,
            replace:        true,
        });
    }, [searchTerm, statusFilter, vehicleTypeFilter, perPage]);

    useEffect(() => {
        const timer = setTimeout(() => { performSearch(); }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        performSearch();
    }, [statusFilter, vehicleTypeFilter, perPage]);

    const handlePageChange = (page) => {
        router.get('/superadmin/users/drivers', {
            ...filters,
            page,
        }, {
            preserveState:  true,
            preserveScroll: true,
            replace:        true,
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Active':
                return { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]" };
            case 'Inactive':
                return { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]", text: "text-[#FF4757]" };
            default:
                return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
        }
    };

    const isLicenseExpiringSoon = (expiry) => {
        if (!expiry) return false;
        const exp = new Date(expiry);
        const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
    };

    const isLicenseExpired = (expiry) => {
        if (!expiry) return false;
        return new Date(expiry) < new Date();
    };

    return (
        <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">
            {/* Flash Messages */}
            <AnimatePresence>
                {showFlash && flash?.success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50"
                    >
                        {flash.success}
                    </motion.div>
                )}
                {showFlash && flash?.error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50"
                    >
                        {flash.error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>

            <div className="flex-1 px-6 py-6">
                {/* Header */}
                <div className="flex flex-row justify-between items-center mb-6">
                    <h1 className="text-white text-[24px] font-[600]">Drivers</h1>
                </div>

                {/* Stats Cards */}
                <div className="flex flex-row gap-[22px] mb-6 flex-wrap">
                    <StatsCard label="Total Drivers"    count={counts?.total    || 0} color="#CB3CFF" />
                    <StatsCard label="Active Drivers"   count={counts?.active   || 0} color="#05C168" />
                    <StatsCard label="Inactive Drivers" count={counts?.inactive || 0} color="#FF4757" />
                </div>

                {/* Filters */}
                <div className="bg-[#0F1A3A] rounded-lg p-4 border border-gray-700 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, vehicle no, license no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 min-w-[200px] bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0E43FB]"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#0B1739] border border-gray-700 text-white rounded-md px-4 py-2 text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <select
                            value={vehicleTypeFilter}
                            onChange={(e) => setVehicleTypeFilter(e.target.value)}
                            className="bg-[#0B1739] border border-gray-700 text-white rounded-md px-4 py-2 text-sm"
                        >
                            <option value="all">All Vehicle Types</option>
                            {(vehicleTypes || []).map((vt, i) => (
                                <option key={i} value={vt}>{vt}</option>
                            ))}
                        </select>
                        {(searchTerm || statusFilter !== 'all' || vehicleTypeFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setVehicleTypeFilter('all');
                                }}
                                className="text-[#AEB9E1] hover:text-white text-[13px] border border-[#343B4F] px-3 py-2 rounded-md transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] overflow-hidden">
                    {/* Table Header */}
                    <div className="flex flex-row w-full h-[50px] bg-[#0F1A3A] border-b border-[#343B4F] items-center px-[24px]">
                        <div className="flex-[1.4]">
                            <h1 className="text-white text-[13px] font-[600]">Driver</h1>
                        </div>
                        <div className="flex-[1]">
                            <h1 className="text-white text-[13px] font-[600]">Service Provider</h1>
                        </div>
                        <div className="flex-[0.9]">
                            <h1 className="text-white text-[13px] font-[600]">Vehicle Type</h1>
                        </div>
                        <div className="flex-[1]">
                            <h1 className="text-white text-[13px] font-[600]">License Expiry</h1>
                        </div>
                        <div className="flex-[0.8]">
                            <h1 className="text-white text-[13px] font-[600]">Status</h1>
                        </div>
                        <div className="flex-[0.5] text-center">
                            <h1 className="text-white text-[13px] font-[600]">Action</h1>
                        </div>
                    </div>

                    {/* Table Body */}
                    {(!drivers || drivers.length === 0) ? (
                        <div className="flex justify-center items-center py-12">
                            <p className="text-[#AEB9E1] text-[14px]">No drivers found.</p>
                        </div>
                    ) : (
                        drivers.map((driver) => {
                            const ss = getStatusStyles(driver.status);
                            const expired    = isLicenseExpired(driver.license_expiry);
                            const expiringSoon = !expired && isLicenseExpiringSoon(driver.license_expiry);
                            return (
                                <div
                                    key={driver.id}
                                    className="flex flex-row w-full border-b border-[#343B4F] items-center px-[24px] py-[14px] hover:bg-[#0F1A3A]/50 transition-colors"
                                >
                                    {/* Driver Info */}
                                    <div className="flex-[1.4]">
                                        <h1 className="text-[#E0E6F7] text-[13px] font-[500]">{driver.full_name}</h1>
                                        <p className="text-[#AEB9E1] text-[11px]">{driver.email}</p>
                                        <p className="text-[#AEB9E1] text-[11px]">{driver.phone}</p>
                                    </div>

                                    {/* Vendor */}
                                    <div className="flex-[1]">
                                        {driver.vendor_id ? (
                                            <Link
                                                href={`/superadmin/users/service-providers/${driver.vendor_id}/review`}
                                                className="text-[#5B8DEF] text-[12px] hover:text-[#0E43FB] transition-colors"
                                            >
                                                {driver.vendor_name}
                                            </Link>
                                        ) : (
                                            <span className="text-[#AEB9E1] text-[12px]">N/A</span>
                                        )}
                                    </div>

                                    {/* Vehicle Type */}
                                    <div className="flex-[0.9]">
                                        <span className="text-[#AEB9E1] text-[12px]">{driver.vehicle_type || '—'}</span>
                                    </div>

                                    {/* License Expiry */}
                                    <div className="flex-[1]">
                                        {driver.license_expiry ? (
                                            <div className="flex flex-col gap-0.5">
                                                <span className={`text-[12px] font-[500] ${expired ? 'text-[#FF4757]' : expiringSoon ? 'text-[#FDB52A]' : 'text-[#AEB9E1]'}`}>
                                                    {driver.license_expiry}
                                                </span>
                                                {expired && (
                                                    <span className="text-[#FF4757] text-[10px]">Expired</span>
                                                )}
                                                {expiringSoon && (
                                                    <span className="text-[#FDB52A] text-[10px]">Expiring soon</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[#AEB9E1] text-[12px]">—</span>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="flex-[0.8]">
                                        <div className={`inline-flex items-center gap-1.5 border ${ss.border} ${ss.bg} px-[10px] py-[4px] rounded-[6px]`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                            <span className={`${ss.text} text-[11px] font-[500]`}>{driver.status}</span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-[0.5] text-center">
                                        <Link
                                            href={`/superadmin/users/drivers/${driver.id}`}
                                            className="bg-[#0E43FB] text-white text-[12px] px-3 py-1.5 rounded-[5px] hover:bg-[#0A36D6] transition-colors"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex flex-row justify-between items-center mt-5">
                        <h1 className="text-white text-[12px]">
                            {pagination.from || 0} - {pagination.to || 0} of {pagination.total || 0}
                        </h1>
                        <div className="flex items-center gap-3">
                            <select
                                value={perPage}
                                onChange={(e) => setPerPage(parseInt(e.target.value))}
                                className="border border-[#343B4F] bg-[#0A1330] text-white text-[12px] px-[8px] py-[6px] rounded-md"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page <= 1}
                                    className={`px-3 py-1 rounded text-[12px] ${pagination.current_page <= 1 ? 'text-gray-600 cursor-not-allowed' : 'text-white bg-[#0B1739] border border-[#343B4F] hover:bg-[#0F1A3A]'}`}
                                >
                                    Prev
                                </button>
                                {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
                                    let page;
                                    if (pagination.last_page <= 5) {
                                        page = i + 1;
                                    } else if (pagination.current_page <= 3) {
                                        page = i + 1;
                                    } else if (pagination.current_page >= pagination.last_page - 2) {
                                        page = pagination.last_page - 4 + i;
                                    } else {
                                        page = pagination.current_page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 rounded text-[12px] ${
                                                page === pagination.current_page
                                                    ? 'bg-[#0E43FB] text-white'
                                                    : 'text-white bg-[#0B1739] border border-[#343B4F] hover:bg-[#0F1A3A]'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page >= pagination.last_page}
                                    className={`px-3 py-1 rounded text-[12px] ${pagination.current_page >= pagination.last_page ? 'text-gray-600 cursor-not-allowed' : 'text-white bg-[#0B1739] border border-[#343B4F] hover:bg-[#0F1A3A]'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatsCard = ({ label, count, color }) => (
    <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] rounded-[10px] flex items-center px-4">
        <div className="flex flex-row items-center gap-3">
            <div
                className="flex justify-center items-center w-10 h-10 rounded-full"
                style={{ backgroundColor: `${color}20` }}
            >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <div>
                <h2 className="text-[#AEB9E1] text-[12px] font-[400]">{label}</h2>
                <h1 className="text-white text-[18px] font-[600]">{count}</h1>
            </div>
        </div>
    </div>
);

export default Drivers;
