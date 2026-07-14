import React, { useState, useEffect, useCallback } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import { usePage, router, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const Clients = ({ users, counts, filters, pagination }) => {
    const { flash } = usePage().props;

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const performSearch = useCallback(() => {
        router.get('/superadmin/users/clients', {
            search: searchTerm,
            status: statusFilter,
            date_from: dateFrom,
            date_to: dateTo,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [searchTerm, statusFilter, dateFrom, dateTo, perPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        performSearch();
    }, [statusFilter, dateFrom, dateTo, perPage]);

    const handlePageChange = (page) => {
        router.get('/superadmin/users/clients', {
            ...filters,
            page,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'verified':
                return { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]" };
            case 'inreview':
                return { border: "border-[#FDB52A80]", bg: "bg-[#FDB52A33]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
            case 'unverified':
                return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
            case 'blocked':
            case 'rejected':
                return { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]", text: "text-[#FF4757]" };
            default:
                return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
        }
    };

    const formatStatus = (status) => {
        const map = {
            verified: 'Verified',
            unverified: 'Unverified',
            inreview: 'In Review',
            blocked: 'Blocked',
            rejected: 'Rejected',
        };
        return map[status] || status;
    };

    const getInitials = (user) => {
        const first = user.first_name || user.name?.split(' ')[0] || '';
        const last = user.last_name || user.name?.split(' ')[1] || '';
        return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?';
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
                    <div>
                        <h1 className="text-white text-[24px] font-[600]">Clients</h1>
                        <p className="text-[#AEB9E1] text-[13px] mt-0.5">Manage and monitor all registered clients</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="flex flex-row gap-[22px] mb-6 flex-wrap">
                    <StatsCard label="Total Clients" count={counts?.total || 0} color="#CB3CFF" />
                    <StatsCard label="Verified" count={counts?.verified || 0} color="#05C168" />
                    <StatsCard label="Unverified" count={counts?.unverified || 0} color="#AEB9E1" />
                    <StatsCard label="Blocked / Rejected" count={counts?.blocked || 0} color="#FF4757" />
                    <StatsCard label="New This Month" count={counts?.new_this_month || 0} color="#FDB52A" />
                </div>

                {/* Filters */}
                <div className="bg-[#0F1A3A] rounded-lg p-4 border border-gray-700 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
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
                            <option value="verified">Verified</option>
                            <option value="inreview">In Review</option>
                            <option value="unverified">Unverified</option>
                            <option value="blocked">Blocked</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <div className="flex items-center gap-2">
                            <label className="text-[#AEB9E1] text-[12px] whitespace-nowrap">From:</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0E43FB]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[#AEB9E1] text-[12px] whitespace-nowrap">To:</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0E43FB]"
                            />
                        </div>
                        {(searchTerm || statusFilter !== 'all' || dateFrom || dateTo) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                                className="text-[#AEB9E1] text-[12px] hover:text-white transition-colors px-3 py-2 border border-[#343B4F] rounded-md"
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
                        <div className="flex-[1.5]">
                            <h1 className="text-white text-[13px] font-[600]">Client</h1>
                        </div>
                        <div className="flex-[1.2]">
                            <h1 className="text-white text-[13px] font-[600]">Email</h1>
                        </div>
                        <div className="flex-[0.8]">
                            <h1 className="text-white text-[13px] font-[600]">Phone</h1>
                        </div>
                        <div className="flex-[0.8]">
                            <h1 className="text-white text-[13px] font-[600]">Location</h1>
                        </div>
                        <div className="flex-[0.8]">
                            <h1 className="text-white text-[13px] font-[600]">Registered</h1>
                        </div>
                        <div className="flex-[0.8]">
                            <h1 className="text-white text-[13px] font-[600]">Status</h1>
                        </div>
                        <div className="flex-[0.5] text-center">
                            <h1 className="text-white text-[13px] font-[600]">Action</h1>
                        </div>
                    </div>

                    {/* Table Body */}
                    {(!users || users.length === 0) ? (
                        <div className="flex justify-center items-center py-12">
                            <p className="text-[#AEB9E1] text-[14px]">No clients found.</p>
                        </div>
                    ) : (
                        users.map((user) => {
                            const statusStyles = getStatusStyles(user.status);
                            return (
                                <div
                                    key={user.id}
                                    className="flex flex-row w-full border-b border-[#343B4F] items-center px-[24px] py-[14px] hover:bg-[#0F1A3A]/50 transition-colors"
                                >
                                    {/* Client Info */}
                                    <div className="flex-[1.5] flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[#0E43FB33] border border-[#0E43FB50] flex items-center justify-center flex-shrink-0">
                                            {user.avatar ? (
                                                <img
                                                    src={`/uploads/${user.avatar}`}
                                                    alt={user.name}
                                                    className="w-9 h-9 rounded-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <span className="text-[#5B8DEF] text-[12px] font-[600]" style={{ display: user.avatar ? 'none' : 'flex' }}>
                                                {getInitials(user)}
                                            </span>
                                        </div>
                                        <div>
                                            <h1 className="text-[#E0E6F7] text-[13px] font-[500]">{user.name}</h1>
                                            <p className="text-[#AEB9E1] text-[11px]">{user.created_at}</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex-[1.2]">
                                        <p className="text-[#AEB9E1] text-[12px] truncate max-w-[180px]">{user.email}</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex-[0.8]">
                                        <span className="text-[#AEB9E1] text-[12px]">
                                            {user.phone && user.phone !== 'N/A' ? user.phone : (
                                                <span className="text-[#343B4F]">—</span>
                                            )}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex-[0.8]">
                                        <span className="text-[#AEB9E1] text-[12px]">
                                            {user.city && user.country
                                                ? `${user.city}, ${user.country}`
                                                : user.country || user.city || (
                                                    <span className="text-[#343B4F]">—</span>
                                                )
                                            }
                                        </span>
                                    </div>

                                    {/* Registration Date */}
                                    <div className="flex-[0.8]">
                                        <span className="text-[#AEB9E1] text-[12px]">{user.regDate}</span>
                                    </div>

                                    {/* Status */}
                                    <div className="flex-[0.8]">
                                        <div className={`inline-flex items-center gap-1.5 border ${statusStyles.border} ${statusStyles.bg} px-[10px] py-[4px] rounded-[6px]`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                                            <span className={`${statusStyles.text} text-[11px] font-[500]`}>{formatStatus(user.status)}</span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-[0.5] text-center">
                                        <Link
                                            href={`/superadmin/users/${user.id}`}
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
                {pagination && (
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

export default Clients;
